import 'dotenv/config'
import Razorpay from 'razorpay'

function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export const razorpayKeySecret = getRequiredEnv('RAZORPAY_KEY_SECRET')
export const razorpayWebhookSecret = getRequiredEnv('RAZORPAY_WEBHOOK_SECRET')

export const razorpay = new Razorpay({
  key_id: getRequiredEnv('RAZORPAY_KEY_ID'),
  key_secret: razorpayKeySecret,
})
