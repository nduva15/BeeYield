-- =================================================================
-- FIX APIARY CREATION, SCHEMA CACHE, AND POPULATE TIMOTHY'S DATA
-- v3: Fixes "status" column missing error
-- =================================================================

-- 1. Reload Schema Cache (Fixes "PGRST204: Could not find table")
NOTIFY pgrst, 'reload schema';

-- 2. Ensure columns exist (Idempotent)
-- We add 'status' because the backend sends it, and 'is_active' for logic
ALTER TABLE apiaries ADD COLUMN IF NOT EXISTS size_acres DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE apiaries ADD COLUMN IF NOT EXISTS apiary_code TEXT;
ALTER TABLE apiaries ADD COLUMN IF NOT EXISTS apiary_type TEXT DEFAULT 'Permanent';
ALTER TABLE apiaries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE apiaries ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE apiaries ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Fix Permissions (Ensure backend can write)
ALTER TABLE apiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access apiaries" ON apiaries;
CREATE POLICY "Service role full access apiaries" ON apiaries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access hives" ON hives;
CREATE POLICY "Service role full access hives" ON hives FOR ALL USING (true) WITH CHECK (true);

-- 4. Populate Timothy's Apiary Data
DO $$
DECLARE
    v_timothy_id UUID;
    v_apiary_pk UUID;
    v_current_hives INT;
    v_needed_hives INT;
BEGIN
    -- Find Timothy's User ID
    SELECT id INTO v_timothy_id FROM auth.users WHERE email = 'timothynduva349@gmail.com' LIMIT 1;
    
    IF v_timothy_id IS NULL THEN
        RAISE NOTICE 'Timothy Nduva not found in users. Skipping population.';
    ELSE
        -- Find or Create Apiary (Check by Name + User)
        -- First try specifically for owned apiary
        SELECT id INTO v_apiary_pk FROM apiaries WHERE user_id = v_timothy_id AND (name = 'Kibwezi Main Apiary' OR name = 'Kibwezi Savannah Apiary') LIMIT 1;
        
        IF v_apiary_pk IS NULL THEN
            -- Attempt to find by name only if ownership was missing
            SELECT id INTO v_apiary_pk FROM apiaries WHERE (name = 'Kibwezi Main Apiary' OR name = 'Kibwezi Savannah Apiary') LIMIT 1;
        END IF;

        IF v_apiary_pk IS NULL THEN
            -- Create new
            INSERT INTO apiaries (name, user_id, apiary_code, size_acres, apiary_type, location_name, status, is_active)
            VALUES ('Kibwezi Main Apiary', v_timothy_id, 'KIB-MAIN', 5, 'Permanent', 'Kibwezi', 'active', true)
            RETURNING id INTO v_apiary_pk;
            RAISE NOTICE 'Created new apiary for Timothy.';
        ELSE
            -- Update existing
            UPDATE apiaries 
            SET size_acres = 5, 
                hive_count = 184,
                name = 'Kibwezi Main Apiary',
                user_id = v_timothy_id,
                status = 'active',
                is_active = true
            WHERE id = v_apiary_pk;
            RAISE NOTICE 'Updated existing apiary details.';
        END IF;

        -- Populate Hives to reach 184
        SELECT COUNT(*) INTO v_current_hives FROM hives WHERE apiary_id = v_apiary_pk;
        
        IF v_current_hives < 184 THEN
            v_needed_hives := 184 - v_current_hives;
            
            INSERT INTO hives (hive_code, apiary_id, user_id, type, status, health_status)
            SELECT 
                'KIB-H' || TO_CHAR(i + v_current_hives, 'FM000'),
                v_apiary_pk,
                v_timothy_id,
                'Langstroth',
                'Active',
                'Good'
            FROM generate_series(1, v_needed_hives) AS i;
            
            RAISE NOTICE 'Added % hives.', v_needed_hives;
        ELSE
             -- Ensure existing hives belong to Timothy
             UPDATE hives SET user_id = v_timothy_id WHERE apiary_id = v_apiary_pk AND user_id IS NULL;
        END IF;
        
        -- Update hive count on apiary final check
        UPDATE apiaries SET hive_count = (SELECT COUNT(*) FROM hives WHERE apiary_id = v_apiary_pk) WHERE id = v_apiary_pk;
    END IF;
END $$;
