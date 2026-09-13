jest.mock("../services/donationReceipt", () => ({
  generateReceipt: jest.fn().mockResolvedValue("/mock/path/receipt.pdf"),
  publicReceiptUrl: jest.fn().mockReturnValue("https://example.com/receipt.pdf"),
}))

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock("../models/user", () => ({
  DonationUser: {
    findById: jest.fn(),
  },
}))

jest.mock("../models/donation", () => ({
  Donation: {
    create: jest.fn(),
  },
}))

jest.mock("../models/donationHead", () => ({
  DonationHead: {
    findOne: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: "507f1f77bcf86cd799439099",
        key: "general",
        name: "General Seva",
        isActive: true,
      }),
    }),
  },
}))

import { collectCashDonation, applyCollector } from "../controllers/collector"
import { DonationUser } from "../models/user"
import { Donation } from "../models/donation"

describe("Collector Cash Donation Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("rejects request if user is not COLLECTOR_APPROVED", async () => {
    const request = {
      donationUser: { id: "col_1", role: "USER" },
      body: {
        amount: 500,
        donor: { name: "Ramesh", mobile: "9876543210", idNumber: "ABCDE1234F" },
      },
    } as any

    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any
    const next = jest.fn()

    await collectCashDonation(request, response, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        message: expect.stringMatching(/Approved collector status required/),
      })
    )
  })

  it("rejects request if collector account is disabled in database", async () => {
    const request = {
      donationUser: { id: "col_1", role: "COLLECTOR_APPROVED" },
      body: {
        amount: 500,
        donor: { name: "Ramesh", mobile: "9876543210", idNumber: "ABCDE1234F" },
      },
    } as any

    ;(DonationUser.findById as jest.Mock).mockResolvedValue({
      _id: "col_1",
      fullName: "Collector Sharma",
      role: "COLLECTOR_APPROVED",
      collectorDisabled: true,
    })

    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any
    const next = jest.fn()

    await collectCashDonation(request, response, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        message: expect.stringMatching(/Collector account is not authorized or is disabled/),
      })
    )
  })

  it("rejects donation if amount is invalid or below INR 10", async () => {
    const request = {
      donationUser: { id: "col_1", role: "COLLECTOR_APPROVED" },
      body: {
        amount: 5,
        donor: { name: "Ramesh", mobile: "9876543210", idNumber: "ABCDE1234F" },
      },
    } as any

    ;(DonationUser.findById as jest.Mock).mockResolvedValue({
      _id: "col_1",
      fullName: "Collector Sharma",
      role: "COLLECTOR_APPROVED",
      collectorDisabled: false,
    })

    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any
    const next = jest.fn()

    await collectCashDonation(request, response, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: expect.stringMatching(/amount must be between/),
      })
    )
  })

  it("rejects donation if donor PAN is invalid", async () => {
    const request = {
      donationUser: { id: "col_1", role: "COLLECTOR_APPROVED" },
      body: {
        amount: 500,
        donor: { name: "Ramesh", mobile: "9876543210", idNumber: "INVALID_PAN" },
      },
    } as any

    ;(DonationUser.findById as jest.Mock).mockResolvedValue({
      _id: "col_1",
      fullName: "Collector Sharma",
      role: "COLLECTOR_APPROVED",
      collectorDisabled: false,
    })

    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any
    const next = jest.fn()

    await collectCashDonation(request, response, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: expect.stringMatching(/Invalid PAN number format/),
      })
    )
  })

  it("successfully creates cash donation, generates receipt, and returns 201", async () => {
    const request = {
      donationUser: { id: "col_1", role: "COLLECTOR_APPROVED" },
      body: {
        amount: 1000,
        donor: {
          name: "Ramesh Gupta",
          mobile: "9876543210",
          idNumber: "ABCDE1234F",
          address: "Malkapur",
        },
        donationHead: { key: "general" },
      },
    } as any

    ;(DonationUser.findById as jest.Mock).mockResolvedValue({
      _id: "col_1",
      fullName: "Collector Sharma",
      role: "COLLECTOR_APPROVED",
      collectorDisabled: false,
      referralCode: "CS01",
    })

    const mockDonationDoc = {
      _id: "don_12345",
      receiptNumber: "GRD-2026-TEST",
      receiptToken: "token_abc123",
      receiptUrl: "https://example.com/receipt.pdf",
      save: jest.fn().mockResolvedValue(true),
    }

    ;(Donation.create as jest.Mock).mockResolvedValue(mockDonationDoc)

    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any
    const next = jest.fn()

    await collectCashDonation(request, response, next)

    expect(response.status).toHaveBeenCalledWith(201)
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Cash donation recorded successfully",
        donationId: "don_12345",
        receiptNumber: "GRD-2026-TEST",
        receiptToken: expect.any(String),
      })
    )
    expect(next).not.toHaveBeenCalled()
  })

  describe("applyCollector", () => {
    const validFiles = [
      { fieldname: "aadharFront", originalname: "front.jpg", buffer: Buffer.from("front") },
      { fieldname: "aadharBack", originalname: "back.jpg", buffer: Buffer.from("back") },
    ]

    it("rejects application if user is already COLLECTOR_APPROVED", async () => {
      const request = {
        donationUser: { id: "user_1" },
        body: { fullName: "Jane Doe", address: "123 Street", panNumber: "ABCDE1234F" },
        files: validFiles,
      } as any
      const response = { json: jest.fn() } as any
      const next = jest.fn()

      ;(DonationUser.findById as jest.Mock).mockResolvedValue({
        _id: "user_1",
        role: "COLLECTOR_APPROVED",
      })

      await applyCollector(request, response, next)
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          message: "User is not eligible to apply",
        })
      )
    })

    it("rejects application if collector application is already pending", async () => {
      const request = {
        donationUser: { id: "user_2" },
        body: { fullName: "Jane Doe", address: "123 Street", panNumber: "ABCDE1234F" },
        files: validFiles,
      } as any
      const response = { json: jest.fn() } as any
      const next = jest.fn()

      ;(DonationUser.findById as jest.Mock).mockResolvedValue({
        _id: "user_2",
        role: "COLLECTOR_PENDING",
        collectorProfile: { status: "pending" },
      })

      await applyCollector(request, response, next)
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          message: "User is not eligible to apply",
        })
      )
    })

    it("allows reapplication if previous application was rejected", async () => {
      const request = {
        donationUser: { id: "user_3" },
        body: { fullName: "Jane Doe", address: "123 Street", panNumber: "ABCDE1234F" },
        files: validFiles,
      } as any
      const response = { json: jest.fn() } as any
      const next = jest.fn()

      const mockUser = {
        _id: "user_3",
        role: "USER",
        collectorProfile: { status: "rejected", rejectedReason: "Blurry images" },
        save: jest.fn().mockResolvedValue(true),
      }
      ;(DonationUser.findById as jest.Mock).mockResolvedValue(mockUser)

      await applyCollector(request, response, next)
      expect(mockUser.save).toHaveBeenCalled()
      expect(mockUser.role).toBe("COLLECTOR_PENDING")
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Collector application submitted successfully.",
        })
      )
      expect(next).not.toHaveBeenCalled()
    })
  })
})
