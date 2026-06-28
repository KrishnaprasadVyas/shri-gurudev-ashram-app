import type { SevaType } from '../constants/seva';

// ─── Seva Booking ─────────────────────────────────────────────────────────────
export type SevaBookingStatus = 'payment_pending' | 'paid' | 'cancelled';

export type SevaBooking = {
  id: string;
  bookingReference: string;
  transactionId?: string;
  sevaType: SevaType;
  sevaDate: string;           // ISO date string: YYYY-MM-DD
  fullName: string;
  phoneNumber: string;
  totalAmount: number;
  status: SevaBookingStatus;
  createdAt: string;
  notes?: string;
};

// ─── Create Input ─────────────────────────────────────────────────────────────
export type CreateSevaBookingInput = {
  sevaType: SevaType;
  sevaDate: string;
  fullName: string;
  phoneNumber: string;
  totalAmount: number;
  notes?: string;
};

// ─── Receipt Display ──────────────────────────────────────────────────────────
export type SevaReceiptData = {
  receiptNumber: string;
  transactionId?: string;
  transactionDate: string;
  sevaType: SevaType;
  sevaDate: string;
  devotee: string;
  phone: string;
  amount: number;
  paymentMethod: string;
  status: SevaBookingStatus;
  referenceNumber: string;
};

// ─── Upcoming Seva (for Home screen feed) ────────────────────────────────────
export type UpcomingSeva = {
  id: string;
  sevaType: SevaType;
  date: string;           // ISO date string
  isAvailable: boolean;
  spotsLeft?: number;
};
