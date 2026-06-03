declare module 'react-native-razorpay' {
  export type RazorpayCheckoutSuccess = {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }

  export type RazorpayCheckoutOptions = {
    key: string
    amount: number
    currency: string
    name: string
    description?: string
    order_id: string
    prefill?: {
      name?: string
      email?: string
      contact?: string
    }
    theme?: {
      color?: string
    }
  }

  const RazorpayCheckout: {
    open(options: RazorpayCheckoutOptions): Promise<RazorpayCheckoutSuccess>
  }

  export default RazorpayCheckout
}
