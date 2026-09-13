import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { Donation } from '../models/donation'
import { DonationHead } from '../models/donationHead'
import { DonationUser } from '../models/user'
import { generateReceipt, publicReceiptUrl } from '../services/donationReceipt'
import { DonationRequest } from '../middleware/donationAuth'
import { HttpError } from '../errors'

function userId(request: Request) { return (request as DonationRequest).donationUser!.id }
function validatePan(value: unknown) { return typeof value === 'string' && /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.trim().toUpperCase()) }

export function getCanonicalKycDir(): string {
  const cwd = process.cwd()
  const baseDir = path.basename(cwd) === 'backend' ? cwd : path.join(cwd, 'backend')
  return path.resolve(baseDir, 'private_storage', 'kyc')
}

export async function collectorStatus(request: Request, response: Response, next: NextFunction) { try { const user = await DonationUser.findById(userId(request)).select('fullName mobile referralCode role collectorProfile'); if (!user) throw new HttpError(404, 'User not found'); const profile = user.collectorProfile ? { fullName: user.collectorProfile.fullName, status: user.collectorProfile.status, submittedAt: user.collectorProfile.submittedAt, approvedAt: user.collectorProfile.approvedAt, rejectedReason: user.collectorProfile.rejectedReason } : null; response.json({ success: true, data: { collectorId: String(user._id), fullName: user.fullName, mobile: user.mobile, referralCode: user.referralCode, role: user.role, collectorProfile: profile } }) } catch (error) { next(error) } }

