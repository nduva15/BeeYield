-- ============================================
-- BeeYield User-Specific Data Migration
-- Ensures all tables have user_id and proper RLS policies
-- ============================================

-- 1. Add user_id columns to all relevant tables if missing
-- ============================================

-- Farmers table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='farmers' AND column_name='user_id') THEN
        ALTER TABLE farmers ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Apiaries table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apiaries' AND column_name='user_id') THEN
        ALTER TABLE apiaries ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add additional fields for better apiary management
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
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apiaries' AND column_name='apiary_code') THEN
        ALTER TABLE apiaries ADD COLUMN apiary_code TEXT UNIQUE;
    END IF;
END $$;

-- Hives table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hives' AND column_name='user_id') THEN
        ALTER TABLE hives ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hives' AND column_name='health_status') THEN
        ALTER TABLE hives ADD COLUMN health_status TEXT;
    END IF;
END $$;

-- Harvests table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='user_id') THEN
        ALTER TABLE harvests ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='apiary_id') THEN
        ALTER TABLE harvests ADD COLUMN apiary_id UUID REFERENCES apiaries(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='harvest_code') THEN
        ALTER TABLE harvests ADD COLUMN harvest_code TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='harvest_date') THEN
        ALTER TABLE harvests ADD COLUMN harvest_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='quantity_kg') THEN
        ALTER TABLE harvests ADD COLUMN quantity_kg DECIMAL(10, 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='honey_type') THEN
        ALTER TABLE harvests ADD COLUMN honey_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='moisture_content') THEN
        ALTER TABLE harvests ADD COLUMN moisture_content DECIMAL(5, 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='color_grade') THEN
        ALTER TABLE harvests ADD COLUMN color_grade TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='is_verified') THEN
        ALTER TABLE harvests ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Tasks table
DO $$ 
BEGIN 
    -- 1. Create table if not exists (using definition from create_tasks_table.sql)
    CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        category TEXT DEFAULT 'General',
        due_date TIMESTAMP WITH TIME ZONE,
        apiary_id UUID REFERENCES apiaries(id),
        hive_id UUID REFERENCES hives(id),
        is_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
    );

    -- 2. Add user_id if table existed but column was missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='user_id') THEN
        ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Inspections table (create if not exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='inspections') THEN
        CREATE TABLE inspections (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id),
            apiary_id UUID REFERENCES apiaries(id),
            hive_id UUID REFERENCES hives(id),
            inspection_date DATE NOT NULL,
            queen_seen BOOLEAN,
            eggs_seen BOOLEAN,
            larvae_seen BOOLEAN,
            capped_brood BOOLEAN,
            brood_pattern TEXT,
            bee_activity TEXT,
            weather TEXT,
            weight DECIMAL(10, 2),
            queen_cells BOOLEAN,
            queen_cells_comment TEXT,
            diagnosis TEXT,
            treatment TEXT,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
        );
    ELSE
        -- Add user_id if table exists but column doesn't
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inspections' AND column_name='user_id') THEN
            ALTER TABLE inspections ADD COLUMN user_id UUID REFERENCES auth.users(id);
        END IF;
    END IF;
END $$;

