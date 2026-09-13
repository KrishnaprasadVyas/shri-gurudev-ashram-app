jest.mock("../services/razorpay", () => ({
  razorpayWebhookSecret: "whsec_test_secret_12345",
  razorpayKeySecret: "keysec_test_123",
}))

jest.mock("../services/supabaseAdmin", () => {
  const maybeSingleMock = jest.fn()
  const eqMock = jest.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
  const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
  const updateEqMock = jest.fn().mockResolvedValue({ error: null })
  const updateMock = jest.fn().mockReturnValue({ eq: updateEqMock })
  const insertMock = jest.fn().mockResolvedValue({ error: null })

  return {
    supabaseAdmin: {
      from: jest.fn().mockImplementation((table: string) => {
        if (table === "razorpay_webhook_events") {
          return { insert: insertMock }
        }
        if (table === "seva_bookings") {
          return {
            select: selectMock,
            update: updateMock,
          }
        }
        return { select: selectMock, update: updateMock, insert: insertMock }
      }),
      rpc: jest.fn().mockResolvedValue({ error: null }),
    },
    __mocks: {
      maybeSingleMock,
      eqMock,
      selectMock,
      updateEqMock,
      updateMock,
      insertMock,
    },
  }
})

jest.mock("../models/donation", () => ({
  Donation: { findOne: jest.fn().mockResolvedValue(null) },
}))

jest.mock("../models/nityaAnnadan", () => ({
  NityaAnnadanBooking: { findOne: jest.fn().mockResolvedValue(null) },
}))

import crypto from "crypto"
import { razorpayWebhookRouter } from "../routes/razorpayWebhook"
import { supabaseAdmin } from "../services/supabaseAdmin"

function createSignedPayload(payloadObj: any, secret = "whsec_test_secret_12345") {
  const rawBody = Buffer.from(JSON.stringify(payloadObj))
  const signature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
  return { rawBody, signature }
}

describe("Razorpay Webhook Handler", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("calls next with error when x-razorpay-signature header is missing", async () => {
    const req = {
      headers: { "x-razorpay-event-id": "evt_123" },
      body: Buffer.from(JSON.stringify({ event: "payment.captured" })),
    } as any
    const res = { json: jest.fn() } as any
    const next = jest.fn()

    const handler = (razorpayWebhookRouter as any).stack[0]?.route?.stack[0]?.handle
    await handler(req, res, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: expect.stringMatching(/Missing Razorpay webhook signature/i),
      })
    )
  })

  it("calls next with error when webhook signature is invalid", async () => {
    const payload = { event: "payment.captured" }
    const { rawBody } = createSignedPayload(payload, "wrong_secret")

    const req = {
      headers: {
        "x-razorpay-signature": "a".repeat(64),
        "x-razorpay-event-id": "evt_123",
      },
      body: rawBody,
    } as any
    const res = { json: jest.fn() } as any
    const next = jest.fn()

    const handler = (razorpayWebhookRouter as any).stack[0]?.route?.stack[0]?.handle
    await handler(req, res, next)

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        message: expect.stringMatching(/Invalid Razorpay webhook signature/i),
      })
    )
  })

  it("reconciles Yajman Seva booking payment on payment.captured event", async () => {
    const payload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_test_seva_999",
            order_id: "order_seva_888",
            amount: 510000,
            status: "captured",
          },
        },
      },
    }

    const { rawBody, signature } = createSignedPayload(payload)

    const mocks = (require("../services/supabaseAdmin") as any).__mocks
    mocks.maybeSingleMock.mockResolvedValueOnce({
      data: {
        id: "seva-uuid-1",
        status: "payment_pending",
        razorpay_order_id: "order_seva_888",
      },
      error: null,
    })

    const req = {
      headers: {
        "x-razorpay-signature": signature,
        "x-razorpay-event-id": "evt_unique_12345",
      },
      body: rawBody,
    } as any
    const res = { json: jest.fn() } as any
    const next = jest.fn()

    const handler = (razorpayWebhookRouter as any).stack[0]?.route?.stack[0]?.handle
    await handler(req, res, next)

    expect(res.json).toHaveBeenCalledWith({ received: true, sevaBooking: true })
    expect(supabaseAdmin.from).toHaveBeenCalledWith("seva_bookings")
    expect(next).not.toHaveBeenCalled()
  })
})
