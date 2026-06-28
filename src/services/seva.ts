/**
 * Seva Service — Phase 1 (Mock)
 *
 * All functions return locally-generated mock data.
 * When Phase 2 (real backend) is ready:
 *   1. Replace each function body with an `api.post(...)` call
 *   2. No other files need to change
 */

import type { SevaType } from '../constants/seva';
import { generateSevaReference, generateTransactionId, getSevaAmount } from '../constants/seva';
import type { CreateSevaBookingInput, SevaBooking, UpcomingSeva } from '../types/seva';
import { useSevaStore } from '../store/useSevaStore';

// ─── Create a Seva Booking (mock) ─────────────────────────────────────────────
export async function createSevaBooking(
  input: CreateSevaBookingInput,
): Promise<SevaBooking> {
  // Simulate network latency
  await delay(600);

  // Business logic validation: prevent duplicate booking for the same date
  const localHistory = useSevaStore.getState().sevaHistory;
  const existing = localHistory.find(
    (b) => b.sevaType === input.sevaType && b.sevaDate === input.sevaDate && b.status !== 'cancelled'
  );
  if (existing) {
    throw new Error(`Duplicate booking prevented: This date is already booked for ${input.sevaType === 'annadan' ? 'Annadan' : 'Guruji Aarti'}.`);
  }

  const id = generateMockUuid();
  const bookingReference = generateSevaReference(input.sevaType);
  const transactionId = generateTransactionId();
  const now = new Date().toISOString();

  return {
    id,
    bookingReference,
    transactionId,
    sevaType: input.sevaType,
    sevaDate: input.sevaDate,
    fullName: input.fullName,
    phoneNumber: input.phoneNumber,
    totalAmount: input.totalAmount,
    status: 'payment_pending',
    createdAt: now,
    notes: input.notes,
  };
}

// ─── "Pay" a seva booking (mock — instantly marks as paid) ───────────────────
export async function mockPaySevaBooking(bookingId: string): Promise<{ success: true }> {
  await delay(800);
  // In Phase 2 this becomes: createRazorpayOrder(bookingId) → RazorpayCheckout → verifyRazorpayPayment
  void bookingId;
  return { success: true };
}

// ─── Upcoming Sevas for the Home feed (mock) ─────────────────────────────────
export async function fetchUpcomingSevas(): Promise<UpcomingSeva[]> {
  await delay(300);

  const today = new Date();
  const upcoming: UpcomingSeva[] = [];

  // Generate 6 upcoming dates alternating Annadan / Yajman
  for (let i = 1; i <= 6; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i * 2);
    const dateStr = date.toISOString().split('T')[0];

    const sevaType: SevaType = i % 2 === 0 ? 'yajman' : 'annadan';
    upcoming.push({
      id: `mock-${sevaType}-${i}`,
      sevaType,
      date: dateStr,
      isAvailable: i < 5,
      spotsLeft: i < 5 ? Math.floor(Math.random() * 3) + 1 : 0,
    });
  }

  return upcoming;
}

// ─── Check Annadan date availability (mock) ───────────────────────────────────
export async function checkAnnadanAvailability(
  date: string,
): Promise<{ available: boolean; reason?: string }> {
  await delay(200);

  const localHistory = useSevaStore.getState().sevaHistory;
  const isBookedLocally = localHistory.some(
    (b) => b.sevaType === 'annadan' && b.sevaDate === date && b.status !== 'cancelled'
  );
  if (isBookedLocally) {
    return { available: false, reason: 'Already Sponsored: This date has a confirmed patron.' };
  }

  // Mock: dates on the 1st and 15th of the month are "already booked"
  const day = new Date(date).getDate();
  if (day === 1 || day === 15) {
    return { available: false, reason: 'Already Sponsored: This date has a confirmed patron.' };
  }
  return { available: true };
}

// ─── Check Yajman date availability (mock) ────────────────────────────────────
export async function checkYajmanAvailability(
  date: string,
): Promise<{ available: boolean; reason?: string }> {
  await delay(200);

  const localHistory = useSevaStore.getState().sevaHistory;
  const isBookedLocally = localHistory.some(
    (b) => b.sevaType === 'yajman' && b.sevaDate === date && b.status !== 'cancelled'
  );
  if (isBookedLocally) {
    return { available: false, reason: 'Already Reserved: A Yajman is confirmed for this Katha.' };
  }

  const day = new Date(date).getDate();
  if (day === 5 || day === 20) {
    return { available: false, reason: 'Already Reserved: A Yajman is confirmed for this Katha.' };
  }
  if (day === 25 || day === 28) {
    return { available: false, reason: 'Waiting List: Future Katha slots open for reservation soon. Contact Ashram.' };
  }
  return { available: true };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateMockUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─── Amount helper (convenience re-export) ────────────────────────────────────
export { getSevaAmount };
