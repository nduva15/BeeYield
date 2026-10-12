-- ==============================================================================
-- MIGRATION: Fix 'quantity_kg does not exist' error & Normalize Timothy to 843kg
-- ==============================================================================
-- 1. Ensure public.harvests has both quantity_kg and weight_kg, harvest_date and date
-- 2. Establish automatic bi-directional sync trigger between redundant columns
-- 3. Normalize Timothy Nduva's harvests to EXACTLY 843.00 kg:
--    - Historical (2020-2025): exactly 783.00 kg (sold inventory records)
--    - Current (Jan 2026):      exactly 60.00 kg (active reserve for verify/traceability)
--    - Grand Total:             exactly 843.00 kg
-- 4. Purge pre-2026 batches from public.honey_batches (only 2026 batches/60kg active in verify)
-- 5. Uses dynamic SQL inside PL/pgSQL to avoid compile-time SQLSTATE 42703
-- ==============================================================================

BEGIN;

-- 1. Ensure columns exist on public.harvests
ALTER TABLE public.harvests ADD COLUMN IF NOT EXISTS quantity_kg NUMERIC;
ALTER TABLE public.harvests ADD COLUMN IF NOT EXISTS weight_kg NUMERIC;
ALTER TABLE public.harvests ADD COLUMN IF NOT EXISTS harvest_date DATE;
ALTER TABLE public.harvests ADD COLUMN IF NOT EXISTS date DATE;

-- 2. Backfill nulls across both column variants
UPDATE public.harvests
SET 
    quantity_kg  = COALESCE(quantity_kg, weight_kg, 0),
    weight_kg    = COALESCE(weight_kg, quantity_kg, 0),
    harvest_date = COALESCE(harvest_date, date, created_at::date, CURRENT_DATE),
    date         = COALESCE(date, harvest_date, created_at::date, CURRENT_DATE)
WHERE quantity_kg IS NULL 
   OR weight_kg IS NULL 
   OR harvest_date IS NULL 
   OR date IS NULL;

-- 3. Create a trigger function to keep quantity_kg <-> weight_kg and harvest_date <-> date in sync
CREATE OR REPLACE FUNCTION public.sync_harvest_columns_trg()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Synchronize weight / quantity
    IF NEW.quantity_kg IS NOT NULL AND NEW.weight_kg IS NULL THEN
        NEW.weight_kg := NEW.quantity_kg;
    ELSIF NEW.weight_kg IS NOT NULL AND NEW.quantity_kg IS NULL THEN
        NEW.quantity_kg := NEW.weight_kg;
    ELSIF NEW.quantity_kg IS NOT NULL AND NEW.weight_kg IS NOT NULL AND NEW.quantity_kg <> NEW.weight_kg THEN
        -- If both provided but differ, honor quantity_kg
        NEW.weight_kg := NEW.quantity_kg;
    END IF;

    -- Synchronize date / harvest_date
    IF NEW.harvest_date IS NOT NULL AND NEW.date IS NULL THEN
        NEW.date := NEW.harvest_date;
    ELSIF NEW.date IS NOT NULL AND NEW.harvest_date IS NULL THEN
        NEW.harvest_date := NEW.date;
    ELSIF NEW.harvest_date IS NOT NULL AND NEW.date IS NOT NULL AND NEW.harvest_date <> NEW.date THEN
        NEW.date := NEW.harvest_date;
    END IF;

    IF NEW.harvest_date IS NULL THEN
        NEW.harvest_date := CURRENT_DATE;
        NEW.date := CURRENT_DATE;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_harvest_columns ON public.harvests;
CREATE TRIGGER trg_sync_harvest_columns
BEFORE INSERT OR UPDATE ON public.harvests
FOR EACH ROW
EXECUTE FUNCTION public.sync_harvest_columns_trg();

