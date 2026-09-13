import { Router } from 'express'
import { optionalDonationAuth, requireDonationAuth } from '../middleware/donationAuth'
import { createDonation, createDonationOrder, donationReceipt, donationStatus, lastProfile, userDonations, verifyDonationPayment } from '../controllers/donations'
import { collectorDashboard, leaderboard } from '../controllers/collector'

import rateLimit from 'express-rate-limit'

export const donationsRouter = Router()

const isDev = process.env.NODE_ENV !== 'production'
const createLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: isDev ? 1000 : 30, standardHeaders: true, legacyHeaders: false })
const statusLimiter = rateLimit({ windowMs: 60 * 1000, max: isDev ? 1000 : 30, standardHeaders: true, legacyHeaders: false })

donationsRouter.post('/create', createLimiter, optionalDonationAuth, createDonation)
donationsRouter.post('/create-order', createLimiter, optionalDonationAuth, createDonationOrder)
donationsRouter.post('/verify-payment', createLimiter, optionalDonationAuth, verifyDonationPayment)
donationsRouter.get('/:id/status', statusLimiter, optionalDonationAuth, donationStatus)
donationsRouter.get('/:id/receipt', statusLimiter, optionalDonationAuth, donationReceipt)
donationsRouter.get('/me/last-profile', requireDonationAuth, lastProfile)
donationsRouter.get('/history', requireDonationAuth, userDonations)
donationsRouter.get('/leaderboard', leaderboard)
donationsRouter.get('/my-collector-stats', requireDonationAuth, collectorDashboard)
