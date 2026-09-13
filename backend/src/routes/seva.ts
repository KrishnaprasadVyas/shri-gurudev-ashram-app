import { Router } from 'express'
import { HttpError } from '../errors'
import { AuthenticatedRequest, optionalAuth, requireAuth } from '../middleware/auth'
import { supabaseAdmin } from '../services/supabaseAdmin'
import crypto from 'crypto'

export const sevaRouter = Router()

// Common Seva Types from frontend (Yajman, Gau Seva, Temple Seva, etc.)
type SevaType = 'yajman' | 'gau_seva' | 'temple_seva' | 'special_pooja' | 'event'

function generateSevaReference(type: string): string {
  const prefix = type === 'yajman' ? 'YAJ' : 'SEV'
  const random = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `${prefix}-${random}`
}

sevaRouter.post('/', requireAuth, async (request, response, next) => {
  try {
    const {
      sevaType,
      sevaDate,
      fullName,
      phoneNumber,
      totalAmount, // Legacy fallback
      notes,
      sevaPackageId,
    } = request.body

    if (!sevaDate || !fullName || !phoneNumber) {
      throw new HttpError(400, 'Missing required seva fields')
    }

    if (sevaType === 'annadan') {
      throw new HttpError(400, 'Nitya Annadan seva is managed via the donation backend (/api/annadan)')
    }

    let numericAmount = 0
    let resolvedSevaType = sevaType

    if (sevaPackageId) {
      const { data: sevaPackage, error: sevaPackageError } = await supabaseAdmin
        .from('seva_packages')
        .select('price, is_active, booking_enabled, seva_type')
        .eq('id', sevaPackageId)
        .is('deleted_at', null)
        .single()

      if (sevaPackageError || !sevaPackage) {
        throw new HttpError(404, 'Seva package not found')
      }
      if (!sevaPackage.is_active || !sevaPackage.booking_enabled) {
        throw new HttpError(400, 'Selected Seva package is not active or booking is disabled')
      }

      numericAmount = Number(sevaPackage.price)
      resolvedSevaType = sevaPackage.seva_type
    } else {
      if (!sevaType || !totalAmount) {
        throw new HttpError(400, 'Missing required seva fields')
      }
      numericAmount = Number(totalAmount)
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new HttpError(400, 'Invalid total amount')
      }
    }

    const bookingReference = generateSevaReference(resolvedSevaType)
    const userId = (request as AuthenticatedRequest).userId

    const { data, error } = await supabaseAdmin
      .from('seva_bookings')
      .insert({
        booking_reference: bookingReference,
        user_id: userId,
        seva_type: resolvedSevaType,
        seva_package_id: sevaPackageId ?? null,
        seva_date: sevaDate,
        full_name: fullName,
        phone_number: phoneNumber,
        total_amount: numericAmount,
        status: 'payment_pending',
        notes: notes ?? null,
      })
      .select()
      .single()

    if (error || !data) {
      console.error('Error creating seva booking:', error)
      throw new HttpError(500, 'Failed to create seva booking')
    }

    // Convert keys from snake_case to camelCase to match frontend expectations
    response.status(201).json({
      success: true,
      data: {
        id: data.id,
        bookingReference: data.booking_reference,
        userId: data.user_id,
        sevaType: data.seva_type,
        sevaDate: data.seva_date,
        fullName: data.full_name,
        phoneNumber: data.phone_number,
        totalAmount: data.total_amount,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    })
  } catch (error) {
    next(error)
  }
})

sevaRouter.get('/upcoming', optionalAuth, async (request, response, next) => {
  try {
    const userId = (request as AuthenticatedRequest).userId
    if (!userId) {
      response.json([])
      return
    }
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabaseAdmin
      .from('seva_bookings')
      .select('*')
      .eq('user_id', userId)
      .neq('seva_type', 'annadan')
      .in('status', ['paid', 'payment_pending'])
      .gte('seva_date', today)
      .order('seva_date', { ascending: true })

    if (error) {
      console.error('Error fetching upcoming sevas:', error)
      throw new HttpError(500, 'Failed to fetch upcoming sevas')
    }

    const formattedData = (data || []).map(b => ({
      id: b.id,
      bookingReference: b.booking_reference,
      userId: b.user_id,
      sevaType: b.seva_type,
      sevaPackageId: b.seva_package_id,
      sevaDate: b.seva_date,
      fullName: b.full_name,
      phoneNumber: b.phone_number,
      totalAmount: b.total_amount,
      status: b.status,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    }))

    response.json(formattedData)
  } catch (error) {
    next(error)
  }
})

sevaRouter.get('/history', requireAuth, async (request, response, next) => {
  try {
    const userId = (request as AuthenticatedRequest).userId

    const { data, error } = await supabaseAdmin
      .from('seva_bookings')
      .select('*')
      .eq('user_id', userId)
      .neq('seva_type', 'annadan')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching seva history:', error)
      throw new HttpError(500, 'Failed to fetch seva history')
    }

    const formattedData = (data || []).map(b => ({
      id: b.id,
      bookingReference: b.booking_reference,
      userId: b.user_id,
      sevaType: b.seva_type,
      sevaPackageId: b.seva_package_id,
      sevaDate: b.seva_date,
      fullName: b.full_name,
      phoneNumber: b.phone_number,
      totalAmount: b.total_amount,
      status: b.status,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    }))

    response.json(formattedData)
  } catch (error) {
    next(error)
  }
})

