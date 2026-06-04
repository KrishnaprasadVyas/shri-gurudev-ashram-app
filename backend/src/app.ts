import 'dotenv/config'
import express, { NextFunction, Request, Response } from 'express'
import { HttpError } from './errors'
import { bookingsRouter } from './routes/bookings'
import { paymentsRouter } from './routes/payments'
import { razorpayWebhookRouter } from './routes/razorpayWebhook'
import { usersRouter } from './routes/users'

export const app = express()

app.use('/api/webhooks/razorpay', express.raw({ type: 'application/json' }), razorpayWebhookRouter)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/bookings', bookingsRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/users', usersRouter)

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  const status = error instanceof HttpError ? error.status : 500
  const message = error instanceof Error ? error.message : 'Internal server error'

  response.status(status).json({
    error: message,
  })
})

export function startServer() {
  const port = Number(process.env.PORT ?? 3000)

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('Missing or invalid environment variable: PORT')
  }

  return app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`)
  })
}
