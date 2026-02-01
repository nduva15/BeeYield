-- Create Tasks Table
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

-- Register RLS for tasks if needed
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
CREATE POLICY "Users can manage their own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

-- Create Inspections Table
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID REFERENCES hives(id),
    apiary_id UUID REFERENCES apiaries(id),
    user_id UUID REFERENCES auth.users(id),
    colony_state TEXT,
    has_queen BOOLEAN,
    has_capped_brood BOOLEAN,
    has_eggs BOOLEAN,
    has_larvae BOOLEAN,
    brood_arrangement TEXT,
    bee_activity TEXT,
    weather TEXT,
    weight_category TEXT,
    weight_kg DECIMAL(10, 2),
    has_queen_cells BOOLEAN,
    queen_cells_comment TEXT,
    has_possible_illness BOOLEAN,
    diagnosis TEXT,
    treatment TEXT,
    private_note TEXT,
    inspection_date DATE DEFAULT CURRENT_DATE,
    inspection_time TIME DEFAULT CURRENT_TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Register RLS for inspections
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own inspections" ON inspections;
CREATE POLICY "Users can manage their own inspections" ON inspections FOR ALL USING (auth.uid() = user_id);

-- Add size_acres to apiaries
ALTER TABLE apiaries ADD COLUMN IF NOT EXISTS size_acres DECIMAL(10, 2) DEFAULT 0;
