-- Ensure timothynduva349@gmail.com has profiles in all three platform tables
-- This script creates profiles for the super admin account across all dashboards

-- First, get the user ID from auth.users
DO $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT := 'timothynduva349@gmail.com';
BEGIN
    -- Get the user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = admin_email 
    LIMIT 1;

    -- If user doesn't exist in auth.users, we can't proceed
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'User % not found in auth.users. Please create the account first via sign-up.', admin_email;
    ELSE
        RAISE NOTICE 'Found user ID: %', admin_user_id;

        -- Insert into shop_profiles if not exists
        INSERT INTO public.shop_profiles (
            id, 
            first_name, 
            last_name, 
            email,
            created_at,
            updated_at
        )
        VALUES (
            admin_user_id,
            'Timothy',
            'Nduva',
            admin_email,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            updated_at = NOW();

        RAISE NOTICE 'Shop profile ensured for %', admin_email;

        -- Insert into beeyield_profiles if not exists
        INSERT INTO public.beeyield_profiles (
            id, 
            first_name, 
            last_name, 
            email,
            is_professional,
            created_at,
            updated_at
        )
        VALUES (
            admin_user_id,
            'Timothy',
            'Nduva',
            admin_email,
            TRUE,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            is_professional = TRUE,
            updated_at = NOW();

        RAISE NOTICE 'BeeYield profile ensured for %', admin_email;

        -- Insert into ceba_profiles if not exists
        INSERT INTO public.ceba_profiles (
            id, 
            first_name, 
            last_name, 
            email,
            admin_role,
            permissions,
            created_at,
            updated_at
        )
        VALUES (
            admin_user_id,
            'Timothy',
            'Nduva',
            admin_email,
            'super_admin',
            ARRAY['all'],
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            admin_role = 'super_admin',
            permissions = ARRAY['all'],
            updated_at = NOW();

        RAISE NOTICE 'CEBA profile ensured for %', admin_email;
        RAISE NOTICE 'All three platform profiles have been created/updated for %', admin_email;
    END IF;
END $$;
