-- =================================================================
-- HONEYCHAIN TRACEABILITY & GRANULAR BATCH MIGRATION
-- =================================================================

-- 1. Schema Updates for Traceability
ALTER TABLE public.hives ADD COLUMN IF NOT EXISTS has_colony BOOLEAN DEFAULT FALSE;
ALTER TABLE public.harvests ADD COLUMN IF NOT EXISTS trace_link TEXT;
ALTER TABLE public.harvests ADD COLUMN IF NOT EXISTS batch_id TEXT; -- Ensure exists

-- 2. Reload Schema Cache
NOTIFY pgrst, 'reload schema';

-- 3. The Main Migration Logic
DO $$
DECLARE
    v_user_id UUID;
    v_apiary_id UUID;
    v_hive_id UUID;
    v_batch_prefix TEXT := 'HB-';
    v_domain TEXT := 'https://honeychain.beeyield.com/trace/';
    
    -- Loop variables
    r_year RECORD;
    v_hive_count INT;
    v_total_kg NUMERIC;
    v_kg_per_hive NUMERIC;
    v_hives_list UUID[];
    v_current_hive UUID;
    v_season TEXT;
    v_date DATE;
    v_batch_id TEXT;
    v_i INT;
    v_day INT;
    v_daily_kg NUMERIC;
BEGIN
    -- Get Timothy's User ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'timothynduva349@gmail.com' LIMIT 1;
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'User not found'; END IF;

    -- Get Apiary
    SELECT id INTO v_apiary_id FROM public.apiaries WHERE user_id = v_user_id LIMIT 1;
    IF v_apiary_id IS NULL THEN RAISE EXCEPTION 'Apiary not found'; END IF;

    -- CLEANUP: Wipe old data to ensure clean state
    DELETE FROM public.harvests WHERE user_id = v_user_id;
    DELETE FROM public.hives WHERE user_id = v_user_id;

    -- RECREATE HIVES: 184 Total
    -- We need IDs to link harvests, so we insert and capture IDs
    -- 1-88 are the "foundation" hives (active colonies for historical data)
    -- 89-184 are empties/new expansion
    
    WITH inserted_hives AS (
        INSERT INTO public.hives (hive_code, apiary_id, user_id, status, has_colony, health_status)
        SELECT 
            'KIB-H' || TO_CHAR(i, 'FM000'),
            v_apiary_id,
            v_user_id,
            'ACTIVE',
            CASE WHEN i <= 88 THEN TRUE ELSE FALSE END, -- First 88 have active colonies
            'Good'
        FROM generate_series(1, 184) AS i
        RETURNING id, hive_code
    )
    SELECT array_agg(id ORDER BY hive_code) INTO v_hives_list FROM inserted_hives;

    RAISE NOTICE 'Created 184 hives, 88 marked with active colonies.';

    -- =================================================================
    -- HISTORICAL DATA DISTRIBUTION (2020-2025)
    -- =================================================================
    
    -- Define historical logic: Year, Active Hives, Annual Yield
    -- 2020: 4 hives, 13kg
    -- 2021: 20 hives, 60kg
    -- 2022: 45 hives, 55kg
    -- 2023: 80 hives, 105kg
    -- 2024: 88 hives, 250kg (capped at 88 active colonies)
    -- 2025: 88 hives, 300kg (capped at 88 active colonies)
    
    FOR r_year IN SELECT * FROM (VALUES 
        (2020, 4, 13.0),
        (2021, 20, 60.0),
        (2022, 45, 55.0),
        (2023, 80, 105.0),
        (2024, 88, 250.0),
        (2025, 88, 300.0)
    ) AS t(year, hives, yield)
    LOOP
        v_hive_count := r_year.hives;
        v_total_kg := r_year.yield;
        
        -- Distribute across 2 seasons: June (Summer/Major) and December (Winter/Minor)
        -- Split yield: 60% June, 40% Dec (Adjust as needed, lets go 50/50 for simplicity or stick to the previous 2-harvest logic)
        -- Previous logic was effectively 50/50 per season in the aggregate script.
        -- Batch-Level: We need 1 entry per hive per season.
        
        v_kg_per_hive := (v_total_kg / 2.0) / v_hive_count; -- Per hive, per season
        
        -- Loop through the number of active hives for that year
        FOR v_i IN 1..v_hive_count LOOP
            v_current_hive := v_hives_list[v_i];
            
            -- SEASON 1: June 15th
            v_date := make_date(r_year.year, 6, 15);
            v_batch_id := v_batch_prefix || r_year.year || '-0615-' || TO_CHAR(v_i, 'FM000');
            
            INSERT INTO public.harvests (
                user_id, apiary_id, hive_id, batch_id, 
                harvest_date, quantity_kg, honey_type, 
                notes, is_verified, trace_link
            ) VALUES (
                v_user_id, v_apiary_id, v_current_hive, v_batch_id,
                v_date, v_kg_per_hive, 'Wildflower',
                'Historical Batch - ' || r_year.year || ' Population: ' || v_hive_count,
                TRUE, v_domain || v_batch_id
            );

            -- SEASON 2: Dec 15th
            v_date := make_date(r_year.year, 12, 15);
            v_batch_id := v_batch_prefix || r_year.year || '-1215-' || TO_CHAR(v_i, 'FM000');
            
            INSERT INTO public.harvests (
                user_id, apiary_id, hive_id, batch_id, 
                harvest_date, quantity_kg, honey_type, 
                notes, is_verified, trace_link
            ) VALUES (
                v_user_id, v_apiary_id, v_current_hive, v_batch_id,
                v_date, v_kg_per_hive, 'Forest',
                'Historical Batch - ' || r_year.year || ' Population: ' || v_hive_count,
                TRUE, v_domain || v_batch_id
            );
            
        END LOOP;
        
        RAISE NOTICE 'Year %: Distributed % kg across % hives (2 seasons)', r_year.year, v_total_kg, v_hive_count;
    END LOOP;

    -- =================================================================
    -- 2026 CURRENT HARVEST (Jan 3-10) - DAILY GRANULARITY
    -- =================================================================
    -- 60kg total, 8 days, 30 active hives logic
    -- 7.5kg/day total -> 0.25kg/hive/day
    
    v_daily_kg := 0.25;
    
    FOR v_day IN 3..10 LOOP
        v_date := make_date(2026, 1, v_day);
        
        -- Loop through first 30 hives
        FOR v_i IN 1..30 LOOP
            v_current_hive := v_hives_list[v_i];
            v_batch_id := v_batch_prefix || '2026-01' || TO_CHAR(v_day, 'FM00') || '-' || TO_CHAR(v_i, 'FM000');
            
            INSERT INTO public.harvests (
                user_id, apiary_id, hive_id, batch_id, 
                harvest_date, quantity_kg, honey_type, 
                notes, is_verified, trace_link
            ) VALUES (
                v_user_id, v_apiary_id, v_current_hive, v_batch_id,
                v_date, v_daily_kg, 'Early Spring',
                'Daily Extraction Log - 2026 Season Start',
                TRUE, v_domain || v_batch_id
            );
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '2026: Distributed 60kg across 8 days (Jan 3-10) for 30 hives (240 entries)';

END $$;
