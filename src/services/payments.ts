import api from '../api/axiosClient'

export type RazorpayOrder = {
  id: string
  amount: number
  currency: string
}

export type CreateRazorpayOrderResponse = {
  order: RazorpayOrder
  booking: unknown
}

export type VerifyRazorpayPaymentInput = {
  bookingId: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export async function createRazorpayOrder(bookingId: string): Promise<CreateRazorpayOrderResponse> {
  const { data } = await api.post<CreateRazorpayOrderResponse>('/api/payments/create-order', { bookingId })
  return data
}

export async function verifyRazorpayPayment(input: VerifyRazorpayPaymentInput): Promise<void> {
  await api.post('/api/payments/verify', input)
}