export async function applyCollector(request: Request, response: Response, next: NextFunction) {
  try {
    const { fullName, address, panNumber } = request.body ?? {};
    if (!fullName || !address || !validatePan(panNumber)) throw new HttpError(400, 'Full name, address, and valid PAN are required');
    const user = await DonationUser.findById(userId(request));
    if (!user) throw new HttpError(404, 'User not found');
    if (user.role !== 'USER' || user.collectorProfile?.status === 'pending') throw new HttpError(400, 'User is not eligible to apply');
    const files = (request as any).files as Express.Multer.File[] | undefined;
    if (!files?.some((file) => file.fieldname === 'aadharFront') || !files.some((file) => file.fieldname === 'aadharBack')) throw new HttpError(400, 'Both Aadhar front and back images are required');
    const dir = getCanonicalKycDir();
    await fs.promises.mkdir(dir, { recursive: true });
    const saved: Record<string, string> = {};
    for (const file of files) {
      const key = `kyc_${user._id}_${Date.now()}_${file.fieldname}${path.extname(file.originalname)}`;
      await fs.promises.writeFile(path.join(dir, key), file.buffer);
      saved[file.fieldname] = key;
    }
    user.fullName = String(fullName).trim();
    user.role = 'COLLECTOR_PENDING';
    user.collectorProfile = {
      fullName: String(fullName).trim(),
      address: String(address).trim(),
      panNumber: String(panNumber).trim().toUpperCase(),
      aadharFront: { fileKey: saved.aadharFront, uploadedAt: new Date() },
      aadharBack: { fileKey: saved.aadharBack, uploadedAt: new Date() },
      status: 'pending',
      submittedAt: new Date(),
    } as any;
    await user.save();
    response.json({ success: true, message: 'Collector application submitted successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function collectorDashboard(request: Request, response: Response, next: NextFunction) { try { const id = new Types.ObjectId(userId(request)); const stats = await Donation.aggregate([{ $match: { collectorId: id, hasCollectorAttribution: true, status: 'SUCCESS' } }, { $group: { _id: null, totalAmount: { $sum: '$amount' }, donationCount: { $sum: 1 } } }]); const user = await DonationUser.findById(id).select('fullName referralCode').lean(); const recent = await Donation.find({ collectorId: id, hasCollectorAttribution: true, status: 'SUCCESS' }).sort({ createdAt: -1 }).limit(10).select('donor amount donationHead createdAt').lean(); response.json({ success: true, data: { referralCode: user?.referralCode ?? null, collectorName: user?.fullName ?? null, totalAmount: stats[0]?.totalAmount ?? 0, donationCount: stats[0]?.donationCount ?? 0, recentDonations: recent.map((d: any) => ({ donorName: d.donor.anonymousDisplay ? 'Anonymous' : d.donor.name, amount: d.amount, cause: d.donationHead.name, date: d.createdAt })) } }) } catch (error) { next(error) } }

export async function leaderboard(request: Request, response: Response, next: NextFunction) { try { const limit = Math.min(Number(request.query.limit ?? 5) || 5, 20); const data = await Donation.aggregate([{ $match: { collectorId: { $ne: null }, hasCollectorAttribution: true, status: 'SUCCESS' } }, { $group: { _id: '$collectorId', collectorName: { $last: '$collectorName' }, totalAmount: { $sum: '$amount' }, donationCount: { $sum: 1 } } }, { $sort: { totalAmount: -1 } }, { $limit: limit }]); response.json({ leaderboard: data.map((d, i) => ({ rank: i + 1, collectorId: d._id, collectorName: d.collectorName ?? 'Unknown Collector', totalAmount: d.totalAmount, donationCount: d.donationCount })) }) } catch (error) { next(error) } }

export async function collectCashDonation(request: Request, response: Response, next: NextFunction) {
  try {
    const authUser = (request as DonationRequest).donationUser;
    if (!authUser || authUser.role !== 'COLLECTOR_APPROVED') {
      throw new HttpError(403, 'Approved collector status required');
    }

    const collector = await DonationUser.findById(authUser.id);
    if (!collector || collector.collectorDisabled || collector.role !== 'COLLECTOR_APPROVED') {
      throw new HttpError(403, 'Collector account is not authorized or is disabled');
    }

    const { donor: rawDonor, donationHead: rawHead, amount, notes } = request.body ?? {};
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 10 || numericAmount > 10_000_000) {
      throw new HttpError(400, 'Donation amount must be between INR 10 and INR 10,000,000');
    }

    const name = String(rawDonor?.name ?? '').trim();
    const mobile = String(rawDonor?.mobile ?? '').trim();
    const pan = String(rawDonor?.idNumber ?? rawDonor?.panNumber ?? '').trim().toUpperCase();
    const address = String(rawDonor?.address ?? '').trim();

    if (!name || !mobile || !pan) {
      throw new HttpError(400, 'Donor name, mobile number, and PAN are required');
    }
    if (!validatePan(pan)) {
      throw new HttpError(400, 'Invalid PAN number format');
    }

    const headId = String(rawHead?.id ?? rawHead?.key ?? '');
    const head = await DonationHead.findOne({
      $or: [
        { key: headId.toLowerCase() },
        { _id: Types.ObjectId.isValid(headId) ? headId : undefined },
      ],
      isActive: true,
    }).lean();

    const headName = head
      ? (typeof head.name === 'string' ? head.name : (head.name?.en || head.name?.hi || 'General Seva'))
      : 'General Seva';

    const receiptToken = crypto.randomBytes(32).toString('hex');
    const receiptNumber = `GRD-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

    const donation = await Donation.create({
      user: null,
      collectorId: collector._id,
      collectorName: collector.fullName,
      hasCollectorAttribution: true,
      donor: {
        name,
        mobile,
        address: address || 'Ashram Field Collection',
        idType: 'PAN',
        idNumber: pan,
        anonymousDisplay: Boolean(rawDonor?.anonymousDisplay),
      },
      donationHead: {
        id: head ? String(head._id) : 'general',
        key: head ? head.key : 'general',
        name: headName,
      },
      amount: numericAmount,
      paymentMethod: 'CASH',
      status: 'SUCCESS',
      transactionRef: `CASH-${collector.referralCode || 'OFFLINE'}-${Date.now()}`,
      receiptNumber,
      receiptToken,
      notes: notes ? String(notes).trim() : undefined,
    });

    const filePath = await generateReceipt(donation);
    donation.receiptUrl = publicReceiptUrl(filePath, donation);
    await donation.save();

    response.status(201).json({
      success: true,
      message: 'Cash donation recorded successfully',
      donationId: donation._id,
      receiptNumber: donation.receiptNumber,
      receiptUrl: donation.receiptUrl,
      receiptToken,
    });
  } catch (error) {
    next(error);
  }
}
