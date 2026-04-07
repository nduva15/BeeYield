-- =================================================================
-- FIX BATCHES AND TIMOTHY NDUVA HARVEST DATA
-- 1. Ensure 184 Hives for Timothy
-- 2. Create 184 per-hive batches for 2020 totaling 943kg
-- 3. Correct 2026 harvest date and batch
-- =================================================================

BEGIN;

DO $$
DECLARE
    v_user_email TEXT := 'timothynduva349@gmail.com';
    v_user_id UUID;
    v_apiary_id UUID;
    v_target_hives INTEGER := 184;
    v_hive_count INTEGER;
    v_hive_id UUID;
    v_hive_code TEXT;
    v_batch_code TEXT;
    v_qty_per_hive NUMERIC := 943.0 / 184.0; -- ~5.125kg
BEGIN
    -- 1. Get User ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email LIMIT 1;
    
    IF v_user_id IS NULL THEN
        -- Fallback to profile check if auth.users is restricted
        SELECT id INTO v_user_id FROM public.profiles WHERE email = v_user_email LIMIT 1;
    END IF;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User % not found. Skipping data fix.', v_user_email;
        RETURN;
    END IF;

    -- 2. Get/Create Apiary
    SELECT id INTO v_apiary_id FROM public.apiaries 
    WHERE user_id = v_user_id AND name = 'Kibwezi Main Apiary' LIMIT 1;

    IF v_apiary_id IS NULL THEN
        INSERT INTO public.apiaries (user_id, name, location_name, apiary_type, primary_forage, status)
        VALUES (v_user_id, 'Kibwezi Main Apiary', 'Kibwezi', 'Permanent', 'Acacia', 'active')
        RETURNING id INTO v_apiary_id;
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
    -- Clear previous audit data
    DELETE FROM public.harvests WHERE user_id = v_user_id AND (notes ILIKE '%Legacy Sync%' OR notes ILIKE '%Audit%');

    -- Insert 2020 Harvests (943kg total)
    -- One per hive
    FOR v_hive_id, v_hive_code IN SELECT id, hive_code FROM public.hives WHERE apiary_id = v_apiary_id LOOP
        v_batch_code := 'BY-20200615-' || upper(regexp_replace(v_hive_code, '[^a-zA-Z0-9]', '', 'g'));
        -- Keep only last 4 chars of hive code for batch
        v_batch_code := 'BY-20200615-' || right(upper(regexp_replace(v_hive_code, '[^a-zA-Z0-9]', '', 'g')), 4);

        INSERT INTO public.harvests (
            user_id, apiary_id, hive_id, quantity_kg, harvest_date, 
            honey_type, notes, batch_code, is_verified, moisture_content_percent, color_grade
        ) VALUES (
            v_user_id, v_apiary_id, v_hive_id, v_qty_per_hive, '2020-06-15',
            'Wildflower', 'Legacy Sync - 2020 943kg Audit', v_batch_code, true, 17.5, 'Amber'
        );
    END LOOP;

    -- 5. Fix 2026 Harvest (60kg)
    -- Ensure it's within Jan 3-10
    DELETE FROM public.harvests WHERE user_id = v_user_id AND harvest_date >= '2026-01-01';
    
    SELECT id, hive_code INTO v_hive_id, v_hive_code FROM public.hives WHERE apiary_id = v_apiary_id LIMIT 1;
    
    v_batch_code := 'BY-20260105-' || right(upper(regexp_replace(v_hive_code, '[^a-zA-Z0-9]', '', 'g')), 4);

    INSERT INTO public.harvests (
        user_id, apiary_id, hive_id, quantity_kg, harvest_date, 
        honey_type, notes, batch_code, is_verified, moisture_content_percent, color_grade
    ) VALUES (
        v_user_id, v_apiary_id, v_hive_id, 60.0, '2026-01-05',
        'Early Spring', 'Current Year - Jan Harvest Window', v_batch_code, true, 17.5, 'Extra Light Amber'
    );

END $$;

COMMIT;
