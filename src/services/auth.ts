import {
  getAuth,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  getIdToken,
  type User,
  type ConfirmationResult,
} from "@react-native-firebase/auth";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { useAuthStore } from "../store/useAuthStore";
import { getBaseUrl } from "../utils/config";

const FIREBASE_TOKEN_KEY = "shri_gurudev_firebase_id_token";
const DONATION_TOKEN_KEY = "shri_gurudev_donation_jwt";

async function setSecureItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('localStorage error', e);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getSecureItem(key: string) {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage error', e);
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function deleteSecureItem(key: string) {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('localStorage error', e);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export type VerificationStatus =
  | "not_submitted"
  | "submitted"
  | "verified"
  | "rejected";
export type IdentityType = "aadhaar" | "pan";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  whatsappNumber?: string | null;
  dob?: string | null;
  gender?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  role: string;
  profileImageUrl: string | null;
  identityType?: IdentityType | null;
  verificationStatus: VerificationStatus;
  aadhaarNumber: string | null;
  aadhaarImagePath: string | null;
  aadhaarBackImagePath?: string | null;
  selfieImagePath: string | null;
  panNumber?: string | null;
  panImagePath?: string | null;
  identityNumberMasked?: string | null;
  reviewNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  deletedAt: string | null;
};

function mapUser(row: any): AuthUser {
  return {
    id: row.id,
    fullName: row.full_name ?? "",
    email: row.email ?? null,
    phone: row.phone ?? row.phone_number ?? "",
    whatsappNumber: row.whatsapp_number ?? row.phone ?? row.phone_number ?? null,
    dob: row.dob ?? null,
    gender: row.gender ?? null,
    address: row.address ?? null,
    emergencyContactName: row.emergency_contact_name ?? null,
    emergencyContactPhone: row.emergency_contact_phone ?? null,
    emergencyContactRelation: row.emergency_contact_relation ?? null,
    role: row.role ?? "user",
    profileImageUrl: row.profile_image_url ?? null,
    identityType: row.identity_type ?? null,
    verificationStatus: row.verification_status ?? "not_submitted",
    aadhaarNumber: row.aadhaar_number ?? null,
    aadhaarImagePath: row.aadhaar_image_path ?? null,
    aadhaarBackImagePath: row.aadhaar_back_image_path ?? null,
    selfieImagePath: row.selfie_image_path ?? null,
    panNumber: row.pan_number ?? null,
    panImagePath: row.pan_image_path ?? null,
    identityNumberMasked: row.identity_number_masked ?? null,
    reviewNotes: row.review_notes ?? null,
    reviewedBy: row.reviewed_by ?? null,
    reviewedAt: row.reviewed_at ?? null,
    createdAt: row.created_at,
    deletedAt: row.deleted_at ?? null,
  };
}
async function request(path: string, init: RequestInit = {}) {
  const baseUrl = getBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error ?? body.message ?? "Request could not be processed. Please try again.");
    return body;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error("Connection timed out. Please verify your internet connection and try again.");
    }
    if (error?.message?.toLowerCase().includes('network request failed')) {
      throw new Error("Unable to reach the Ashram servers. Please check your internet connection.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
async function finishFirebaseUser(user: User, forceRefresh = false) {
  const token = await getIdToken(user, forceRefresh);
  await setSecureItem(FIREBASE_TOKEN_KEY, token);
  const donation = await request("/api/auth/verify-firebase-token", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  if (donation?.token)
    await setSecureItem(DONATION_TOKEN_KEY, donation.token);
  const profile = await request("/api/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return mapUser(profile.user);
}
export async function requestPhoneOtp(
  phone: string,
): Promise<ConfirmationResult> {
  const auth = getAuth();
  return signInWithPhoneNumber(auth, `+91${phone.replace(/\D/g, "")}`);
}
export async function confirmPhoneOtp(
  confirmation: ConfirmationResult,
  code: string,
) {
  const result = await confirmation.confirm(code);
  const user = result?.user;
  if (!user) throw new Error("Firebase did not return a user");
  return finishFirebaseUser(user, true);
}
export async function authenticatePhone(phone: string): Promise<any> {
  return requestPhoneOtp(phone);
}
export async function signOut() {
  if (Platform.OS !== 'web') {
    try {
      const auth = getAuth();
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase sign out error', e);
    }
  }
  await deleteSecureItem(FIREBASE_TOKEN_KEY);
  await deleteSecureItem(DONATION_TOKEN_KEY);
  useAuthStore.getState().clearUser();
}
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (Platform.OS === 'web') return null;
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return await finishFirebaseUser(user, false);
  } catch {
    return null;
  }
}
export async function getAuthToken() {
  if (Platform.OS !== 'web') {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const token = await getIdToken(user);
        await setSecureItem(FIREBASE_TOKEN_KEY, token);
        return token;
      }
    } catch (e) {
      console.warn('Firebase getAuthToken error', e);
    }
  }
  return getSecureItem(FIREBASE_TOKEN_KEY);
}
export async function getDonationToken() {
  return getSecureItem(DONATION_TOKEN_KEY);
}
export async function refreshCurrentUser() {
  const user = await getCurrentUser();
  if (user) useAuthStore.getState().setUser(user);
  else useAuthStore.getState().clearUser();
  return user;
}
