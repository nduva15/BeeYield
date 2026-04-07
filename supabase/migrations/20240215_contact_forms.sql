-- Ensure all contact and newsletter related tables exist
-- These are used by the FastAPI contact endpoints

-- 1. General Contact Submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inquiry_type TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    topic TEXT,
    message TEXT,
    company TEXT,
    farm_name TEXT,
    crop_type TEXT,
    acres DECIMAL,
    apiary_name TEXT,
    hive_count INTEGER,
    experience_years TEXT,
    form_specific_data JSONB,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Pollination Requests (Specific)
CREATE TABLE IF NOT EXISTS public.pollination_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    farm_name TEXT NOT NULL,
    farm_location TEXT NOT NULL,
    crop_type TEXT NOT NULL,
    acres DECIMAL NOT NULL,
    preferred_start_date TEXT NOT NULL,
    additional_info TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    source TEXT DEFAULT 'footer',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Quick Contact Messages (PRD Engagement Module)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pollination_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow Public Inserts (Standard for Contact Forms)
DROP POLICY IF EXISTS "Allow public insert contact_submissions" ON public.contact_submissions;
CREATE POLICY "Allow public insert contact_submissions" ON public.contact_submissions FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert pollination_requests" ON public.pollination_requests;
CREATE POLICY "Allow public insert pollination_requests" ON public.pollination_requests FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Allow public insert newsletter_subscribers" ON public.newsletter_subscribers FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert contact_messages" ON public.contact_messages;
CREATE POLICY "Allow public insert contact_messages" ON public.contact_messages FOR INSERT TO public WITH CHECK (true);

-- Allow Service Role full access (for backend synchronization)
DROP POLICY IF EXISTS "service_role_all_contact" ON public.contact_submissions;
CREATE POLICY "service_role_all_contact" ON public.contact_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_pollination" ON public.pollination_requests;
CREATE POLICY "service_role_all_pollination" ON public.pollination_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_newsletter" ON public.newsletter_subscribers;
CREATE POLICY "service_role_all_newsletter" ON public.newsletter_subscribers FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_messages" ON public.contact_messages;
CREATE POLICY "service_role_all_messages" ON public.contact_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
