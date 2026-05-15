-- Final Database Consistency Fix
-- This migration addresses:
-- 1. Missing columns in profiles table (email, first_name, last_name)
-- 2. apiary_code not-null constraint violation
-- 3. Updating handle_new_user trigger to support first_name/last_name

BEGIN;

-- 1. Extend profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 2. Fix apiary_code constraint
-- If it's NOT NULL, make it NULLable as its generation is handled by backend or we can add a default
ALTER TABLE public.apiaries ALTER COLUMN apiary_code DROP NOT NULL;

-- 3. Update handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email,
    full_name, 
    first_name,
    last_name,
    avatar_url,
    role
  )
  VALUES (
    new.id, 
    new.email,
    COALESCE(
        new.raw_user_meta_data->>'full_name', 
        TRIM(COALESCE(new.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(new.raw_user_meta_data->>'last_name', ''))
    ),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = COALESCE(EXCLUDED.role, profiles.role);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
