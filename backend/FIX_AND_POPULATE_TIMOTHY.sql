-- =================================================================
-- FIX APIARY CREATION, SCHEMA CACHE, AND POPULATE TIMOTHY'S DATA
-- Run this script in the Supabase Dashboard -> SQL Editor
-- =================================================================

-- 1. Ensure columns exist (Idempotent)
ALTER TABLE apiaries ADD COLUMN IF NOT EXISTS size_acres DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE apiaries ADD COLUMN IF NOT EXISTS apiary_code TEXT;
ALTER TABLE apiaries ADD COLUMN IF NOT EXISTS apiary_type TEXT DEFAULT 'Permanent';
ALTER TABLE apiaries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Reload Schema Cache (Fixes "PGRST204: Could not find table")
NOTIFY pgrst, 'reload schema';

-- 3. Populate Timothy's Apiary
DO $$
DECLARE
    timothy_id UUID;
    apiary_id UUID;
    current_hives INT;
    needed_hives INT;
BEGIN
    -- Find Timothy's ID
    SELECT id INTO timothy_id FROM auth.users WHERE email = 'timothynduva349@gmail.com' LIMIT 1;
    
    IF timothy_id IS NULL THEN
        RAISE NOTICE 'Timothy Nduva not found in users. Skipping population.';
        RETURN;
    END IF;

    -- Find or Create Apiary
    SELECT id INTO apiary_id FROM apiaries WHERE user_id = timothy_id AND name = 'Kibwezi Main Apiary' LIMIT 1;
    
    IF apiary_id IS NULL THEN
        -- Create it
        INSERT INTO apiaries (name, user_id, apiary_code, size_acres, apiary_type, location_name, status, is_active, created_at)
        VALUES ('Kibwezi Main Apiary', timothy_id, 'KIB-MAIN', 5, 'Permanent', 'Kibwezi', 'active', true, NOW())
        RETURNING id INTO apiary_id;
        RAISE NOTICE 'Created new apiary for Timothy.';
    ELSE
        -- Update it
        UPDATE apiaries 
        SET size_acres = 5, 
            hive_count = 184,
            status = 'active',
            is_active = true
        WHERE id = apiary_id;
        RAISE NOTICE 'Updated existing apiary details.';
    END IF;

    -- 4. Populate Hives (Goal: 184)
    SELECT COUNT(*) INTO current_hFIX_AND_POPULATE_TIMOTHY.sqlives FROM hives WHERE apiary_id = apiary_id;
    
    IF current_hives < 184 THEN
        needed_hives := 184 - current_hives;
        
        INSERT INTO hives (id, hive_code, apiary_id, user_id, type, status, health_status, created_at)
        SELECT 
            gen_random_uuid(),
            'KIB-H' || TO_CHAR(i + current_hives, 'FM000'),
            apiary_id,
            timothy_id,
            'Langstroth',
            'Active',
            'Good',
            NOW()
        FROM generate_series(1, needed_hives) AS i;
        
        RAISE NOTICE 'Added % hives.', needed_hives;
    ELSE
        RAISE NOTICE 'Apiary already has % hives.', current_hives;
        -- Optional: Ensure user_id is set on them
        UPDATE hives SET user_id = timothy_id WHERE apiary_id = apiary_id AND user_id IS NULL;
    END IF;
    
    -- Update hive count on apiary
    UPDATE apiaries SET hive_count = (SELECT COUNT(*) FROM hives WHERE apiary_id = apiary_id) WHERE id = apiary_id;

END $$;

-- 5. Fix Permissions (Enable RLS and policies)
ALTER TABLE apiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hives ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (CRUD fix for backend)
DROP POLICY IF EXISTS "Service role full access apiaries" ON apiaries;
CREATE POLICY "Service role full access apiaries" ON apiaries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access hives" ON hives;
CREATE POLICY "Service role full access hives" ON hives FOR ALL USING (true) WITH CHECK (true);
