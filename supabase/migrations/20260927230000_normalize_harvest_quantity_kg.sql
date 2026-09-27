-- Migration: Ensure quantity_kg column exists on public.harvests and normalize historical yield
-- 1. Ensure quantity_kg column exists
ALTER TABLE public.harvests ADD COLUMN IF NOT EXISTS quantity_kg NUMERIC;

-- 2. Ensure harvest_date column exists (migrating from date/harvested_on if needed)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'harvests' AND column_name = 'harvest_date'
    ) THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'harvests' AND column_name = 'date') THEN
            ALTER TABLE public.harvests ADD COLUMN harvest_date DATE;
            EXECUTE 'UPDATE public.harvests SET harvest_date = date::date WHERE harvest_date IS NULL';
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'harvests' AND column_name = 'harvested_on') THEN
            ALTER TABLE public.harvests ADD COLUMN harvest_date DATE;
            EXECUTE 'UPDATE public.harvests SET harvest_date = harvested_on::date WHERE harvest_date IS NULL';
        END IF;
    END IF;
END $$;

-- 3. Backfill quantity_kg from existing weight/yield columns if currently null
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

-- 4. Associate unowned records with Timothy Nduva
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'timothynduva349@gmail.com' LIMIT 1;
    IF v_user_id IS NOT NULL THEN
        UPDATE public.harvests SET user_id = v_user_id WHERE user_id IS NULL;
    END IF;
END $$;

-- 5. Normalize 2020-2025 harvests to exactly 883kg (so grand total = 883 + 60 = 943kg)
DO $$
DECLARE
    v_user_id UUID;
    v_hist_current_total NUMERIC;
    v_factor NUMERIC;
    v_has_weight_col BOOLEAN;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'timothynduva349@gmail.com' LIMIT 1;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'harvests' AND column_name = 'weight_kg'
    ) INTO v_has_weight_col;

    -- Sum pre-2026 historical harvests
    SELECT COALESCE(sum(quantity_kg), 0) INTO v_hist_current_total 
    FROM public.harvests 
    WHERE (v_user_id IS NULL OR user_id = v_user_id) 
      AND harvest_date < '2026-01-01';
    
    RAISE NOTICE 'Current pre-2026 total: % kg', v_hist_current_total;

    IF v_hist_current_total > 0 THEN
        v_factor := 883.0 / v_hist_current_total;
        
        UPDATE public.harvests 
        SET quantity_kg = round((quantity_kg * v_factor)::numeric, 2) 
        WHERE (v_user_id IS NULL OR user_id = v_user_id) 
          AND harvest_date < '2026-01-01';

        -- Keep weight_kg column in sync if it exists
        IF v_has_weight_col THEN
            EXECUTE 'UPDATE public.harvests SET weight_kg = quantity_kg WHERE (user_id = $1 OR user_id IS NULL) AND harvest_date < ''2026-01-01''' USING v_user_id;
        END IF;

        RAISE NOTICE 'Pre-2026 harvest normalization applied successfully with factor %', v_factor;
    END IF;
END $$;
