-- ==========================================
-- FIX: Profile Update Sync & RLS
-- Resolves "new row violates row-level security policy" 
-- when updating profiles from the Shop Dashboard.
-- ==========================================

-- 1. CREATE SECURITY DEFINER FUNCTION TO SYNC AUTH METADATA TO PROFILES
-- This function runs with owner privileges, bypassing RLS.
-- It is called by a trigger on auth.users AFTER UPDATE.
CREATE OR REPLACE FUNCTION public.handle_user_profile_sync()
RETURNS TRIGGER AS $$
BEGIN
    -- Only sync if raw_user_meta_data actually changed
    IF NEW.raw_user_meta_data IS DISTINCT FROM OLD.raw_user_meta_data THEN
        INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
        VALUES (
            NEW.id,
            COALESCE(
                TRIM(CONCAT(
                    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
                    ' ',
                    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
                )),
                NEW.raw_user_meta_data->>'full_name'
            ),
            NEW.raw_user_meta_data->>'avatar_url',
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            full_name = COALESCE(
                NULLIF(TRIM(CONCAT(
                    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
                    ' ',
                    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
                )), ''),
                NEW.raw_user_meta_data->>'full_name',
                EXCLUDED.full_name
            ),
            avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', EXCLUDED.avatar_url),
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. CREATE THE TRIGGER ON auth.users FOR UPDATES
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_profile_sync();

-- 3. ENSURE PROFILES INSERT POLICY EXISTS
-- The existing RLS only has SELECT and UPDATE for users.
-- We need INSERT so the trigger's UPSERT works for edge cases
-- where a profile row was never created.
DO $$
BEGIN
    -- Drop and recreate to ensure clean state
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    CREATE POLICY "Users can insert own profile" 
        ON public.profiles 
        FOR INSERT 
        WITH CHECK ((SELECT auth.uid()) = id);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Profile insert policy skip: %', SQLERRM;
END $$;

-- 4. ENSURE PROFILES UPDATE POLICY EXISTS (belt and suspenders)
DO $$
BEGIN
    -- Check if a user-level update policy exists; if not, create one
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" 
            ON public.profiles 
            FOR UPDATE 
            USING ((SELECT auth.uid()) = id)
            WITH CHECK ((SELECT auth.uid()) = id);
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Profile update policy skip: %', SQLERRM;
END $$;

-- 5. ADD phone COLUMN TO PROFILES IF NOT EXISTS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 6. UPDATE THE SYNC FUNCTION TO ALSO STORE PHONE, FIRST_NAME, LAST_NAME
CREATE OR REPLACE FUNCTION public.handle_user_profile_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.raw_user_meta_data IS DISTINCT FROM OLD.raw_user_meta_data THEN
        INSERT INTO public.profiles (id, full_name, first_name, last_name, phone, avatar_url, updated_at)
        VALUES (
            NEW.id,
            COALESCE(
                NULLIF(TRIM(CONCAT(
                    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
                    ' ',
                    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
                )), ''),
                NEW.raw_user_meta_data->>'full_name'
            ),
            NEW.raw_user_meta_data->>'first_name',
            NEW.raw_user_meta_data->>'last_name',
            NEW.raw_user_meta_data->>'phone',
            NEW.raw_user_meta_data->>'avatar_url',
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            full_name = COALESCE(
                NULLIF(TRIM(CONCAT(
                    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
                    ' ',
                    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
                )), ''),
                NEW.raw_user_meta_data->>'full_name',
                EXCLUDED.full_name
            ),
            first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', EXCLUDED.first_name),
            last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', EXCLUDED.last_name),
            phone = COALESCE(NEW.raw_user_meta_data->>'phone', EXCLUDED.phone),
            avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', EXCLUDED.avatar_url),
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. ALSO UPDATE handle_new_user TO STORE first_name, last_name, phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, first_name, last_name, phone, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(
            NULLIF(TRIM(CONCAT(
                COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
                ' ',
                COALESCE(NEW.raw_user_meta_data->>'last_name', '')
            )), ''),
            NEW.raw_user_meta_data->>'full_name'
        ),
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
