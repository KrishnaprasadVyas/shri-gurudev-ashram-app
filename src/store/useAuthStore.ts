import { create } from 'zustand';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  role: string;
  verificationStatus: 'not_submitted' | 'submitted' | 'verified' | 'rejected';
  aadhaarNumber: string | null;
  aadhaarImagePath: string | null;
  selfieImagePath: string | null;
};

type AuthState = {
  user: AuthUser | null;
  isHydrated: boolean;
  setUser: (u: AuthUser) => void;
  clearUser: () => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,
  setUser: (u) => set({ user: u }),
  clearUser: () => set({ user: null }),
  logout: () => set({ user: null }),
  setHydrated: (value) => set({ isHydrated: value }),
}));
