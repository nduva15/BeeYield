BEGIN;

CREATE OR REPLACE FUNCTION public._sync_auth_user_profile(target_user auth.users)
RETURNS VOID AS $$
DECLARE
    metadata JSONB := COALESCE(target_user.raw_user_meta_data, '{}'::jsonb);
    requested_backend TEXT := COALESCE(NULLIF(metadata->>'auth_backend', ''), NULLIF(metadata->>'platform', ''), 'ceba');
    target_table TEXT := CASE
        WHEN requested_backend = 'shop' THEN 'shop_profiles'
        WHEN requested_backend = 'beeyield' THEN 'beeyield_profiles'
        ELSE 'profiles'
    END;
    insert_columns TEXT[] := ARRAY['id'];
    insert_values TEXT[] := ARRAY[format('%L::uuid', target_user.id::text)];
    update_assignments TEXT[] := ARRAY[]::TEXT[];
    resolved_first_name TEXT := NULLIF(COALESCE(metadata->>'first_name', metadata->>'given_name', ''), '');
    resolved_last_name TEXT := NULLIF(COALESCE(metadata->>'last_name', metadata->>'family_name', ''), '');
    resolved_full_name TEXT := NULLIF(BTRIM(COALESCE(metadata->>'full_name', metadata->>'name', CONCAT_WS(' ', resolved_first_name, resolved_last_name))), '');
    resolved_role TEXT := COALESCE(NULLIF(metadata->>'role', ''), 'user');
BEGIN
    IF to_regclass(format('public.%I', target_table)) IS NULL THEN
        RETURN;
    END IF;

    IF public._public_column_exists(target_table, 'email') THEN
        insert_columns := insert_columns || 'email';
        insert_values := insert_values || format('%L', target_user.email);
        update_assignments := update_assignments || format('email = COALESCE(EXCLUDED.email, %I.email)', target_table);
    END IF;

    IF public._public_column_exists(target_table, 'first_name') THEN
        insert_columns := insert_columns || 'first_name';
        insert_values := insert_values || format('%L', resolved_first_name);
        update_assignments := update_assignments || format('first_name = COALESCE(EXCLUDED.first_name, %I.first_name)', target_table);
    END IF;

    IF public._public_column_exists(target_table, 'last_name') THEN
        insert_columns := insert_columns || 'last_name';
        insert_values := insert_values || format('%L', resolved_last_name);
        update_assignments := update_assignments || format('last_name = COALESCE(EXCLUDED.last_name, %I.last_name)', target_table);
    END IF;

    IF public._public_column_exists(target_table, 'full_name') THEN
        insert_columns := insert_columns || 'full_name';
        insert_values := insert_values || format('%L', resolved_full_name);
        update_assignments := update_assignments || format('full_name = COALESCE(EXCLUDED.full_name, %I.full_name)', target_table);
    END IF;

    IF public._public_column_exists(target_table, 'role') THEN
        insert_columns := insert_columns || 'role';
        insert_values := insert_values || format('%L', resolved_role);
        update_assignments := update_assignments || format('role = COALESCE(EXCLUDED.role, %I.role)', target_table);
    END IF;

    IF public._public_column_exists(target_table, 'is_professional') THEN
        insert_columns := insert_columns || 'is_professional';
        insert_values := insert_values || CASE WHEN requested_backend = 'beeyield' THEN 'TRUE' ELSE 'FALSE' END;
        update_assignments := update_assignments || 'is_professional = EXCLUDED.is_professional';
    END IF;

    IF public._public_column_exists(target_table, 'updated_at') THEN
        insert_columns := insert_columns || 'updated_at';
        insert_values := insert_values || 'NOW()';
        update_assignments := update_assignments || 'updated_at = NOW()';
    END IF;

    BEGIN
        EXECUTE format(
            'INSERT INTO public.%I (%s) VALUES (%s) ON CONFLICT (id) DO UPDATE SET %s',
            target_table,
            array_to_string(insert_columns, ', '),
            array_to_string(insert_values, ', '),
            CASE
                WHEN array_length(update_assignments, 1) IS NULL THEN 'id = EXCLUDED.id'
                ELSE array_to_string(update_assignments, ', ')
            END
        );
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Ignoring auth profile sync failure for user % on table %: % (%)',
                target_user.id,
                target_table,
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
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user triggered exception for user %: % (%)',
            NEW.id,
            SQLERRM,
            SQLSTATE;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.handle_user_profile_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email IS DISTINCT FROM OLD.email
       OR NEW.raw_user_meta_data IS DISTINCT FROM OLD.raw_user_meta_data THEN
        BEGIN
            PERFORM public._sync_auth_user_profile(NEW);
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'handle_user_profile_sync triggered exception for user %: % (%)',
                    NEW.id,
                    SQLERRM,
                    SQLSTATE;
        END;
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

NOTIFY pgrst, 'reload schema';

COMMIT;
