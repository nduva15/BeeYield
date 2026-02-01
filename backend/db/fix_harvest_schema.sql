-- Migration to fix harvests table columns for BeeYield Dashboard
-- Adds missing columns required for full traceability and dashboard display

DO $$ 
BEGIN 
    -- 1. Add user_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='user_id') THEN
        ALTER TABLE harvests ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;

    -- 2. Add batch_code if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='batch_code') THEN
        ALTER TABLE harvests ADD COLUMN batch_code TEXT;
    END IF;

    -- 3. Add honey_type if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='honey_type') THEN
        ALTER TABLE harvests ADD COLUMN honey_type TEXT;
    END IF;

    -- 4. Add color_grade if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='color_grade') THEN
        ALTER TABLE harvests ADD COLUMN color_grade TEXT;
    END IF;

    -- 5. Add is_verified if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='is_verified') THEN
        ALTER TABLE harvests ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;

    -- 6. Add harvest_id if missing (legacy field used in some services)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='harvest_id') THEN
        ALTER TABLE harvests ADD COLUMN harvest_id TEXT;
    END IF;

    -- 7. Add harvest_code if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='harvest_code') THEN
        ALTER TABLE harvests ADD COLUMN harvest_code TEXT;
    END IF;

    -- 8. Add update_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='updated_at') THEN
        ALTER TABLE harvests ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());
    END IF;

END $$;

-- Enable RLS (standard for all beeyield tables)
ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;

-- Add policy if not exists
DROP POLICY IF EXISTS "Users can manage their own harvests" ON harvests;
CREATE POLICY "Users can manage their own harvests" ON harvests 
    FOR ALL 
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_harvests_batch ON harvests(batch_code);
CREATE INDEX IF NOT EXISTS idx_harvests_user ON harvests(user_id);
CREATE INDEX IF NOT EXISTS idx_harvests_hive ON harvests(hive_id);
CREATE INDEX IF NOT EXISTS idx_harvests_date ON harvests(harvest_date);
