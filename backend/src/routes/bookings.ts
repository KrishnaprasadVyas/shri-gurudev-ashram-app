import { Router } from 'express'
import { HttpError } from '../errors'
import { AuthenticatedRequest, requireAuth } from '../middleware/auth'
import { supabaseAdmin } from '../services/supabaseAdmin'

export const bookingsRouter = Router()

type CreateBookingBody = {
  packageId?: string
  travelerCount?: number
  specialNotes?: string
}

bookingsRouter.post('/', requireAuth, async (request, response, next) => {
  try {
    const { packageId, travelerCount, specialNotes } = request.body as CreateBookingBody

    if (!packageId) {
      throw new HttpError(400, 'packageId is required')
    }

    if (typeof travelerCount !== 'number' || !Number.isInteger(travelerCount) || travelerCount < 1) {
      throw new HttpError(400, 'travelerCount must be a positive integer')
    }

    const validatedTravelerCount = travelerCount

    const { data: travelPackage, error: packageError } = await supabaseAdmin
      .from('travel_packages')
      .select('id, price, is_active, remaining_seats')
      .eq('id', packageId)
      .single()

    if (packageError || !travelPackage) {
      throw new HttpError(404, 'Travel package not found')
    }

    if (!travelPackage.is_active) {
      throw new HttpError(400, 'Travel package is not active')
    }

    if (travelPackage.remaining_seats < validatedTravelerCount) {
      throw new HttpError(400, 'Not enough seats available')
    }

    const totalAmount = Number(travelPackage.price) * validatedTravelerCount

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      throw new HttpError(400, 'Travel package has an invalid price')
    }

    const bookingReference = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`
    const authRequest = request as AuthenticatedRequest

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        user_id: authRequest.userId,
        package_id: packageId,
        status: 'payment_pending',
        total_amount: totalAmount,
        traveler_count: validatedTravelerCount,
        special_notes: specialNotes?.trim() || null,
        booking_reference: bookingReference,
      })
      .select('*')
      .single()

    if (bookingError || !booking) {
      throw new HttpError(500, bookingError?.message ?? 'Failed to create booking')
    }

    response.status(201).json({ booking })
  } catch (error) {
    next(error)
  }
})

bookingsRouter.get('/', requireAuth, async (request, response, next) => {
  try {
    const authRequest = request as AuthenticatedRequest

    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('user_id', authRequest.userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new HttpError(500, error.message)
    }

    response.json({ bookings: bookings ?? [] })
  } catch (error) {
    next(error)
  }
})

bookingsRouter.get('/:bookingId', requireAuth, async (request, response, next) => {
  try {
    const authRequest = request as AuthenticatedRequest
    const { bookingId } = request.params

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      throw new HttpError(404, 'Booking not found')
    }

    if (booking.user_id !== authRequest.userId) {
      throw new HttpError(403, 'Booking does not belong to the authenticated user')
    }

    response.json({ booking })
  } catch (error) {
    next(error)
  }
})
