-- Create Tasks Table for BeeYield
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id), -- If using Supabase auth
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'in_progress'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    category TEXT DEFAULT 'General', -- 'Inspection', 'Feeding', 'Harvest', 'General'
    due_date TIMESTAMP WITH TIME ZONE,
    apiary_id UUID REFERENCES apiaries(id),
    hive_id UUID REFERENCES hives(id),
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Add index for faster querying
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);