sevaRouter.get('/pricing', async (_request, response, next) => {
  try {
    const yajmanAmount = Number(process.env.YAJMAN_SEVA_PRICE ?? 5100)

    response.json({
      success: true,
      pricing: {
        yajman: yajmanAmount,
      },
    })
  } catch (error) {
    next(error)
  }
})

sevaRouter.get('/availability', async (request, response, next) => {
  try {
    const type = ((request.query.type as string) || '').toLowerCase()
    const month = request.query.month as string // e.g. "2026-07"

    if (!type || type !== 'yajman') {
      throw new HttpError(400, 'type query parameter must be yajman for Supabase Seva backend')
    }

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new HttpError(400, 'month query parameter is required (format YYYY-MM)')
    }

    const [yearStr, monthStr] = month.split('-')
    const year = Number(yearStr)
    const monthNum = Number(monthStr)
    const startDate = `${month}-01`
    const lastDayNum = new Date(year, monthNum, 0).getDate()
    const endDate = `${month}-${String(lastDayNum).padStart(2, '0')}`

    const { data: bookings, error } = await supabaseAdmin
      .from('seva_bookings')
      .select('seva_date, status')
      .eq('seva_type', type)
      .gte('seva_date', startDate)
      .lte('seva_date', endDate)
      .in('status', ['paid', 'payment_pending'])

    if (error) {
      console.error('Error fetching monthly availability:', error)
      throw new HttpError(500, 'Failed to fetch monthly availability')
    }

    const countsByDate: Record<string, number> = {}
    if (bookings) {
      for (const b of bookings) {
        if (b.seva_date) {
          countsByDate[b.seva_date] = (countsByDate[b.seva_date] || 0) + 1
        }
      }
    }

    const envCapKey = `SEVA_CAPACITY_${type.toUpperCase()}`
    const defaultCapacity = 50
    const capacity = Number(process.env[envCapKey] ?? defaultCapacity)

    const availabilityMap: Record<string, { booked: number; capacity: number; remaining: number; available: boolean }> = {}

    for (let day = 1; day <= lastDayNum; day++) {
      const dateKey = `${month}-${String(day).padStart(2, '0')}`
      const booked = countsByDate[dateKey] || 0
      const remaining = Math.max(0, capacity - booked)
      availabilityMap[dateKey] = {
        booked,
        capacity,
        remaining,
        available: remaining > 0,
      }
    }

    response.json({
      success: true,
      type,
      month,
      availability: availabilityMap,
    })
  } catch (error) {
    next(error)
  }
})

sevaRouter.get('/:type/availability', async (request, response, next) => {
  try {
    const type = request.params.type
    const month = request.query.month as string
    const date = request.query.date as string

    if (type !== 'yajman') {
      throw new HttpError(400, 'Only yajman type is supported by Supabase Seva backend')
    }

    const envCapKey = `SEVA_CAPACITY_${type.toUpperCase()}`
    const defaultCapacity = 50
    const capacity = Number(process.env[envCapKey] ?? defaultCapacity)

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [yearStr, monthStr] = month.split('-')
      const year = Number(yearStr)
      const monthNum = Number(monthStr)
      const startDate = `${month}-01`
      const lastDayNum = new Date(year, monthNum, 0).getDate()
      const endDate = `${month}-${String(lastDayNum).padStart(2, '0')}`

      const { data: bookings, error } = await supabaseAdmin
        .from('seva_bookings')
        .select('seva_date, status')
        .eq('seva_type', type)
        .gte('seva_date', startDate)
        .lte('seva_date', endDate)
        .in('status', ['paid', 'payment_pending'])

      if (error) {
        console.error('Error fetching monthly availability:', error)
        throw new HttpError(500, 'Failed to fetch monthly availability')
      }

      const countsByDate: Record<string, number> = {}
      if (bookings) {
        for (const b of bookings) {
          if (b.seva_date) {
            countsByDate[b.seva_date] = (countsByDate[b.seva_date] || 0) + 1
          }
        }
      }

      const availabilityMap: Record<string, { booked: number; capacity: number; remaining: number; available: boolean }> = {}

      for (let day = 1; day <= lastDayNum; day++) {
        const dateKey = `${month}-${String(day).padStart(2, '0')}`
        const booked = countsByDate[dateKey] || 0
        const remaining = Math.max(0, capacity - booked)
        availabilityMap[dateKey] = {
          booked,
          capacity,
          remaining,
          available: remaining > 0,
        }
      }

      response.json({
        success: true,
        type,
        month,
        availability: availabilityMap,
      })
      return
    }

    if (!date) {
      throw new HttpError(400, 'Date or month parameter is required')
    }

    const { count, error } = await supabaseAdmin
      .from('seva_bookings')
      .select('*', { count: 'exact', head: true })
      .eq('seva_type', type)
      .eq('seva_date', date)
      .in('status', ['paid', 'payment_pending'])

    if (error) {
      console.error('Error fetching availability:', error)
      throw new HttpError(500, 'Failed to check availability')
    }

    const availableSeats = capacity - (count || 0)

    response.json({
      available: availableSeats > 0,
      remainingSeats: Math.max(0, availableSeats)
    })
  } catch (error) {
    next(error)
  }
})
