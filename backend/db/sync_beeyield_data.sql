-- Migration to sync BeeYield Dashboard with actual user accounts
-- Adds user_id to core entities and enables RLS

-- 1. Add user_id to tables if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farmers' AND column_name='user_id') THEN
        ALTER TABLE farmers ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apiaries' AND column_name='user_id') THEN
        ALTER TABLE apiaries ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hives' AND column_name='user_id') THEN
        ALTER TABLE hives ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='user_id') THEN
        ALTER TABLE harvests ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='user_id') THEN
        ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inspections' AND column_name='user_id') THEN
        ALTER TABLE inspections ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Link existing data to the first user found (for development visibility)
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    IF v_user_id IS NOT NULL THEN
        UPDATE farmers SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE apiaries SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE hives SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE harvests SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE tasks SET user_id = v_user_id WHERE user_id IS NULL;
        UPDATE inspections SET user_id = v_user_id WHERE user_id IS NULL;
    END IF;
END $$;

-- 3. Enable RLS and add basic policies
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE apiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hives ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Policies for Farmers
DROP POLICY IF EXISTS "Users can manage their own farmers" ON farmers;
CREATE POLICY "Users can manage their own farmers" ON farmers FOR ALL USING (auth.uid() = user_id);

-- Policies for Apiaries
DROP POLICY IF EXISTS "Users can manage their own apiaries" ON apiaries;
CREATE POLICY "Users can manage their own apiaries" ON apiaries FOR ALL USING (auth.uid() = user_id);

-- Policies for Hives
DROP POLICY IF EXISTS "Users can manage their own hives" ON hives;
CREATE POLICY "Users can manage their own hives" ON hives FOR ALL USING (auth.uid() = user_id);

-- Policies for Harvests
DROP POLICY IF EXISTS "Users can manage their own harvests" ON harvests;
CREATE POLICY "Users can manage their own harvests" ON harvests FOR ALL USING (auth.uid() = user_id);

-- Policies for Tasks
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
CREATE POLICY "Users can manage their own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

-- Policies for Inspections
DROP POLICY IF EXISTS "Users can manage their own inspections" ON inspections;
CREATE POLICY "Users can manage their own inspections" ON inspections FOR ALL USING (auth.uid() = user_id);
