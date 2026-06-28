import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SevaType } from '../constants/seva';
import type { SevaBooking } from '../types/seva';

// ─── Devotee Form Fields ──────────────────────────────────────────────────────
export type SevaDevoteeFields = {
  fullName: string;
  phoneNumber: string;
};

// ─── Full Store State ─────────────────────────────────────────────────────────
export type SevaStoreState = {
  // Current seva type being booked
  sevaType: SevaType | null;

  // Selected date for the seva
  selectedDate: string; // ISO: YYYY-MM-DD

  // Devotee details
  fullName: string;
  phoneNumber: string;

  // Booking result (set after mock/real booking is created)
  bookingId: string | null;
  bookingReference: string | null;
  transactionId: string | null;

  // History — all completed/confirmed bookings this session
  // Phase 2: replace with API call on My Sevas screen mount
  sevaHistory: SevaBooking[];

  // Actions
  setSevaType: (type: SevaType) => void;
  setSelectedDate: (date: string) => void;
  updateDevoteeField: <K extends keyof SevaDevoteeFields>(
    field: K,
    value: SevaDevoteeFields[K],
  ) => void;
  setBookingResult: (bookingId: string, bookingReference: string, transactionId?: string) => void;
  addToHistory: (booking: SevaBooking) => void;
  updateBookingStatus: (id: string, status: SevaBooking['status']) => void;
  resetSeva: () => void;
};

// ─── Initial State ────────────────────────────────────────────────────────────
const initialBookingState = {
  sevaType: null,
  selectedDate: '',
  fullName: '',
  phoneNumber: '',
  bookingId: null,
  bookingReference: null,
  transactionId: null,
} as const;

// ─── Store ────────────────────────────────────────────────────────────────────
export const useSevaStore = create<SevaStoreState>()(
  persist(
    (set) => ({
      ...initialBookingState,
      sevaHistory: [],

      setSevaType: (type) => set({ sevaType: type }),

      setSelectedDate: (date) => set({ selectedDate: date }),

      updateDevoteeField: (field, value) =>
        set({ [field]: value } as Partial<SevaStoreState>),

      setBookingResult: (bookingId, bookingReference, transactionId) =>
        set({ bookingId, bookingReference, transactionId: transactionId ?? null }),

      addToHistory: (booking) =>
        set((state) => ({
          sevaHistory: [booking, ...state.sevaHistory.filter((b) => b.id !== booking.id)],
        })),

      updateBookingStatus: (id, status) =>
        set((state) => ({
          sevaHistory: state.sevaHistory.map((b) => (b.id === id ? { ...b, status } : b)),
        })),

      resetSeva: () => set({ ...initialBookingState }),
    }),
    {
      name: 'ashram-seva-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ sevaHistory: state.sevaHistory }),
    }
  )
);
