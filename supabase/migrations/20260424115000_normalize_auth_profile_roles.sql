BEGIN;

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
    resolved_role TEXT := CASE COALESCE(NULLIF(metadata->>'role', ''), 'user')
        WHEN 'admin' THEN 'admin'
        WHEN 'super_admin' THEN 'super_admin'
        ELSE 'user'
    END;
BEGIN
    IF to_regclass('public.profiles') IS NULL THEN
        RETURN;
    END IF;

    IF public._public_column_exists(target_table, 'email') THEN
        insert_columns := array_append(insert_columns, 'email');
        insert_values := array_append(insert_values, format('%L', target_user.email));
        update_assignments := array_append(update_assignments, 'email = COALESCE(EXCLUDED.email, public.profiles.email)');
    END IF;

    IF public._public_column_exists(target_table, 'first_name') THEN
        insert_columns := array_append(insert_columns, 'first_name');
        insert_values := array_append(insert_values, format('%L', resolved_first_name));
        update_assignments := array_append(update_assignments, 'first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name)');
    END IF;

    IF public._public_column_exists(target_table, 'last_name') THEN
        insert_columns := array_append(insert_columns, 'last_name');
        insert_values := array_append(insert_values, format('%L', resolved_last_name));
        update_assignments := array_append(update_assignments, 'last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name)');
    END IF;

    IF public._public_column_exists(target_table, 'full_name') THEN
        insert_columns := array_append(insert_columns, 'full_name');
        insert_values := array_append(insert_values, format('%L', resolved_full_name));
        update_assignments := array_append(update_assignments, 'full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name)');
    END IF;

    IF public._public_column_exists(target_table, 'role') THEN
        insert_columns := array_append(insert_columns, 'role');
        insert_values := array_append(insert_values, format('%L', resolved_role));
        update_assignments := array_append(update_assignments, 'role = COALESCE(EXCLUDED.role, public.profiles.role)');
    END IF;

    IF public._public_column_exists(target_table, 'phone') THEN
        insert_columns := array_append(insert_columns, 'phone');
        insert_values := array_append(insert_values, format('%L', NULLIF(metadata->>'phone', '')));
        update_assignments := array_append(update_assignments, 'phone = COALESCE(EXCLUDED.phone, public.profiles.phone)');
    END IF;

    IF public._public_column_exists(target_table, 'avatar_url') THEN
        insert_columns := array_append(insert_columns, 'avatar_url');
        insert_values := array_append(insert_values, format('%L', NULLIF(metadata->>'avatar_url', '')));
        update_assignments := array_append(update_assignments, 'avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url)');
    END IF;

    IF public._public_column_exists(target_table, 'updated_at') THEN
        insert_columns := array_append(insert_columns, 'updated_at');
        insert_values := array_append(insert_values, 'NOW()');
        update_assignments := array_append(update_assignments, 'updated_at = NOW()');
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

NOTIFY pgrst, 'reload schema';

COMMIT;
