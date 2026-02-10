-- =================================================================
-- HARVESTS SCHEMA, RLS, AND POPULATE TIMOTHY'S DATA
-- =================================================================

-- 1. Ensure Table Structure matches PRD and Code
-- (Already mostly exists, but adding/verifying columns)
ALTER TABLE IF EXISTS public.harvests ADD COLUMN IF NOT EXISTS apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.harvests ADD COLUMN IF NOT EXISTS quantity_left_for_bees_kg DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE IF EXISTS public.harvests ADD COLUMN IF NOT EXISTS batch_code TEXT;
ALTER TABLE IF EXISTS public.harvests ADD COLUMN IF NOT EXISTS honey_type TEXT DEFAULT 'Polyfloral';
ALTER TABLE IF EXISTS public.harvests ADD COLUMN IF NOT EXISTS color_grade TEXT DEFAULT 'Light Amber';
ALTER TABLE IF EXISTS public.harvests ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.harvests ADD COLUMN IF NOT EXISTS notes TEXT;

-- Rename columns if they were created with old names in previous migrations
DO $$
BEGIN
    -- Check if 'date' exists and 'harvest_date' does not
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='date') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='harvest_date') THEN
        ALTER TABLE public.harvests RENAME COLUMN "date" TO harvest_date;
    END IF;

    -- Check if 'weight_kg' exists and 'quantity_kg' does not
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='weight_kg') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='quantity_kg') THEN
        ALTER TABLE public.harvests RENAME COLUMN weight_kg TO quantity_kg;
    END IF;
END $$;

-- 2. Reload Schema Cache
NOTIFY pgrst, 'reload schema';

-- 3. Security: Enable RLS and Policies
ALTER TABLE public.harvests ENABLE ROW LEVEL SECURITY;

-- Policy: Users see own harvests
DROP POLICY IF EXISTS "Users see own harvests" ON public.harvests;
CREATE POLICY "Users see own harvests" ON public.harvests
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users insert own harvests
DROP POLICY IF EXISTS "Users insert own harvests" ON public.harvests;
CREATE POLICY "Users insert own harvests" ON public.harvests
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users update own harvests
DROP POLICY IF EXISTS "Users update own harvests" ON public.harvests;
CREATE POLICY "Users update own harvests" ON public.harvests
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users delete own harvests
DROP POLICY IF EXISTS "Users delete own harvests" ON public.harvests;
CREATE POLICY "Users delete own harvests" ON public.harvests
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Policy: Service role full access (Internal tools compatibility)
DROP POLICY IF EXISTS "Service role full access harvests" ON public.harvests;
CREATE POLICY "Service role full access harvests" ON public.harvests FOR ALL USING (true) WITH CHECK (true);

-- 4. Pre-Populate 60 kg Harvest for Timothy
DO $$
DECLARE
    v_timothy_id UUID;
    v_apiary_id UUID;
    v_hive_id UUID;
BEGIN
    -- Find Timothy's ID
    SELECT id INTO v_timothy_id FROM auth.users WHERE email = 'timothynduva349@gmail.com' LIMIT 1;
    
    IF v_timothy_id IS NULL THEN
        RAISE NOTICE 'Timothy Nduva not found. Skipping population.';
        RETURN;
    END IF;

    -- Find an apiary for him
    SELECT id INTO v_apiary_id FROM public.apiaries WHERE user_id = v_timothy_id LIMIT 1;
    
    IF v_apiary_id IS NULL THEN
        -- Create it if missing
        INSERT INTO public.apiaries (name, user_id, apiary_code, status, is_active)
        VALUES ('Migration Apiary', v_timothy_id, 'MIG-001', 'active', true)
        RETURNING id INTO v_apiary_id;
    END IF;

    -- Find a hive for him
    SELECT id INTO v_hive_id FROM public.hives WHERE apiary_id = v_apiary_id LIMIT 1;
    
    IF v_hive_id IS NULL THEN
        -- Create it if missing
        INSERT INTO public.hives (hive_code, apiary_id, user_id, status)
        VALUES ('MIG-H01', v_apiary_id, v_timothy_id, 'ACTIVE')
        RETURNING id INTO v_hive_id;
    END IF;

    -- Insert the 60kg Harvest
    -- Check if it already exists to avoid duplicates
    IF NOT EXISTS (SELECT 1 FROM public.harvests WHERE user_id = v_timothy_id AND quantity_kg = 60.0 AND harvest_date = '2024-05-15') THEN
        INSERT INTO public.harvests (user_id, apiary_id, hive_id, quantity_kg, harvest_date, honey_type, notes, batch_code, is_verified)
        VALUES (v_timothy_id, v_apiary_id, v_hive_id, 60.0, '2024-05-15', 'Polyfloral', 'Initial codebase harvest 2024', 'BY-2024-60KG', true);
        RAISE NOTICE 'Populated 60kg harvest for Timothy.';
    ELSE
        RAISE NOTICE 'Timothy already has the 60kg harvest.';
    END IF;

END $$;
