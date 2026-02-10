-- =================================================================
-- FIX DATA FOR TIMOTHY NDUVA (GRANULAR HARVESTS)
-- 1. Verify/Create User & Apiary & Hives
-- 2. Create Granular Harvest Records (2020-2026) totaling ~943kg
--    - 2020-2025: Distributed seasonally (~883kg)
--    - 2026: EXACTLY 60kg between Jan 3 and Jan 10
--    - Linked to random hives in the apiary
-- =================================================================

BEGIN;

DO $$
DECLARE
    v_user_email TEXT := 'timothynduva349@gmail.com';
    v_user_id UUID;
    v_apiary_id UUID;
    v_hive_count INTEGER := 0;
    v_target_hives INTEGER := 184;
    v_years INTEGER[] := ARRAY[2020, 2021, 2022, 2023, 2024, 2025];
    v_year INTEGER;
    v_check_date DATE;
    v_nectar TEXT;
    v_honey_type TEXT;
    v_hive_id UUID;
    v_total_historical_target NUMERIC := 883.0; -- 943 - 60 = 883
    v_current_count INTEGER := 0;
BEGIN
    -- 1. Get User ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User % not found. Skipping data fix.', v_user_email;
        RETURN;
    END IF;

    -- 2. Get/Create Apiary (Kibwezi Main Apiary)
    SELECT id INTO v_apiary_id FROM public.apiaries 
    WHERE user_id = v_user_id AND name = 'Kibwezi Main Apiary' LIMIT 1;

    IF v_apiary_id IS NULL THEN
        SELECT id INTO v_apiary_id FROM public.apiaries WHERE user_id = v_user_id LIMIT 1;
        
        IF v_apiary_id IS NULL THEN
            INSERT INTO public.apiaries (user_id, name, location_name, apiary_type, primary_forage, status)
            VALUES (v_user_id, 'Kibwezi Main Apiary', 'Kibwezi', 'Permanent', 'Acacia', 'active')
            RETURNING id INTO v_apiary_id;
        END IF;
    END IF;

    -- 3. Ensure 184 Hives
    SELECT count(*) INTO v_hive_count FROM public.hives WHERE apiary_id = v_apiary_id;
    
    IF v_hive_count < v_target_hives THEN
        INSERT INTO public.hives (hive_code, apiary_id, user_id, status, health_status, hive_type)
        SELECT 
            'KBZ-' || to_char(k + v_hive_count, 'FM000'),
            v_apiary_id,
            v_user_id,
            'ACTIVE',
            'Good',
            'Langstroth'
        FROM generate_series(1, v_target_hives - v_hive_count) AS k;
    END IF;

    -- 4. Fix Harvests
    -- Clear previous harvests for this user
    DELETE FROM public.harvests WHERE user_id = v_user_id;

    -- A. 2026 Specific Harvest: 60kg from Jan 3 to Jan 10
    -- 8 days. 60/8 = 7.5kg/day
    FOR k IN 3..10 LOOP
        v_check_date := make_date(2026, 1, k);
        
        SELECT id INTO v_hive_id FROM public.hives 
        WHERE apiary_id = v_apiary_id 
        ORDER BY random() LIMIT 1;

        INSERT INTO public.harvests (
            user_id, apiary_id, hive_id, quantity_kg, harvest_date, 
            nectar_source, honey_type, notes, batch_code, is_verified, moisture_content_percent, color_grade
        ) VALUES (
            v_user_id, v_apiary_id, v_hive_id, 7.5, v_check_date,
            'Flowers', 'Extra Light Amber', '2026 Jan Harvest Cycle', 
            'BATCH-202601' || to_char(k, 'FM00'), true, 17.2, 'Extra Light Amber'
        );
    END LOOP;

    -- B. 2020-2025 Historical Harvests (Target ~883kg)
    FOREACH v_year IN ARRAY v_years
    LOOP
        FOR k IN 1..20 LOOP  -- Increased frequency to reach higher target safely
            -- Determine season and dates
            IF (random() < 0.5) THEN
                -- May-June
                v_check_date := make_date(v_year, 5, 1) + (floor(random() * 60)::int);
                v_nectar := 'Wildflower';
                v_honey_type := 'Light Amber';
            ELSE
                -- Oct-Dec
                v_check_date := make_date(v_year, 10, 1) + (floor(random() * 90)::int);
                v_nectar := 'Acacia';
                v_honey_type := 'Water White';
            END IF;

            SELECT id INTO v_hive_id FROM public.hives 
            WHERE apiary_id = v_apiary_id 
            ORDER BY random() LIMIT 1;

            -- Range 5-15kg
            INSERT INTO public.harvests (
                user_id, apiary_id, hive_id, quantity_kg, harvest_date, 
                nectar_source, honey_type, notes, batch_code, is_verified, moisture_content_percent, color_grade
            ) VALUES (
                v_user_id, v_apiary_id, v_hive_id, (floor(random() * 10) + 5)::numeric, v_check_date,
                'Flowers', v_honey_type, 'Historical Harvest Log', 
                'BATCH-' || to_char(v_check_date, 'YYYYMMDD') || '-' || k, true, 17.0 + (random() * 1.5), v_honey_type
            );
        END LOOP;
    END LOOP;

END $$;

-- Normalize 2020-2025 harvests to exactly 883kg, so grand total is 943kg
DO $$
DECLARE
    v_user_id UUID;
    v_hist_current_total NUMERIC;
    v_factor NUMERIC;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'timothynduva349@gmail.com' LIMIT 1;
    
    -- Sum only historical (pre-2026)
    SELECT sum(quantity_kg) INTO v_hist_current_total 
    FROM public.harvests 
    WHERE user_id = v_user_id AND harvest_date < '2026-01-01';
    
    IF v_hist_current_total > 0 THEN
        v_factor := 883.0 / v_hist_current_total;
        UPDATE public.harvests 
        SET quantity_kg = round((quantity_kg * v_factor)::numeric, 2) 
        WHERE user_id = v_user_id AND harvest_date < '2026-01-01';
    END IF;

    -- Verify final total: should be 883 + 60 = 943
END $$;

COMMIT;
