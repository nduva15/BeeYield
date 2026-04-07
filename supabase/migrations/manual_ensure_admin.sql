-- Direct SQL to ensure timothynduva349@gmail.com has all three profiles
-- Run this in your Supabase SQL Editor

-- Step 1: Find the user ID (replace with actual UUID if you know it)
-- SELECT id FROM auth.users WHERE email = 'timothynduva349@gmail.com';

-- Step 2: Insert/Update profiles (replace YOUR_USER_ID_HERE with the actual UUID)
-- For example, if the ID is '12345678-1234-1234-1234-123456789012':

-- Insert into shop_profiles
INSERT INTO public.shop_profiles (id, first_name, last_name, email, created_at, updated_at)
SELECT 
    id,
    'Timothy',
    'Nduva',
    email,
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'timothynduva349@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    first_name = 'Timothy',
    last_name = 'Nduva',
    updated_at = NOW();

-- Insert into beeyield_profiles
INSERT INTO public.beeyield_profiles (id, first_name, last_name, email, is_professional, created_at, updated_at)
SELECT 
    id,
    'Timothy',
    'Nduva',
    email,
    TRUE,
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'timothynduva349@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    first_name = 'Timothy',
    last_name = 'Nduva',
    is_professional = TRUE,
    updated_at = NOW();

-- Insert into ceba_profiles
INSERT INTO public.ceba_profiles (id, first_name, last_name, email, admin_role, permissions, created_at, updated_at)
SELECT 
    id,
    'Timothy',
    'Nduva',
    email,
    'super_admin',
    ARRAY['all'],
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'timothynduva349@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    first_name = 'Timothy',
    last_name = 'Nduva',
    admin_role = 'super_admin',
    permissions = ARRAY['all'],
    updated_at = NOW();

-- Verify the profiles were created
SELECT 'shop' as platform, id, email FROM public.shop_profiles WHERE email = 'timothynduva349@gmail.com'
UNION ALL
SELECT 'beeyield' as platform, id, email FROM public.beeyield_profiles WHERE email = 'timothynduva349@gmail.com'
UNION ALL
SELECT 'ceba' as platform, id, email FROM public.ceba_profiles WHERE email = 'timothynduva349@gmail.com';
