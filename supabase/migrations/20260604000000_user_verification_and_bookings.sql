-- Migration: Traveler details on bookings, verification on users

-- 1. Add traveler columns to public.bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS dob date,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS transport_type text,
  ADD COLUMN IF NOT EXISTS bus_type text,
  ADD COLUMN IF NOT EXISTS room_type text;

-- 2. Add verification columns to public.users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS aadhaar_number text,
  ADD COLUMN IF NOT EXISTS aadhaar_image_path text,
  ADD COLUMN IF NOT EXISTS selfie_image_path text,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'not_submitted';

-- 3. Add check constraint for verification_status values
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_verification_status_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_verification_status_check
  CHECK (verification_status IN ('not_submitted', 'submitted', 'verified', 'rejected'));

-- 4. Migrate existing data if needed
UPDATE public.users
SET verification_status = CASE 
  WHEN is_verified = true THEN 'verified' 
  ELSE 'not_submitted' 
END;

-- 5. Drop old is_verified column
ALTER TABLE public.users
  DROP COLUMN IF EXISTS is_verified;

-- 6. Update the new user trigger function to use verification_status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    role,
    verification_status
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    'user',
    'not_submitted'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;
