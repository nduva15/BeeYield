BEGIN;

DO $$
DECLARE
    v_user_email TEXT := 'timothynduva349@gmail.com';
    v_user_id UUID;
    v_primary_apiary_id UUID;
    v_has_apiary_code BOOLEAN := FALSE;
    v_has_batch_id BOOLEAN := FALSE;
    v_has_honey_batches BOOLEAN := FALSE;
BEGIN
    SELECT id
    INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email
    LIMIT 1;

    IF v_user_id IS NULL THEN
        SELECT id
        INTO v_user_id
        FROM public.profiles
        WHERE email = v_user_email
        LIMIT 1;
    END IF;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Timothy user not found. Skipping BeeYield rename migration.';
        RETURN;
    END IF;

    SELECT id
    INTO v_primary_apiary_id
    FROM public.apiaries
    WHERE user_id = v_user_id
      AND name IN ('Kibwezi Main Apiary', 'BeeYield Apiary')
    ORDER BY created_at NULLS FIRST, updated_at NULLS FIRST
    LIMIT 1;

    IF v_primary_apiary_id IS NULL THEN
        SELECT id
        INTO v_primary_apiary_id
        FROM public.apiaries
        WHERE user_id = v_user_id
        ORDER BY created_at NULLS FIRST, updated_at NULLS FIRST
        LIMIT 1;
    END IF;

    IF v_primary_apiary_id IS NOT NULL THEN
        UPDATE public.apiaries
        SET
            name = 'BeeYield Apiary',
            location_name = COALESCE(NULLIF(location_name, ''), 'Kalakalya, Kibwezi'),
            county = COALESCE(NULLIF(county, ''), 'Makueni'),
            region = COALESCE(NULLIF(region, ''), 'Kibwezi East'),
            notes = CASE
                WHEN notes IS NULL OR notes = '' THEN 'Primary BeeYield apiary in Kalakalya, Kibwezi.'
                ELSE replace(notes, 'Kibwezi Main Apiary', 'BeeYield Apiary')
            END
        WHERE id = v_primary_apiary_id;
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'apiaries'
          AND column_name = 'apiary_code'
    )
    INTO v_has_apiary_code;

    IF v_has_apiary_code AND v_primary_apiary_id IS NOT NULL THEN
        EXECUTE $sql$
            UPDATE public.apiaries
            SET apiary_code = 'BEE-MKN-001'
            WHERE id = $1
        $sql$
        USING v_primary_apiary_id;
    END IF;

    IF v_primary_apiary_id IS NOT NULL THEN
        UPDATE public.hives
        SET hive_code = CASE
            WHEN hive_code ~ '^KBZ-' THEN regexp_replace(hive_code, '^KBZ-', 'BEE-')
            WHEN hive_code ~ '^KIB-' THEN regexp_replace(hive_code, '^KIB-', 'BEE-')
            WHEN hive_code ~ '^BY-H' THEN regexp_replace(hive_code, '^BY-H', 'BEE-H')
            ELSE hive_code
        END
        WHERE apiary_id = v_primary_apiary_id;
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'harvests'
          AND column_name = 'batch_id'
    )
    INTO v_has_batch_id;

    IF v_primary_apiary_id IS NOT NULL THEN
        UPDATE public.harvests
        SET
            batch_code = CASE
                WHEN batch_code ~ '^BY-' THEN regexp_replace(batch_code, '^BY-', 'BEE-')
                WHEN batch_code ~ '^KBZ-' THEN regexp_replace(batch_code, '^KBZ-', 'BEE-')
                WHEN batch_code ~ '^KIB-' THEN regexp_replace(batch_code, '^KIB-', 'BEE-')
                ELSE batch_code
            END,
            notes = CASE
                WHEN notes IS NULL THEN NULL
                ELSE replace(notes, 'Kibwezi Main Apiary', 'BeeYield Apiary')
            END
        WHERE apiary_id = v_primary_apiary_id
           OR user_id = v_user_id;
    END IF;

    IF v_has_batch_id AND v_primary_apiary_id IS NOT NULL THEN
        EXECUTE $sql$
            UPDATE public.harvests
            SET batch_id = CASE
                WHEN batch_id IS NULL OR batch_id = '' THEN batch_code
                WHEN batch_id ~ '^BY-' THEN regexp_replace(batch_id, '^BY-', 'BEE-')
                WHEN batch_id ~ '^KBZ-' THEN regexp_replace(batch_id, '^KBZ-', 'BEE-')
                WHEN batch_id ~ '^KIB-' THEN regexp_replace(batch_id, '^KIB-', 'BEE-')
                ELSE batch_id
            END
            WHERE apiary_id = $1
               OR user_id = $2
        $sql$
        USING v_primary_apiary_id, v_user_id;
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'honey_batches'
    )
    INTO v_has_honey_batches;

    IF v_has_honey_batches THEN
        UPDATE public.honey_batches
        SET
            batch_code = CASE
                WHEN batch_code ~ '^BY-' THEN regexp_replace(batch_code, '^BY-', 'BEE-')
                WHEN batch_code ~ '^KBZ-' THEN regexp_replace(batch_code, '^KBZ-', 'BEE-')
                WHEN batch_code ~ '^KIB-' THEN regexp_replace(batch_code, '^KIB-', 'BEE-')
                ELSE batch_code
            END,
            apiary_name = 'BeeYield Apiary',
            beekeeper_name = COALESCE(NULLIF(beekeeper_name, ''), 'Timothy Nduva'),
            farmer_name = COALESCE(NULLIF(farmer_name, ''), 'Timothy Nduva'),
            location_county = COALESCE(NULLIF(location_county, ''), 'Makueni'),
            location_region = COALESCE(NULLIF(location_region, ''), 'Kibwezi East')
        WHERE farmer_name = 'Timothy Nduva'
           OR beekeeper_name = 'Timothy Nduva'
           OR apiary_name IN ('Kibwezi Main Apiary', 'BeeYield Apiary');
    END IF;
END $$;

COMMIT;