-- 2. Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_farmers_user_id ON farmers(user_id);
CREATE INDEX IF NOT EXISTS idx_apiaries_user_id ON apiaries(user_id);
CREATE INDEX IF NOT EXISTS idx_apiaries_code ON apiaries(apiary_code);
CREATE INDEX IF NOT EXISTS idx_hives_user_id ON hives(user_id);
CREATE INDEX IF NOT EXISTS idx_hives_apiary ON hives(apiary_id);
CREATE INDEX IF NOT EXISTS idx_harvests_user_id ON harvests(user_id);
CREATE INDEX IF NOT EXISTS idx_harvests_apiary ON harvests(apiary_id);
CREATE INDEX IF NOT EXISTS idx_harvests_hive ON harvests(hive_id);
CREATE INDEX IF NOT EXISTS idx_harvests_date ON harvests(harvest_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_inspections_user_id ON inspections(user_id);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(inspection_date);

-- 3. Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE apiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hives ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for User-Specific Data Access
-- ============================================

-- Farmers policies
DROP POLICY IF EXISTS "Users can view their own farmers" ON farmers;
CREATE POLICY "Users can view their own farmers" 
    ON farmers FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own farmers" ON farmers;
CREATE POLICY "Users can insert their own farmers" 
    ON farmers FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own farmers" ON farmers;
CREATE POLICY "Users can update their own farmers" 
    ON farmers FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own farmers" ON farmers;
CREATE POLICY "Users can delete their own farmers" 
    ON farmers FOR DELETE 
    USING (auth.uid() = user_id);

-- Apiaries policies
DROP POLICY IF EXISTS "Users can view their own apiaries" ON apiaries;
CREATE POLICY "Users can view their own apiaries" 
    ON apiaries FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own apiaries" ON apiaries;
CREATE POLICY "Users can insert their own apiaries" 
    ON apiaries FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own apiaries" ON apiaries;
CREATE POLICY "Users can update their own apiaries" 
    ON apiaries FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own apiaries" ON apiaries;
CREATE POLICY "Users can delete their own apiaries" 
    ON apiaries FOR DELETE 
    USING (auth.uid() = user_id);

-- Hives policies
DROP POLICY IF EXISTS "Users can view their own hives" ON hives;
CREATE POLICY "Users can view their own hives" 
    ON hives FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own hives" ON hives;
CREATE POLICY "Users can insert their own hives" 
    ON hives FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own hives" ON hives;
CREATE POLICY "Users can update their own hives" 
    ON hives FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own hives" ON hives;
CREATE POLICY "Users can delete their own hives" 
    ON hives FOR DELETE 
    USING (auth.uid() = user_id);

-- Harvests policies
DROP POLICY IF EXISTS "Users can view their own harvests" ON harvests;
CREATE POLICY "Users can view their own harvests" 
    ON harvests FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own harvests" ON harvests;
CREATE POLICY "Users can insert their own harvests" 
    ON harvests FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own harvests" ON harvests;
CREATE POLICY "Users can update their own harvests" 
    ON harvests FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own harvests" ON harvests;
CREATE POLICY "Users can delete their own harvests" 
    ON harvests FOR DELETE 
    USING (auth.uid() = user_id);

-- Tasks policies
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
CREATE POLICY "Users can view their own tasks" 
    ON tasks FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
CREATE POLICY "Users can insert their own tasks" 
    ON tasks FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
CREATE POLICY "Users can update their own tasks" 
    ON tasks FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
CREATE POLICY "Users can delete their own tasks" 
    ON tasks FOR DELETE 
    USING (auth.uid() = user_id);

-- Inspections policies
DROP POLICY IF EXISTS "Users can view their own inspections" ON inspections;
CREATE POLICY "Users can view their own inspections" 
    ON inspections FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own inspections" ON inspections;
CREATE POLICY "Users can insert their own inspections" 
    ON inspections FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own inspections" ON inspections;
CREATE POLICY "Users can update their own inspections" 
    ON inspections FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own inspections" ON inspections;
CREATE POLICY "Users can delete their own inspections" 
    ON inspections FOR DELETE 
    USING (auth.uid() = user_id);

-- 5. Admin Override Policies (for admin dashboard access)
-- ============================================

-- Allow admins to view all data (add after user policies)
DROP POLICY IF EXISTS "Admins can view all farmers" ON farmers;
CREATE POLICY "Admins can view all farmers" 
    ON farmers FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
                 OR auth.users.raw_user_meta_data->>'role' = 'superadmin')
        )
    );

DROP POLICY IF EXISTS "Admins can view all apiaries" ON apiaries;
CREATE POLICY "Admins can view all apiaries" 
    ON apiaries FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
                 OR auth.users.raw_user_meta_data->>'role' = 'superadmin')
        )
    );

DROP POLICY IF EXISTS "Admins can view all hives" ON hives;
CREATE POLICY "Admins can view all hives" 
    ON hives FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
                 OR auth.users.raw_user_meta_data->>'role' = 'superadmin')
        )
    );

DROP POLICY IF EXISTS "Admins can view all harvests" ON harvests;
CREATE POLICY "Admins can view all harvests" 
    ON harvests FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
                 OR auth.users.raw_user_meta_data->>'role' = 'superadmin')
        )
    );

-- 6. Link existing data to first user (for development/testing)
-- ============================================
-- This is optional and should be commented out in production

/*
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
*/

-- 7. Generate apiary codes for existing records
-- ============================================

DO $$
DECLARE
    apiary_record RECORD;
    new_code TEXT;
BEGIN
    FOR apiary_record IN 
        SELECT id FROM apiaries WHERE apiary_code IS NULL
    LOOP
        new_code := 'APY-' || UPPER(SUBSTRING(apiary_record.id::TEXT FROM 1 FOR 8));
        UPDATE apiaries SET apiary_code = new_code WHERE id = apiary_record.id;
    END LOOP;
END $$;

-- Migration complete!
-- All tables now have user_id fields and proper RLS policies
-- Users can only access their own data, admins can see everything
