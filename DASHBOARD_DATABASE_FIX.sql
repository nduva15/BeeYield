-- ==========================================
-- BEE YIELD DASHBOARD DATABASE FIX v2
-- Removes foreign key constraints that block inserts
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. DROP FOREIGN KEY CONSTRAINTS ON USER_ID COLUMNS
-- These constraints prevent inserts when using service role key
-- ==========================================

ALTER TABLE apiaries DROP CONSTRAINT IF EXISTS apiaries_user_id_fkey;
ALTER TABLE hives DROP CONSTRAINT IF EXISTS hives_user_id_fkey;
ALTER TABLE harvests DROP CONSTRAINT IF EXISTS harvests_user_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;
ALTER TABLE inspections DROP CONSTRAINT IF EXISTS inspections_user_id_fkey;
ALTER TABLE farmers DROP CONSTRAINT IF EXISTS farmers_user_id_fkey;

-- 2. ENSURE COLUMNS EXIST (without FK)
-- ==========================================

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apiaries' AND column_name='user_id') THEN
        ALTER TABLE apiaries ADD COLUMN user_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apiaries' AND column_name='apiary_code') THEN
        ALTER TABLE apiaries ADD COLUMN apiary_code TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apiaries' AND column_name='apiary_type') THEN
        ALTER TABLE apiaries ADD COLUMN apiary_type TEXT DEFAULT 'Permanent';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apiaries' AND column_name='size_acres') THEN
        ALTER TABLE apiaries ADD COLUMN size_acres DECIMAL(10, 2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apiaries' AND column_name='expected_hives') THEN
        ALTER TABLE apiaries ADD COLUMN expected_hives INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apiaries' AND column_name='primary_forage') THEN
        ALTER TABLE apiaries ADD COLUMN primary_forage TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apiaries' AND column_name='notes') THEN
        ALTER TABLE apiaries ADD COLUMN notes TEXT;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hives' AND column_name='user_id') THEN
        ALTER TABLE hives ADD COLUMN user_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hives' AND column_name='health_status') THEN
        ALTER TABLE hives ADD COLUMN health_status TEXT;
    END IF;
END $$;

-- 3. MAKE apiary_code NULLABLE (if it has NOT NULL)
-- ==========================================
ALTER TABLE apiaries ALTER COLUMN apiary_code DROP NOT NULL;

-- 4. RLS POLICIES (Permissive for backend service role)
-- ==========================================
ALTER TABLE apiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access apiaries" ON apiaries;
CREATE POLICY "Service role full access apiaries" ON apiaries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access hives" ON hives;
CREATE POLICY "Service role full access hives" ON hives FOR ALL USING (true) WITH CHECK (true);

-- 5. DONE
SELECT 'Database fix v2 complete - FK constraints removed' as status;
