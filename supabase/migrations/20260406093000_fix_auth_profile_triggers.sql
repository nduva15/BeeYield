BEGIN;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    metadata JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    resolved_first_name TEXT := COALESCE(
        NULLIF(metadata->>'first_name', ''),
        NULLIF(metadata->>'given_name', '')
    );
    resolved_last_name TEXT := COALESCE(
        NULLIF(metadata->>'last_name', ''),
        NULLIF(metadata->>'family_name', '')
    );
    resolved_role TEXT := COALESCE(
        NULLIF(metadata->>'role', ''),
        'user'
    );
    resolved_phone TEXT := NULLIF(metadata->>'phone', '');
    resolved_avatar_url TEXT := NULLIF(metadata->>'avatar_url', '');
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        phone,
        avatar_url,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        resolved_first_name,
        resolved_last_name,
        resolved_role,
        resolved_phone,
        resolved_avatar_url,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
        last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
        role = COALESCE(EXCLUDED.role, public.profiles.role, 'user'),
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.handle_user_profile_sync()
RETURNS TRIGGER AS $$
DECLARE
    metadata JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    resolved_first_name TEXT := COALESCE(
        NULLIF(metadata->>'first_name', ''),
        NULLIF(metadata->>'given_name', '')
    );
    resolved_last_name TEXT := COALESCE(
        NULLIF(metadata->>'last_name', ''),
        NULLIF(metadata->>'family_name', '')
    );
    resolved_role TEXT := COALESCE(
        NULLIF(metadata->>'role', ''),
        'user'
    );
    resolved_phone TEXT := NULLIF(metadata->>'phone', '');
    resolved_avatar_url TEXT := NULLIF(metadata->>'avatar_url', '');
BEGIN
    IF NEW.email IS DISTINCT FROM OLD.email
       OR NEW.raw_user_meta_data IS DISTINCT FROM OLD.raw_user_meta_data THEN
        INSERT INTO public.profiles (
            id,
            email,
            first_name,
            last_name,
            role,
            phone,
            avatar_url,
            updated_at
        )
        VALUES (
            NEW.id,
            NEW.email,
            resolved_first_name,
            resolved_last_name,
            resolved_role,
            resolved_phone,
            resolved_avatar_url,
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = COALESCE(EXCLUDED.email, public.profiles.email),
            first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
            last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
            role = COALESCE(EXCLUDED.role, public.profiles.role, 'user'),
            phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
            avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_profile_sync();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'profiles'
          AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile"
            ON public.profiles
            FOR INSERT
            TO authenticated
            WITH CHECK ((SELECT auth.uid()) = id);
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

NOTIFY pgrst, 'reload schema';

COMMIT;
