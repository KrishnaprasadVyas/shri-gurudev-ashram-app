import { Router } from 'express'
import { HttpError } from '../errors'
import { AuthenticatedRequest, requireAuth } from '../middleware/auth'
import { upload } from '../middleware/upload'
import { supabaseAdmin } from '../services/supabaseAdmin'

export const usersRouter = Router()

type SubmitVerificationBody = {
  aadhaarNumber?: string
  aadhaarImagePath?: string | null
  selfieImagePath?: string | null
}

// Upload Aadhaar image
// POST /api/users/upload-aadhaar
usersRouter.post(
  '/upload-aadhaar',
  requireAuth,
  upload.single('aadhaarImage'),
  async (request, response, next) => {
    try {
      const authRequest = request as AuthenticatedRequest & { file?: Express.Multer.File }

      if (!authRequest.file) {
        throw new HttpError(400, 'No image file provided')
      }

      const relativePath = `uploads/verifications/${authRequest.userId}/${authRequest.file.filename}`

      response.status(200).json({ path: relativePath })
    } catch (error) {
      next(error)
    }
  },
)

// Upload selfie image
// POST /api/users/upload-selfie
usersRouter.post(
  '/upload-selfie',
  requireAuth,
  upload.single('selfieImage'),
  async (request, response, next) => {
    try {
      const authRequest = request as AuthenticatedRequest & { file?: Express.Multer.File }

      if (!authRequest.file) {
        throw new HttpError(400, 'No image file provided')
      }

      const relativePath = `uploads/verifications/${authRequest.userId}/${authRequest.file.filename}`

      response.status(200).json({ path: relativePath })
    } catch (error) {
      next(error)
    }
  },
)

usersRouter.post('/verification/submit', requireAuth, async (request, response, next) => {
  try {
    const { aadhaarNumber, aadhaarImagePath, selfieImagePath } = request.body as SubmitVerificationBody

    // 1. Validate Aadhaar number is present and correct format
    if (!aadhaarNumber || typeof aadhaarNumber !== 'string' || !aadhaarNumber.trim()) {
      throw new HttpError(400, 'aadhaarNumber is required and cannot be empty')
    }

    const trimmedAadhaar = aadhaarNumber.trim()

    // Aadhaar number must be exactly 12 digits
    if (!/^\d{12}$/.test(trimmedAadhaar)) {
      throw new HttpError(400, 'aadhaarNumber must be exactly 12 numeric digits')
    }

    // Validate aadhaarImagePath is present and non-empty
    if (!aadhaarImagePath || typeof aadhaarImagePath !== 'string' || !aadhaarImagePath.trim()) {
      throw new HttpError(400, 'aadhaarImagePath is required and cannot be empty')
    }

    // Validate selfieImagePath is present and non-empty
    if (!selfieImagePath || typeof selfieImagePath !== 'string' || !selfieImagePath.trim()) {
      throw new HttpError(400, 'selfieImagePath is required and cannot be empty')
    }

    const authRequest = request as AuthenticatedRequest

    // 2. Check that user hasn't already submitted verification
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('verification_status')
      .eq('id', authRequest.userId)
      .maybeSingle()

    if (fetchError) {
      throw new HttpError(500, 'Failed to load user profile')
    }

    if (!existingUser) {
      throw new HttpError(404, 'User profile not found')
    }

    if (existingUser.verification_status === 'submitted' || existingUser.verification_status === 'verified') {
      throw new HttpError(409, 'Verification has already been submitted')
    }

    // 3. Update the users table with verification data
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        aadhaar_number: trimmedAadhaar,
        aadhaar_image_path: aadhaarImagePath ?? null,
        selfie_image_path: selfieImagePath ?? null,
        verification_status: 'submitted',
      })
      .eq('id', authRequest.userId)
      .select('*')
      .single()

    if (updateError || !updatedUser) {
      throw new HttpError(500, updateError?.message ?? 'Failed to submit verification')
    }

    response.status(200).json({ user: updatedUser })
  } catch (error) {
    next(error)
  }
})
