-- Report Generation Tables Migration
-- Ensures generated_reports and scheduled_reports have all required columns

-- 1. generated_reports
CREATE TABLE IF NOT EXISTS public.generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    report_type TEXT NOT NULL DEFAULT 'full_summary',
    file_format TEXT DEFAULT 'PDF',
    parameters JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_url TEXT,
    file_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. scheduled_reports
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    report_type TEXT NOT NULL DEFAULT 'full_summary',
    frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    recipients TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    report_config JSONB DEFAULT '{}'::jsonb,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add missing columns if tables already exist
ALTER TABLE public.generated_reports ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.generated_reports ADD COLUMN IF NOT EXISTS parameters JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.scheduled_reports ADD COLUMN IF NOT EXISTS report_config JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.scheduled_reports ADD COLUMN IF NOT EXISTS last_run_at TIMESTAMPTZ;

-- 4. Enable RLS
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

-- 5. Policies for user access
DROP POLICY IF EXISTS "user_own_generated_reports" ON public.generated_reports;
CREATE POLICY "user_own_generated_reports" ON public.generated_reports
    FOR ALL TO authenticated
    USING ((SELECT auth.uid())::text = user_id::text)
    WITH CHECK ((SELECT auth.uid())::text = user_id::text);

DROP POLICY IF EXISTS "service_role_generated_reports" ON public.generated_reports;
CREATE POLICY "service_role_generated_reports" ON public.generated_reports
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "user_own_scheduled_reports" ON public.scheduled_reports;
CREATE POLICY "user_own_scheduled_reports" ON public.scheduled_reports
    FOR ALL TO authenticated
    USING ((SELECT auth.uid())::text = user_id::text)
    WITH CHECK ((SELECT auth.uid())::text = user_id::text);

DROP POLICY IF EXISTS "service_role_scheduled_reports" ON public.scheduled_reports;
CREATE POLICY "service_role_scheduled_reports" ON public.scheduled_reports
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. Create Supabase Storage bucket for reports (idempotent via INSERT)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reports', 'reports', true) 
ON CONFLICT (id) DO NOTHING;

-- 7. Storage policy for the bucket
DROP POLICY IF EXISTS "Reports public download" ON storage.objects;
CREATE POLICY "Reports public download" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'reports');

DROP POLICY IF EXISTS "Authenticated upload reports" ON storage.objects;
CREATE POLICY "Authenticated upload reports" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reports');

DROP POLICY IF EXISTS "Service role full access reports" ON storage.objects;
CREATE POLICY "Service role full access reports" ON storage.objects
    FOR ALL TO service_role USING (bucket_id = 'reports') WITH CHECK (bucket_id = 'reports');

NOTIFY pgrst, 'reload schema';
