-- Reports & Exports PRD: generated_reports (history) + scheduled_reports (automation) + storage

-- 1. Generated Reports (History Log)
CREATE TABLE IF NOT EXISTS public.generated_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    report_type TEXT NOT NULL,
    parameters JSONB,
    file_format TEXT NOT NULL,
    storage_path TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Scheduled Reports (Automation)
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    report_type TEXT NOT NULL,
    frequency TEXT DEFAULT 'monthly',
    next_run_at TIMESTAMP WITH TIME ZONE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    recipients TEXT[],
    report_config JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_generated_reports_user_created ON generated_reports (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_user_active ON scheduled_reports (user_id, is_active) WHERE is_active = TRUE;

-- 4. RLS
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users access own reports') THEN
        CREATE POLICY "Users access own reports" ON generated_reports FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage schedules') THEN
        CREATE POLICY "Users manage schedules" ON scheduled_reports FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

-- 6. Storage bucket
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('user-reports', 'user-reports', false)
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 7. Storage policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        DROP POLICY IF EXISTS "Reports User View" ON storage.objects;
        CREATE POLICY "Reports User View" ON storage.objects FOR SELECT
        USING (bucket_id = 'user-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

        DROP POLICY IF EXISTS "Reports User Upload" ON storage.objects;
        CREATE POLICY "Reports User Upload" ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'user-reports' AND (storage.foldername(name))[1] = auth.uid()::text);
    END IF;
END $$;
