import type { SevaType } from '../constants/seva';
import type { CreateSevaBookingInput, SevaBooking, UpcomingSeva } from '../types/seva';
import { useSevaStore } from '../store/useSevaStore';

import api from '../api/axiosClient';
import donationApi from '../api/donationAxiosClient';

// Helper to replace Promise.allSettled which is not available in all React Native JS engines
async function allSettled<T>(promises: Promise<T>[]) {
  return Promise.all(
    promises.map((p) =>
      p
        .then((value) => ({ status: 'fulfilled' as const, value }))
        .catch((reason) => ({ status: 'rejected' as const, reason }))
    )
  );
}

export type DateAvailabilityInfo = {
  booked: number;
  capacity: number;
  remaining: number;
  available: boolean;
};

// ─── Fetch Dynamic Seva Pricing ─────────────────────────────────────────────
export async function fetchSevaPricing(): Promise<Record<SevaType, number>> {
  try {
    const [annadanRes, yajmanRes] = await allSettled([
      api.get('/api/annadan/pricing').catch(() => ({ data: null })),
      api.get('/api/seva/pricing').catch(() => ({ data: null })),
    ]);

    const annadanPrice =
      annadanRes.status === 'fulfilled' && annadanRes.value?.data?.pricing?.annadan
        ? annadanRes.value.data.pricing.annadan
        : 2100;

    const yajmanPrice =
      yajmanRes.status === 'fulfilled' && yajmanRes.value?.data?.pricing?.yajman
        ? yajmanRes.value.data.pricing.yajman
        : 5100;

    return {
      annadan: annadanPrice,
      yajman: yajmanPrice,
    };
  } catch (error) {
    return { annadan: 2100, yajman: 5100 };
  }
}

// ─── Fetch Monthly Seva Availability ─────────────────────────────────────────
export async function fetchSevaMonthlyAvailability(
  type: SevaType,
  month: string,
): Promise<Record<string, DateAvailabilityInfo>> {
  if (type === 'annadan') {
    const { data } = await api.get(`/api/annadan/availability?month=${month}`);
    return data.availability || {};
  }
  const { data } = await api.get(`/api/seva/availability?type=${type}&month=${month}`);
  return data.availability || {};
}

// ─── Create a Seva Booking ─────────────────────────────────────────────
export async function createSevaBooking(
  input: CreateSevaBookingInput,
): Promise<SevaBooking> {
  if (input.sevaType === 'annadan') {
    const { data } = await api.post('/api/annadan', input);
    return data.data;
  }
  const { data } = await api.post('/api/seva', input);
  return data.data; // The backend returns { success: true, data: { ... } }
}

// ─── "Pay" a seva booking (Razorpay checkout) ───────────────────
// This returns the Razorpay order for the frontend to open Checkout
export async function createSevaOrder(
  bookingId: string,
  sevaType?: string,
): Promise<{ order: any; booking: SevaBooking }> {
  if (sevaType === 'annadan') {
    const { data } = await api.post('/api/annadan/create-order', { bookingId });
    return data;
  }
  const { data } = await api.post('/api/payments/create-seva-order', { bookingId });
  return data;
}

export async function verifySevaPayment(paymentData: {
  bookingId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  sevaType?: string;
}): Promise<{ success: boolean }> {
  if (paymentData.sevaType === 'annadan') {
    const { data } = await api.post('/api/annadan/verify-payment', paymentData);
    return data;
  }
  const { data } = await api.post('/api/payments/verify-seva', paymentData);
  return data;
}

// ─── Upcoming Sevas for the Home feed (Merging Nitya Annadan + Yajman) ───────
export async function fetchUpcomingSevas(): Promise<UpcomingSeva[]> {
  const [annadanRes, yajmanRes] = await allSettled([
    api.get('/api/annadan/upcoming').catch(() => ({ data: [] })),
    api.get('/api/seva/upcoming').catch(() => ({ data: [] })),
  ]);

  const annadanData = annadanRes.status === 'fulfilled' ? annadanRes.value?.data : [];
  const annadanRaw = Array.isArray(annadanData) ? annadanData : (annadanData?.data ?? []);
  const annadanList: UpcomingSeva[] = Array.isArray(annadanRaw)
    ? annadanRaw.map((b: any) => ({
        id: b.id,
        sevaType: 'annadan',
        date: b.sevaDate,
        isAvailable: b.status === 'paid' || b.status === 'payment_pending',
      }))
    : [];

  const yajmanData = yajmanRes.status === 'fulfilled' ? yajmanRes.value?.data : [];
  const yajmanRaw = Array.isArray(yajmanData) ? yajmanData : (yajmanData?.data ?? []);
  const yajmanList: UpcomingSeva[] = Array.isArray(yajmanRaw)
    ? yajmanRaw.map((b: any) => ({
        id: b.id,
        sevaType: b.sevaType,
        date: b.sevaDate,
        isAvailable: b.status === 'paid' || b.status === 'payment_pending',
      }))
    : [];

  return [...annadanList, ...yajmanList];
}

// ─── Seva History (Merging Nitya Annadan + Yajman Only) ──────────────────────
export async function fetchSevaHistory(): Promise<SevaBooking[]> {
  const [annadanRes, yajmanRes] = await allSettled([
    donationApi.get('/api/annadan/history').catch(() => ({ data: [] })),
    api.get('/api/seva/history').catch(() => ({ data: [] })),
  ]);

  const annadanList: SevaBooking[] =
    annadanRes.status === 'fulfilled' && Array.isArray(annadanRes.value.data)
      ? annadanRes.value.data
      : [];

  const yajmanList: SevaBooking[] =
    yajmanRes.status === 'fulfilled' && Array.isArray(yajmanRes.value.data)
      ? yajmanRes.value.data
      : [];

  const combined = [...annadanList, ...yajmanList];
  combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return combined;
}

// ─── Check Annadan date availability (Canonical Endpoint) ───────────────
export async function checkAnnadanAvailability(
  date: string,
): Promise<{ available: boolean; reason?: string }> {
  try {
    const res = await api.get(`/api/annadan/availability?date=${date}`);
    if (res?.data && typeof res.data.available === 'boolean') {
      return res.data;
    }
    return { available: true };
  } catch {
    return { available: true };
  }
}

// ─── Check Yajman date availability ────────────────────────────────────
export async function checkYajmanAvailability(
  date: string,
): Promise<{ available: boolean; reason?: string }> {
  try {
    const res = await api.get(`/api/seva/yajman/availability?date=${date}`);
    if (res?.data && typeof res.data.available === 'boolean') {
      return res.data;
    }
    return { available: true };
  } catch {
    return { available: true };
  }
}
