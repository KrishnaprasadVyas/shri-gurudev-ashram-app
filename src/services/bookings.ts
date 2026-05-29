import { getSupabaseClient } from '../lib/supabase'
import type { Database } from '../types/database.types'
import { Booking, BookingStatus, CreateBookingInput } from '../types/travel'
import { getCurrentUser } from './auth'

type BookingRow = Database['public']['Tables']['bookings']['Row']
type BookingInsertRow = Database['public']['Tables']['bookings']['Insert']

function createTemporaryBookingReference() {
  // TODO(production): Replace this temporary reference with a database-backed sequence.
  return `BK${Date.now()}`
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function mapBookingRow(row: BookingRow): Booking {
  const id = String(row.id)

  return {
    id,
    bookingReference: row.booking_reference,
    packageId: row.package_id,
    userId: row.user_id,
    travelerCount: row.traveler_count,
    specialNotes: row.special_notes,
    totalAmount: row.total_amount,
    paidAmount: row.paid_amount,
    remainingAmount: row.remaining_amount,
    status: mapBookingStatus(row.status),
    createdAt: row.created_at,
  }
}

function mapBookingStatus(status: string): BookingStatus {
  if (status === 'pending' || status === 'verified' || status === 'rejected' || status === 'confirmed') {
    return status
  }

  return 'pending'
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const supabase = getSupabaseClient()
  const totalAmount = toNumber(input.totalAmount)
  const currentUser = await getCurrentUser()

  if (!input.packageId) {
    throw new Error('Package is required before creating a booking.')
  }

  if (!Number.isInteger(input.travelerCount) || input.travelerCount < 1) {
    throw new Error('Traveler count must be at least 1.')
  }

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error('Booking total is invalid. Please select a package with a valid price.')
  }

  if (!currentUser) {
    throw new Error('Please sign in before creating a booking.')
  }

  const insertRow: BookingInsertRow = {
    package_id: input.packageId,
    user_id: currentUser.id,
    traveler_count: input.travelerCount,
    total_amount: totalAmount,
    paid_amount: 0,
    remaining_amount: totalAmount,
    status: 'pending',
    booking_reference: createTemporaryBookingReference(),
    special_notes: input.specialNotes?.trim() ? input.specialNotes.trim() : null,
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert(insertRow)
    .select('*')
    .single()

  if (error) {
    console.log('BOOKING ERROR:', JSON.stringify(error, null, 2))
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('Booking was created but Supabase returned no booking record.')
  }

  return mapBookingRow(data)
}

export async function getBookingsByUser(userId: string): Promise<Booking[]> {
  if (!userId.trim()) {
    throw new Error('User id is required to load booking history.')
  }

  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return (data ?? []).map(mapBookingRow)
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(String((error as { message?: unknown }).message ?? 'Failed to load booking history.'))
    }

    throw new Error('Failed to load booking history.')
  }
}
