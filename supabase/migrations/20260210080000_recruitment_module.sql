
-- 1. Create Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    department TEXT,
    location TEXT DEFAULT 'Nairobi, Kenya',
    type TEXT CHECK (type IN ('full_time', 'contract', 'internship')),
    description_html TEXT,
    salary_range TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Applications Table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin_url TEXT,
    resume_url TEXT NOT NULL,
    status TEXT DEFAULT 'applied', -- applied, screening, interview, rejected, hired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Seed Initial Jobs (Kenya Context)
INSERT INTO public.jobs (title, department, location, type, description_html) VALUES
('Apiary Manager', 'Operations', 'Kiambu, Kenya', 'full_time', '<p><strong>Responsibilities:</strong><br/>Manage 50+ hives, monitor bee health, and ensure honey production targets are met.</p><p><strong>Requirements:</strong><br/>3+ years experience with Langstroth hives.</p>'),
('Software Intern', 'Tech', 'Nairobi (Remote)', 'internship', '<p><strong>About the role:</strong><br/>Assist with dashboard development and backend API integrations.</p>');

-- 4. Enable Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- 5. Policies

-- Public can READ active jobs
DROP POLICY IF EXISTS "Public read active jobs" ON jobs;
CREATE POLICY "Public read active jobs" ON jobs 
FOR SELECT USING (is_active = TRUE);

-- Public can INSERT applications (Anyone can apply)
DROP POLICY IF EXISTS "Public apply" ON job_applications;
CREATE POLICY "Public apply" ON job_applications 
FOR INSERT WITH CHECK (true);

-- Only Admin can READ applications
DROP POLICY IF EXISTS "Admins view applications" ON job_applications;
CREATE POLICY "Admins view applications" ON job_applications 
FOR SELECT USING ((SELECT public.is_admin()));

-- Only Admin can UPDATE applications (to change status)
DROP POLICY IF EXISTS "Admins update applications" ON job_applications;
CREATE POLICY "Admins update applications" ON job_applications 
FOR UPDATE USING ((SELECT public.is_admin()));

-- 6. Storage Bucket for Resumes
-- Note: inserting into storage.buckets might fail if it already exists or if permissions are tight. 
-- We wrap in a DO block to handle existence gracefully.
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('resumes', 'resumes', false)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors regarding storage schema access if running in a restricted environment
    NULL;
END $$;

-- Policies for Storage
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        DROP POLICY IF EXISTS "Public upload resumes" ON storage.objects;
        CREATE POLICY "Public upload resumes" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'resumes');

        DROP POLICY IF EXISTS "Admins view resumes" ON storage.objects;
        CREATE POLICY "Admins view resumes" ON storage.objects
        FOR SELECT USING (bucket_id = 'resumes' AND (SELECT public.is_admin()));
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create storage policies for resumes bucket: %', SQLERRM;
END $$;
