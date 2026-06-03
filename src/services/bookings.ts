import api from '../api/axiosClient'
import { Booking, BookingStatus, CreateBookingInput } from '../types/travel'

type BookingApiRow = {
  id: string
  booking_reference: string
  package_id: string
  user_id: string
  traveler_count: number
  special_notes: string | null
  total_amount: number
  status: string
  created_at?: string
}

function mapBookingStatus(status: string): BookingStatus {
  if (status === 'payment_pending' || status === 'paid' || status === 'cancelled' || status === 'completed') {
    return status
  }

  return 'payment_pending'
}

function mapBookingRow(row: BookingApiRow): Booking {
  return {
    id: row.id,
    bookingReference: row.booking_reference,
    packageId: row.package_id,
    userId: row.user_id,
    travelerCount: row.traveler_count,
    specialNotes: row.special_notes,
    totalAmount: row.total_amount,
    status: mapBookingStatus(row.status),
    createdAt: row.created_at,
  }
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const { data } = await api.post<{ booking: BookingApiRow }>('/api/bookings', input)
  return mapBookingRow(data.booking)
}

export async function getBookingsByUser(_userId?: string): Promise<Booking[]> {
  const { data } = await api.get<{ bookings: BookingApiRow[] }>('/api/bookings')
  return data.bookings.map(mapBookingRow)
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  const { data } = await api.get<{ booking: BookingApiRow }>(`/api/bookings/${bookingId}`)
  return mapBookingRow(data.booking)
}
