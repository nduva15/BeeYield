-- Migration: Ensure columns exist and normalize 2020 - Jan 2026 harvests to exactly 843.00 kg
-- 1. Ensure quantity_kg and harvest_date columns exist
ALTER TABLE public.harvests ADD COLUMN IF NOT EXISTS quantity_kg NUMERIC;
ALTER TABLE public.harvests ADD COLUMN IF NOT EXISTS harvest_date DATE;

-- 2. Backfill harvest_date from existing date/timestamp columns if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'harvests' AND column_name = 'date') THEN
        EXECUTE 'UPDATE public.harvests SET harvest_date = date::date WHERE harvest_date IS NULL';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'harvests' AND column_name = 'harvested_on') THEN
        EXECUTE 'UPDATE public.harvests SET harvest_date = harvested_on::date WHERE harvest_date IS NULL';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'harvests' AND column_name = 'created_at') THEN
        EXECUTE 'UPDATE public.harvests SET harvest_date = created_at::date WHERE harvest_date IS NULL';
    END IF;
END $$;

-- 3. Backfill quantity_kg from weight_kg / yield_kg / quantity columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'harvests' AND column_name = 'weight_kg') THEN
        EXECUTE 'UPDATE public.harvests SET quantity_kg = weight_kg WHERE quantity_kg IS NULL AND weight_kg IS NOT NULL';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'harvests' AND column_name = 'yield_kg') THEN
        EXECUTE 'UPDATE public.harvests SET quantity_kg = yield_kg WHERE quantity_kg IS NULL AND yield_kg IS NOT NULL';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'harvests' AND column_name = 'quantity') THEN
        EXECUTE 'UPDATE public.harvests SET quantity_kg = quantity::numeric WHERE quantity_kg IS NULL AND quantity IS NOT NULL';
    END IF;
END $$;

-- 4. Associate any unowned harvest records with Timothy Nduva
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'timothynduva349@gmail.com' LIMIT 1;
    IF v_user_id IS NOT NULL THEN
        UPDATE public.harvests SET user_id = v_user_id WHERE user_id IS NULL;
    END IF;
END $$;

-- 5. Normalize 2020 - Jan 2026 harvests to exactly 843.00 kg
DO $$
DECLARE
    v_user_id UUID;
    v_current_total NUMERIC := 0;
    v_target_total NUMERIC := 843.00;
    v_factor NUMERIC := 1;
    v_has_weight BOOLEAN := FALSE;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'timothynduva349@gmail.com' LIMIT 1;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'harvests' AND column_name = 'weight_kg'
    ) INTO v_has_weight;

    -- Dynamic calculation to prevent compile-time column resolution errors
    EXECUTE 'SELECT COALESCE(SUM(quantity_kg), 0) FROM public.harvests WHERE ($1 IS NULL OR user_id = $1) AND (harvest_date IS NULL OR harvest_date < ''2026-02-01'')'
    INTO v_current_total
    USING v_user_id;

    IF v_current_total > 0 THEN
        v_factor := v_target_total / v_current_total;

        -- Scale quantity_kg proportionally
        EXECUTE 'UPDATE public.harvests SET quantity_kg = round((quantity_kg * $1)::numeric, 2) WHERE ($2 IS NULL OR user_id = $2) AND (harvest_date IS NULL OR harvest_date < ''2026-02-01'')'
        USING v_factor, v_user_id;

        -- Sync weight_kg if present
        IF v_has_weight THEN
            EXECUTE 'UPDATE public.harvests SET weight_kg = quantity_kg WHERE ($1 IS NULL OR user_id = $1) AND (harvest_date IS NULL OR harvest_date < ''2026-02-01'')'
            USING v_user_id;
        END IF;

        -- Adjust rounding remainder on the latest record so sum is exactly 843.00 kg
        DECLARE
            v_recheck_total NUMERIC := 0;
            v_diff NUMERIC := 0;
            v_last_id TEXT;
        BEGIN
            EXECUTE 'SELECT COALESCE(SUM(quantity_kg), 0) FROM public.harvests WHERE ($1 IS NULL OR user_id = $1) AND (harvest_date IS NULL OR harvest_date < ''2026-02-01'')'
            INTO v_recheck_total
            USING v_user_id;

            v_diff := v_target_total - v_recheck_total;
            IF v_diff <> 0 THEN
                EXECUTE 'SELECT id::text FROM public.harvests WHERE ($1 IS NULL OR user_id = $1) AND (harvest_date IS NULL OR harvest_date < ''2026-02-01'') ORDER BY harvest_date DESC NULLS LAST LIMIT 1'
                INTO v_last_id
                USING v_user_id;

                IF v_last_id IS NOT NULL THEN
                    EXECUTE 'UPDATE public.harvests SET quantity_kg = quantity_kg + $1 WHERE id::text = $2'
                    USING v_diff, v_last_id;

                    IF v_has_weight THEN
                        EXECUTE 'UPDATE public.harvests SET weight_kg = quantity_kg WHERE id::text = $1'
                        USING v_last_id;
                    END IF;
                END IF;
            END IF;
        END;

        RAISE NOTICE 'Normalized harvests up to Jan 2026 to exactly 843.00 kg successfully (scaling factor: %)', v_factor;
    ELSE
        RAISE NOTICE 'No harvests found for normalization';
    END IF;
END $$;

-- 6. Verify and output results directly in Supabase SQL Editor
SELECT 
    COALESCE(u.email, 'All Users / Default') AS user_email,
    COUNT(h.id) AS total_records,
    ROUND(COALESCE(SUM(CASE WHEN h.harvest_date < '2026-01-01' THEN h.quantity_kg ELSE 0 END), 0), 2) AS historical_2020_2025_kg,
    ROUND(COALESCE(SUM(CASE WHEN h.harvest_date >= '2026-01-01' AND h.harvest_date < '2026-02-01' THEN h.quantity_kg ELSE 0 END), 0), 2) AS jan_2026_kg,
    ROUND(COALESCE(SUM(CASE WHEN h.harvest_date < '2026-02-01' THEN h.quantity_kg ELSE 0 END), 0), 2) AS total_2020_to_jan_2026_kg,
    ROUND(COALESCE(SUM(h.quantity_kg), 0), 2) AS grand_total_kg
FROM public.harvests h
LEFT JOIN auth.users u ON h.user_id = u.id
WHERE u.email = 'timothynduva349@gmail.com' OR h.user_id IS NULL
GROUP BY u.email;
