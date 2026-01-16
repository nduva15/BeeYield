-- Create Notes Table for BeeYield
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id), -- Optional, links to the user who created the note
    
    -- Main Content
    title TEXT, -- Can be used for short summary or just mapped to description if needed
    description TEXT,
    
    -- Metadata
    note_date DATE,
    note_time TIME,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    category TEXT, -- 'General', 'Inspection', 'Feeding', 'Harvest', etc.
    
    -- Linked Entities
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE SET NULL,
    hive_id UUID REFERENCES public.hives(id) ON DELETE SET NULL,
    
    -- Attachments (Storing as array of URLs/paths to Storage bucket)
    attachments TEXT[],
    
    -- Status
    is_archived BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Allow users to see their own notes (or all notes if it's a shared team dashboard, assuming shared for now based on 'Enable read access for all users' pattern in other tables)
-- For this simulated environment, we'll use a permissive policy similar to others found in schema.sql for the demo.

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.notes;
CREATE POLICY "Enable all access for authenticated users" ON public.notes FOR ALL USING (auth.role() = 'authenticated');

-- Fallback for demo (public access if needed, though mostly auth is used)
-- CREATE POLICY "Enable read access for all users" ON public.notes FOR SELECT USING (true);
