import { getSupabaseClient } from '../lib/supabase'
import type { Database } from '../types/database.types'

type UserRow = Database['public']['Tables']['users']['Row']

export type AuthUser = {
  id: string
  fullName: string
  email: string | null
  phone: string
  role: string
  isVerified: boolean
}

type AuthMetadata = {
  full_name?: string
  phone?: string
}

function logAuthError(error: unknown) {
  console.log(JSON.stringify(error, null, 2))
}

function toReadableAuthError(error: unknown, fallbackMessage: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String((error as { message?: unknown }).message ?? fallbackMessage))
  }

  return new Error(fallbackMessage)
}

function mapUserRow(row: UserRow): AuthUser {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    isVerified: row.is_verified,
  }
}

function mapFallbackAuthUser(user: { id: string; email?: string | null; user_metadata?: AuthMetadata | null }): AuthUser {
  return {
    id: user.id,
    fullName: user.user_metadata?.full_name?.trim() || user.email || 'User',
    email: user.email ?? null,
    phone: user.user_metadata?.phone?.trim() || '',
    role: 'user',
    isVerified: false,
  }
}

async function getProfileForAuthUser(authUser: { id: string; email?: string | null; user_metadata?: AuthMetadata | null }) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (data) {
    return mapUserRow(data)
  }

  return mapFallbackAuthUser(authUser)
}

export async function signUp(email: string, password: string, fullName: string, phone: string): Promise<AuthUser> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
      },
    },
  })

  if (error) {
    logAuthError(error)
    throw toReadableAuthError(error, 'Could not create your account. Please try again.')
  }

  if (!data.user) {
    throw new Error('Signup succeeded but Supabase did not return a user.')
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    logAuthError(sessionError)
    throw toReadableAuthError(sessionError, 'Your account was created, but the session could not be loaded.')
  }

  if (sessionData.session?.user) {
    return getProfileForAuthUser(sessionData.session.user)
  }

  return {
    id: data.user.id,
    fullName: fullName.trim() || data.user.email || 'User',
    email: data.user.email ?? email.trim() ?? null,
    phone: phone.trim(),
    role: 'user',
    isVerified: false,
  }
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    logAuthError(error)
    throw toReadableAuthError(error, 'Could not sign you in. Please check your credentials.')
  }

  if (!data.user) {
    throw new Error('Signin succeeded but Supabase did not return a user.')
  }

  return getProfileForAuthUser(data.user)
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    logAuthError(error)
    throw toReadableAuthError(error, 'Could not sign you out. Please try again.')
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return null
  }

  const authUser = data.session?.user

  if (!authUser) {
    return null
  }

  try {
    return await getProfileForAuthUser(authUser)
  } catch {
    return mapFallbackAuthUser(authUser)
  }
}