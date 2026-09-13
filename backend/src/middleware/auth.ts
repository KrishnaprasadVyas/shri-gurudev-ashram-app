import { randomUUID } from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { HttpError } from '../errors'
import { supabaseAdmin } from '../services/supabaseAdmin'
import { normalizeFirebasePhone, verifyFirebaseIdToken } from '../services/firebaseAdmin'

export type AuthenticatedRequest = Request & { userId?: string; userRole?: string }

export async function optionalAuth(request: Request, _response: Response, next: NextFunction) {
  try {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '')
    if (!token) return next()

    const firebaseUser = await verifyFirebaseIdToken(token)
    if (!firebaseUser.phone_number) return next()

    const phone = normalizeFirebasePhone(firebaseUser.phone_number)
    const profile = await supabaseAdmin.from('users').select('id, deleted_at').eq('phone', phone).maybeSingle()

    if (profile.data) {
      if (profile.data.deleted_at) {
        await supabaseAdmin.from('users').update({ deleted_at: null }).eq('id', profile.data.id)
      }
      ;(request as AuthenticatedRequest).userId = profile.data.id
    }
  } catch {
    // Optional authentication intentionally falls back to guest
  }
  next()
}

export async function requireAuth(request: Request, _response: Response, next: NextFunction) {
  try {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '')
    if (!token) throw new HttpError(401, 'Missing authorization token')

    const firebaseUser = await verifyFirebaseIdToken(token)
    if (!firebaseUser.phone_number) throw new HttpError(401, 'Firebase token has no phone number')

    const phone = normalizeFirebasePhone(firebaseUser.phone_number)

    const profile = await supabaseAdmin.from('users').select('id, deleted_at').eq('phone', phone).maybeSingle()
    if (profile.error) throw new HttpError(500, profile.error.message)

    if (profile.data) {
      if (profile.data.deleted_at) {
        await supabaseAdmin.from('users').update({ deleted_at: null }).eq('id', profile.data.id)
      }
      ;(request as AuthenticatedRequest).userId = profile.data.id
      return next()
    }

    const created = await supabaseAdmin
      .from('users')
      .insert({ id: randomUUID(), phone, full_name: '' })
      .select('id')
      .maybeSingle()

    if (created.error || !created.data) {
      // Fall back to check if user already exists or was created concurrently
      const retryProfile = await supabaseAdmin.from('users').select('id, deleted_at').eq('phone', phone).maybeSingle()
      if (retryProfile.data) {
        if (retryProfile.data.deleted_at) {
          await supabaseAdmin.from('users').update({ deleted_at: null }).eq('id', retryProfile.data.id)
        }
        ;(request as AuthenticatedRequest).userId = retryProfile.data.id
        return next()
      }
      throw new HttpError(500, created.error?.message ?? 'Could not create travel user profile')
    }

    ;(request as AuthenticatedRequest).userId = created.data.id
    next()
  } catch (error) { next(error) }
}

export async function requireAdmin(request: Request, response: Response, next: NextFunction) {
  try {
    const authReq = request as AuthenticatedRequest
    if (!authReq.userId) {
      await requireAuth(request, response, async () => {})
    }
    const userId = authReq.userId
    if (!userId) throw new HttpError(403, 'Administrator access required')

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (error || !user || !['admin', 'WEBSITE_ADMIN', 'SYSTEM_ADMIN'].includes(user.role)) {
      throw new HttpError(403, 'Administrator access required')
    }

    authReq.userRole = user.role
    next()
  } catch (error) {
    next(error)
  }
}

