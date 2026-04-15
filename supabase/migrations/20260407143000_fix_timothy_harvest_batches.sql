-- =================================================================
-- FINAL TIMOTHY NDUVA HARVEST CORRECTION
-- 1. Preserve 184 hives for Timothy's main apiary
-- 2. Replace 2020-2026 harvest history with batch-sized records
-- 3. Each batch is 2kg, with a single 1kg remainder where required
-- 4. Grand total is exactly 843kg
-- 5. 2026 Jan 3-10 window is exactly 60kg = 30 batches = 30 hives
-- =================================================================

BEGIN;

DO $$
DECLARE
    v_user_email TEXT := 'timothynduva349@gmail.com';
    v_user_id UUID;
    v_farmer_id UUID;
    v_apiary_id UUID;
    v_target_hives INTEGER := 184;
    v_hive_count INTEGER := 0;
    v_hive_ids UUID[];
    v_hive_codes TEXT[];
    v_hive_idx INTEGER;
    v_hive_code TEXT;
    v_harvest_id UUID;
    v_honey_batches_exists BOOLEAN := FALSE;
    v_batch_cols TEXT[];
    v_batch_vals TEXT[];

    v_year INTEGER;
    v_total_kg NUMERIC;
    v_full_batches INTEGER;
    v_remainder_kg NUMERIC;
    v_total_batches INTEGER;
    v_batch_seq INTEGER;
    v_quantity NUMERIC;
    v_batch_date DATE;
    v_start_date DATE;
    v_end_date DATE;
    v_day_span INTEGER;
    v_batch_code TEXT;
    v_batch_id TEXT;
    v_honey_type TEXT;
    v_nectar_source TEXT;
    v_color_grade TEXT;
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
        RAISE NOTICE 'Timothy user not found. Skipping harvest correction.';
        RETURN;
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'honey_batches'
    )
    INTO v_honey_batches_exists;

    SELECT id
    INTO v_farmer_id
    FROM public.farmers
    WHERE user_id = v_user_id
      AND name = 'Timothy Nduva'
    LIMIT 1;

    IF v_farmer_id IS NULL THEN
        INSERT INTO public.farmers (
            user_id,
            name,
            location_name
        ) VALUES (
            v_user_id,
            'Timothy Nduva',
            'Kibwezi'
        )
        RETURNING id INTO v_farmer_id;
    END IF;

    UPDATE public.farmers
    SET
        user_id = v_user_id,
        name = 'Timothy Nduva',
        location_name = COALESCE(location_name, 'Kibwezi')
    WHERE id = v_farmer_id;

    SELECT id
    INTO v_apiary_id
    FROM public.apiaries
    WHERE user_id = v_user_id
      AND name = 'BeeYield Apiary'
    LIMIT 1;

    IF v_apiary_id IS NULL THEN
        SELECT id
        INTO v_apiary_id
        FROM public.apiaries
        WHERE user_id = v_user_id
        ORDER BY created_at NULLS FIRST, name
        LIMIT 1;
    END IF;

    IF v_apiary_id IS NULL THEN
        INSERT INTO public.apiaries (
            user_id,
            farmer_id,
            name,
            location_name,
            apiary_type,
            primary_forage,
            status
        ) VALUES (
            v_user_id,
            v_farmer_id,
            'BeeYield Apiary',
            'Kibwezi',
            'Permanent',
            'Acacia',
            'active'
        )
        RETURNING id INTO v_apiary_id;
    END IF;

    UPDATE public.apiaries
    SET
        user_id = v_user_id,
        farmer_id = v_farmer_id,
        name = 'BeeYield Apiary',
        location_name = COALESCE(location_name, 'Kibwezi')
    WHERE id = v_apiary_id;

    SELECT count(*)
    INTO v_hive_count
    FROM public.hives
    WHERE apiary_id = v_apiary_id;

    IF v_hive_count < v_target_hives THEN
        INSERT INTO public.hives (
            hive_code,
            apiary_id,
            user_id,
            farmer_id,
            status,
            health_status,
            hive_type
        )
        SELECT
            'BEE-' || to_char(v_hive_count + seq, 'FM000'),
            v_apiary_id,
            v_user_id,
            v_farmer_id,
            'ACTIVE',
            'Good',
            'Langstroth'
        FROM generate_series(1, v_target_hives - v_hive_count) AS seq;
    END IF;

    UPDATE public.hives
    SET
        user_id = v_user_id,
        apiary_id = v_apiary_id,
        farmer_id = v_farmer_id
    WHERE apiary_id = v_apiary_id;

    SELECT
        array_agg(id ORDER BY hive_code),
        array_agg(hive_code ORDER BY hive_code)
    INTO v_hive_ids, v_hive_codes
    FROM public.hives
    WHERE apiary_id = v_apiary_id;

    IF v_hive_ids IS NULL OR array_length(v_hive_ids, 1) IS NULL THEN
        RAISE NOTICE 'No hives available for Timothy. Skipping harvest correction.';
        RETURN;
    END IF;

    DELETE FROM public.harvests
    WHERE user_id = v_user_id
      AND harvest_date >= DATE '2020-01-01'
      AND harvest_date < DATE '2027-01-01';

    IF v_honey_batches_exists
       AND EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'honey_batches'
              AND column_name = 'batch_code'
       ) THEN
        EXECUTE $delete_batches$
            DELETE FROM public.honey_batches
            WHERE batch_code LIKE 'BEE-2020%'
               OR batch_code LIKE 'BEE-2021%'
               OR batch_code LIKE 'BEE-2022%'
               OR batch_code LIKE 'BEE-2023%'
               OR batch_code LIKE 'BEE-2024%'
               OR batch_code LIKE 'BEE-2025%'
               OR batch_code LIKE 'BEE-2026%'
        $delete_batches$;
    END IF;

    FOR v_year, v_total_kg, v_start_date, v_end_date, v_honey_type, v_nectar_source, v_color_grade IN
        SELECT *
        FROM (
            VALUES
                (2020, 13.0::NUMERIC, DATE '2020-06-15', DATE '2020-12-15', 'Wildflower', 'Wildflower', 'Amber'),
                (2021, 60.0::NUMERIC, DATE '2021-06-15', DATE '2021-12-15', 'Wildflower', 'Wildflower', 'Light Amber'),
                (2022, 55.0::NUMERIC, DATE '2022-06-15', DATE '2022-12-15', 'Forest', 'Acacia', 'Amber'),
                (2023, 105.0::NUMERIC, DATE '2023-06-15', DATE '2023-12-15', 'Wildflower', 'Wildflower', 'Water White'),
                (2024, 250.0::NUMERIC, DATE '2024-06-15', DATE '2024-12-15', 'Wildflower', 'Acacia', 'Extra White'),
                (2025, 300.0::NUMERIC, DATE '2025-06-15', DATE '2025-12-15', 'Forest', 'Forest', 'Dark Amber'),
                (2026, 60.0::NUMERIC, DATE '2026-01-03', DATE '2026-01-10', 'Early Spring', 'Flowers', 'Extra Light Amber')
        ) AS yearly_plan (
            year_num,
            total_kg,
            start_date,
            end_date,
            honey_type,
            nectar_source,
            color_grade
        )
    LOOP
        v_full_batches := floor(v_total_kg / 2.0);
        v_remainder_kg := v_total_kg - (v_full_batches * 2.0);
        v_total_batches := v_full_batches + CASE WHEN v_remainder_kg > 0 THEN 1 ELSE 0 END;
        v_day_span := GREATEST((v_end_date - v_start_date) + 1, 1);

        FOR v_batch_seq IN 1..v_total_batches LOOP
            v_quantity := CASE
                WHEN v_batch_seq <= v_full_batches THEN 2.0
                ELSE v_remainder_kg
            END;

            v_batch_date := v_start_date + ((v_batch_seq - 1) % v_day_span);

            IF v_year = 2026 THEN
                v_hive_idx := v_batch_seq;
            ELSE
                v_hive_idx := ((v_year - 2020) * 31 + (v_batch_seq - 1)) % array_length(v_hive_ids, 1) + 1;
            END IF;
            v_hive_code := v_hive_codes[v_hive_idx];

            v_batch_code := format(
                'BEE-%s-%s',
                to_char(v_batch_date, 'YYYYMMDD'),
                right(upper(regexp_replace(v_hive_code, '[^A-Z0-9]', '', 'g')), 4)
            );

            v_batch_id := format(
                'BEE-%s-%s-%s',
                to_char(v_batch_date, 'YYYY'),
                to_char(v_batch_date, 'MM'),
                lpad(v_batch_seq::TEXT, 3, '0')
            );

            INSERT INTO public.harvests (
                user_id,
                apiary_id,
                hive_id,
                quantity_kg,
                harvest_date,
                nectar_source,
                honey_type,
                notes,
                batch_code,
                batch_id,
                is_verified,
                moisture_content_percent,
                color_grade,
                farmer_id
            ) VALUES (
                v_user_id,
                v_apiary_id,
                v_hive_ids[v_hive_idx],
                v_quantity,
                v_batch_date,
                v_nectar_source,
                v_honey_type,
                CASE
                    WHEN v_year = 2026 THEN format(
                        'Current Year - Jan Harvest Window batch %s of %s (2kg per batch)',
                        v_batch_seq,
                        v_total_batches
                    )
                    ELSE format(
                        'Legacy Sync - %s batch %s of %s (2kg per batch)',
                        v_year,
                        v_batch_seq,
                        v_total_batches
                    )
                END,
                v_batch_code,
                v_batch_id,
                true,
                17.5,
                v_color_grade,
                v_farmer_id
            )
            RETURNING id INTO v_harvest_id;

            IF v_honey_batches_exists THEN
                v_batch_cols := ARRAY[]::TEXT[];
                v_batch_vals := ARRAY[]::TEXT[];

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'batch_code'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'batch_code');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable(v_batch_code));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'harvest_id'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'harvest_id');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable(v_harvest_id));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'hive_id'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'hive_id');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable(v_hive_ids[v_hive_idx]));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'apiary_id'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'apiary_id');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable(v_apiary_id));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'farmer_id'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'farmer_id');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable(v_farmer_id));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'user_id'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'user_id');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable(v_user_id));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'harvest_date'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'harvest_date');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable(v_batch_date));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'honey_type'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'honey_type');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable(v_honey_type));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'quantity_kg'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'quantity_kg');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable(v_quantity));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'processing_method'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'processing_method');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable('Cold Extraction'));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'farmer_name'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'farmer_name');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable('Timothy Nduva'));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'beekeeper_name'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'beekeeper_name');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable('Timothy Nduva'));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'beekeeper_id'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'beekeeper_id');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable(v_farmer_id::TEXT));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'apiary_name'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'apiary_name');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable('BeeYield Apiary'));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'hive_code'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'hive_code');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable(v_hive_code));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'quality_grade'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'quality_grade');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable('GRADE A'));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'moisture_content'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'moisture_content');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable(17.5));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'color_grade'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'color_grade');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable(v_color_grade));
                END IF;
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'honey_batches' AND column_name = 'status'
                ) THEN
                    v_batch_cols := array_append(v_batch_cols, 'status');
                    v_batch_vals := array_append(v_batch_vals, quote_nullable('ready'));
                END IF;

                IF array_length(v_batch_cols, 1) IS NOT NULL THEN
                    EXECUTE format(
                        'INSERT INTO public.honey_batches (%s) VALUES (%s)',
                        array_to_string(v_batch_cols, ', '),
                        array_to_string(v_batch_vals, ', ')
                    );
                END IF;
            END IF;
        END LOOP;
    END LOOP;
END $$;

COMMIT;
