-- Migration to add Requests table and fix Reports schema
-- 1. Create Requests Table
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE,
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'maintenance', 'support', 'inspection', 'other'
    status TEXT DEFAULT 'pending', -- 'pending', 'open', 'resolved', 'closed'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    subject TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for requests
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own requests') THEN
        CREATE POLICY "Users manage own requests" ON public.requests
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Add triggers for updated_at if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_requests_updated_at') THEN
        CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.requests
            FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END
$$;

-- 2. Enhance Reports Schema (if needed)
-- In 20260209000000_reports_and_exports.sql we have:
--   generated_reports: id, user_id, report_type, parameters, file_format, storage_path, status, created_at
--   scheduled_reports: id, user_id, report_type, frequency, next_run_at, last_run_at, recipients, report_config, is_active, created_at

-- Add 'name' to scheduled_reports if missing (the UI showed names like "Weekly Health Check")
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scheduled_reports' AND column_name='name') THEN
        ALTER TABLE public.scheduled_reports ADD COLUMN name TEXT;
    END IF;
END $$;

-- 3. Fix Harvests (Double check if 20260209120000_fix_timothy_data.sql left anything)
-- Ensure 'moisture_content' vs 'moisture_content_percent'
-- In 20260209120000 it used moisture_content.
-- Frontend expects moisture_content_percent? 
-- Let's check beeyieldService.ts (line 212: moisture_content_percent: number;)

DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='moisture_content') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='moisture_content_percent') THEN
        ALTER TABLE public.harvests RENAME COLUMN moisture_content TO moisture_content_percent;
    END IF;
END $$;
