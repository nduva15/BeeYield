BEGIN;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE OR REPLACE FUNCTION public._public_column_exists(target_table TEXT, target_column TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = target_table
          AND column_name = target_column
    );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public._sync_auth_user_profile(target_user auth.users)
RETURNS VOID AS $$
DECLARE
    metadata JSONB := COALESCE(target_user.raw_user_meta_data, '{}'::jsonb);
    target_table CONSTANT TEXT := 'profiles';
    insert_columns TEXT[] := ARRAY['id'];
    insert_values TEXT[] := ARRAY[format('%L::uuid', target_user.id::text)];
    update_assignments TEXT[] := ARRAY[]::TEXT[];
    resolved_first_name TEXT := NULLIF(
        COALESCE(
            metadata->>'first_name',
            metadata->>'given_name',
            ''
        ),
        ''
    );
    resolved_last_name TEXT := NULLIF(
        COALESCE(
            metadata->>'last_name',
            metadata->>'family_name',
            ''
        ),
        ''
    );
    resolved_full_name TEXT := NULLIF(
        BTRIM(
            COALESCE(
                metadata->>'full_name',
                CONCAT_WS(' ', resolved_first_name, resolved_last_name)
            )
        ),
        ''
    );
    resolved_role TEXT := COALESCE(NULLIF(metadata->>'role', ''), 'user');
BEGIN
    IF to_regclass('public.profiles') IS NULL THEN
        RETURN;
    END IF;

    IF public._public_column_exists(target_table, 'email') THEN
        insert_columns := insert_columns || 'email';
        insert_values := insert_values || format('%L', target_user.email);
        update_assignments := update_assignments || 'email = COALESCE(EXCLUDED.email, public.profiles.email)';
    END IF;

    IF public._public_column_exists(target_table, 'first_name') THEN
        insert_columns := insert_columns || 'first_name';
        insert_values := insert_values || format('%L', resolved_first_name);
        update_assignments := update_assignments || 'first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name)';
    END IF;

    IF public._public_column_exists(target_table, 'last_name') THEN
        insert_columns := insert_columns || 'last_name';
        insert_values := insert_values || format('%L', resolved_last_name);
        update_assignments := update_assignments || 'last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name)';
    END IF;

    IF public._public_column_exists(target_table, 'full_name') THEN
        insert_columns := insert_columns || 'full_name';
        insert_values := insert_values || format('%L', resolved_full_name);
        update_assignments := update_assignments || 'full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name)';
    END IF;

    IF public._public_column_exists(target_table, 'role') THEN
        insert_columns := insert_columns || 'role';
        insert_values := insert_values || format('%L', resolved_role);
        update_assignments := update_assignments || 'role = COALESCE(EXCLUDED.role, public.profiles.role)';
    END IF;

    IF public._public_column_exists(target_table, 'phone') THEN
        insert_columns := insert_columns || 'phone';
        insert_values := insert_values || format('%L', NULLIF(metadata->>'phone', ''));
        update_assignments := update_assignments || 'phone = COALESCE(EXCLUDED.phone, public.profiles.phone)';
    END IF;

    IF public._public_column_exists(target_table, 'avatar_url') THEN
        insert_columns := insert_columns || 'avatar_url';
        insert_values := insert_values || format('%L', NULLIF(metadata->>'avatar_url', ''));
        update_assignments := update_assignments || 'avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url)';
    END IF;

    IF public._public_column_exists(target_table, 'updated_at') THEN
        insert_columns := insert_columns || 'updated_at';
        insert_values := insert_values || 'NOW()';
        update_assignments := update_assignments || 'updated_at = NOW()';
    END IF;

    BEGIN
        EXECUTE format(
            'INSERT INTO public.profiles (%s) VALUES (%s) ON CONFLICT (id) DO UPDATE SET %s',
            array_to_string(insert_columns, ', '),
            array_to_string(insert_values, ', '),
            CASE
                WHEN array_length(update_assignments, 1) IS NULL THEN 'id = EXCLUDED.id'
                ELSE array_to_string(update_assignments, ', ')
            END
        );
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Ignoring auth profile sync failure for user %: % (%)',
                target_user.id,
                SQLERRM,
                SQLSTATE;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public._sync_auth_user_profile(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.handle_user_profile_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email IS DISTINCT FROM OLD.email
       OR NEW.raw_user_meta_data IS DISTINCT FROM OLD.raw_user_meta_data THEN
        PERFORM public._sync_auth_user_profile(NEW);
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
    IF to_regclass('public.profiles') IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_policies
            WHERE schemaname = 'public'
              AND tablename = 'profiles'
              AND policyname = 'Users can view own profile'
        ) THEN
            CREATE POLICY "Users can view own profile"
                ON public.profiles
                FOR SELECT
                TO authenticated
                USING ((SELECT auth.uid()) = id);
        END IF;

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

        IF NOT EXISTS (
            SELECT 1
            FROM pg_policies
            WHERE schemaname = 'public'
              AND tablename = 'profiles'
              AND policyname = 'Users can update own profile'
        ) THEN
            CREATE POLICY "Users can update own profile"
                ON public.profiles
                FOR UPDATE
                TO authenticated
                USING ((SELECT auth.uid()) = id)
                WITH CHECK ((SELECT auth.uid()) = id);
        END IF;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';

COMMIT;