-- 4. Normalize Timothy Nduva's Harvests to EXACTLY 843.00 kg
DO $$
DECLARE
    v_user_email TEXT := 'timothynduva349@gmail.com';
    v_user_id UUID;
    v_hist_current_total NUMERIC := 0;
    v_target_hist NUMERIC := 783.00; -- 2020-2025: 13 + 60 + 55 + 105 + 250 + 300 = 783.00 kg
    v_target_2026 NUMERIC := 60.00;  -- Jan 2026: 60.00 kg
    v_target_total NUMERIC := 843.00; -- Grand Total: 783 + 60 = 843.00 kg
    v_2026_current_total NUMERIC := 0;
    v_factor NUMERIC;
    v_recheck_hist NUMERIC := 0;
    v_diff_hist NUMERIC := 0;
    v_recheck_2026 NUMERIC := 0;
    v_diff_2026 NUMERIC := 0;
    v_last_hist_id TEXT;
    v_last_2026_id TEXT;
BEGIN
    -- Locate Timothy Nduva's user ID
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE lower(email) = lower(v_user_email) 
    LIMIT 1;

    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id 
        FROM public.profiles 
        WHERE lower(email) = lower(v_user_email) 
        LIMIT 1;
    END IF;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User % not found in auth.users or public.profiles. Schema fixes applied successfully.', v_user_email;
        RETURN;
    END IF;

    -- Dynamic SQL avoids compile-time SQLSTATE 42703
    -- (A) Historical harvests (pre-2026)
    EXECUTE 'SELECT COALESCE(SUM(quantity_kg), 0) FROM public.harvests WHERE user_id = $1 AND harvest_date < ''2026-01-01'''
    INTO v_hist_current_total
    USING v_user_id;

    IF v_hist_current_total > 0 THEN
        v_factor := v_target_hist / v_hist_current_total;
        
        EXECUTE 'UPDATE public.harvests 
                 SET quantity_kg = round((quantity_kg * $1)::numeric, 2),
                     weight_kg   = round((quantity_kg * $1)::numeric, 2)
                 WHERE user_id = $2 AND harvest_date < ''2026-01-01'''
        USING v_factor, v_user_id;

        -- Exact rounding correction on the latest historical record
        EXECUTE 'SELECT COALESCE(SUM(quantity_kg), 0) FROM public.harvests WHERE user_id = $1 AND harvest_date < ''2026-01-01'''
        INTO v_recheck_hist
        USING v_user_id;

        v_diff_hist := v_target_hist - v_recheck_hist;
        IF v_diff_hist <> 0 THEN
            EXECUTE 'SELECT id::text FROM public.harvests WHERE user_id = $1 AND harvest_date < ''2026-01-01'' ORDER BY harvest_date DESC, id DESC LIMIT 1'
            INTO v_last_hist_id
            USING v_user_id;

            IF v_last_hist_id IS NOT NULL THEN
                EXECUTE 'UPDATE public.harvests 
                         SET quantity_kg = quantity_kg + $1,
                             weight_kg   = weight_kg + $1
                         WHERE id::text = $2'
                USING v_diff_hist, v_last_hist_id;
            END IF;
        END IF;
        
        RAISE NOTICE 'Historical harvests (2020-2025) normalized to % kg', v_target_hist;
    END IF;

    -- (B) 2026 Jan harvests window
    EXECUTE 'SELECT COALESCE(SUM(quantity_kg), 0) FROM public.harvests WHERE user_id = $1 AND harvest_date >= ''2026-01-01'' AND harvest_date < ''2027-01-01'''
    INTO v_2026_current_total
    USING v_user_id;

    IF v_2026_current_total > 0 THEN
        v_factor := v_target_2026 / v_2026_current_total;

        EXECUTE 'UPDATE public.harvests 
                 SET quantity_kg = round((quantity_kg * $1)::numeric, 2),
                     weight_kg   = round((quantity_kg * $1)::numeric, 2)
                 WHERE user_id = $2 AND harvest_date >= ''2026-01-01'' AND harvest_date < ''2027-01-01'''
        USING v_factor, v_user_id;

        -- Exact rounding correction on the latest 2026 record
        EXECUTE 'SELECT COALESCE(SUM(quantity_kg), 0) FROM public.harvests WHERE user_id = $1 AND harvest_date >= ''2026-01-01'' AND harvest_date < ''2027-01-01'''
        INTO v_recheck_2026
        USING v_user_id;

        v_diff_2026 := v_target_2026 - v_recheck_2026;
        IF v_diff_2026 <> 0 THEN
            EXECUTE 'SELECT id::text FROM public.harvests WHERE user_id = $1 AND harvest_date >= ''2026-01-01'' AND harvest_date < ''2027-01-01'' ORDER BY harvest_date DESC, id DESC LIMIT 1'
            INTO v_last_2026_id
            USING v_user_id;

            IF v_last_2026_id IS NOT NULL THEN
                EXECUTE 'UPDATE public.harvests 
                         SET quantity_kg = quantity_kg + $1,
                             weight_kg   = weight_kg + $1
                         WHERE id::text = $2'
                USING v_diff_2026, v_last_2026_id;
            END IF;
        END IF;

        RAISE NOTICE '2026 harvests normalized to % kg', v_target_2026;
    END IF;

    -- (C) Ensure public.honey_batches only retains 2026 batches (60kg season yield)
    -- Historical harvests (2020-2025 = 783kg) are already sold, so ONLY 2026 batches exist for verification/traceability
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'honey_batches'
    ) THEN
        -- Remove pre-2026 batches from honey_batches table
        EXECUTE 'DELETE FROM public.honey_batches 
                 WHERE harvest_date < ''2026-01-01'' 
                    OR batch_code LIKE ''BEE-2020%''
                    OR batch_code LIKE ''BEE-2021%''
                    OR batch_code LIKE ''BEE-2022%''
                    OR batch_code LIKE ''BEE-2023%''
                    OR batch_code LIKE ''BEE-2024%''
                    OR batch_code LIKE ''BEE-2025%''';

        -- If 2026 batches exist in honey_batches, ensure their total quantity_kg is normalized to exactly 60.00 kg
        EXECUTE 'SELECT COALESCE(SUM(quantity_kg), 0) FROM public.honey_batches WHERE harvest_date >= ''2026-01-01'' AND harvest_date < ''2027-01-01'''
        INTO v_2026_current_total;

        IF v_2026_current_total > 0 AND v_2026_current_total <> 60.00 THEN
            v_factor := 60.00 / v_2026_current_total;
            EXECUTE 'UPDATE public.honey_batches 
                     SET quantity_kg = round((quantity_kg * $1)::numeric, 2)
                     WHERE harvest_date >= ''2026-01-01'' AND harvest_date < ''2027-01-01'''
            USING v_factor;
        END IF;

        RAISE NOTICE 'Cleaned honey_batches: only 2026 active batches (60kg) retained for verification/traceability.';
    END IF;

    RAISE NOTICE 'Successfully updated harvests for %: Grand Total is exactly % kg.', v_user_email, v_target_total;
END $$;

COMMIT;

-- 5. Final Verification Query - Harvests (843kg Total = 783kg historical + 60kg 2026)
SELECT 
    COALESCE(u.email, 'Unassigned') AS user_email,
    COUNT(h.id) AS total_batches,
    ROUND(COALESCE(SUM(CASE WHEN h.harvest_date < '2026-01-01' THEN h.quantity_kg ELSE 0 END), 0), 2) AS historical_2020_2025_kg,
    ROUND(COALESCE(SUM(CASE WHEN h.harvest_date >= '2026-01-01' AND h.harvest_date < '2027-01-01' THEN h.quantity_kg ELSE 0 END), 0), 2) AS season_2026_kg,
    ROUND(COALESCE(SUM(h.quantity_kg), 0), 2) AS grand_total_kg
FROM public.harvests h
LEFT JOIN auth.users u ON h.user_id = u.id
WHERE u.email = 'timothynduva349@gmail.com' OR h.user_id IN (
    SELECT id FROM auth.users WHERE lower(email) = 'timothynduva349@gmail.com'
)
GROUP BY u.email;

-- 6. Verification Query - Active Traceability Batches in honey_batches (strictly 2026, 60kg)
SELECT 
    'honey_batches' AS table_name,
    COUNT(*) AS total_2026_batches,
    ROUND(COALESCE(SUM(quantity_kg), 0), 2) AS total_kg,
    MIN(harvest_date) AS min_date,
    MAX(harvest_date) AS max_date
FROM public.honey_batches;
