-- ============================================================
-- BeeYield Contact Forms & Submissions
-- Version: 1.0
-- Date: 2026-02-11
-- Description: Creates tables for:
--   1. Contact Submissions (General, Grower, Beekeeper)
--   2. Pollination Requests
--   3. Newsletter Subscribers
-- Includes RLS policies for public inserts.
-- ============================================================

-- =========================
-- 1. CONTACT SUBMISSIONS
-- =========================
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_type TEXT NOT NULL, -- 'grower', 'beekeeper', 'general', 'diseases'
    first_name TEXT,
    last_name TEXT,
    name TEXT,        -- derived: first + last
    email TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    topic TEXT,
    subject TEXT,     -- derived: inquiry_type + topic
    message TEXT,
    
    -- Optional fields
    company TEXT,
    farm_name TEXT,
    crop_type TEXT,
    acres FLOAT,
    apiary_name TEXT,
    hive_count INTEGER,
    experience_years TEXT,
    
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded', 'archived')),
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.contact_submissions IS 'Stores all contact form submissions from the website.';

CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_submissions (email);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions (status);
CREATE INDEX IF NOT EXISTS idx_contact_type ON contact_submissions (inquiry_type);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (anyone can contact us)
DROP POLICY IF EXISTS "Public insert contact_submissions" ON contact_submissions;
CREATE POLICY "Public insert contact_submissions" ON contact_submissions
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Only admins can view/update/delete
DROP POLICY IF EXISTS "Admins manage contact_submissions" ON contact_submissions;
CREATE POLICY "Admins manage contact_submissions" ON contact_submissions
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
    
-- (Optional) If you have an admin role in auth.users, add policy here.
-- For now service_role is sufficient for backend processing.


-- =========================
-- 2. POLLINATION REQUESTS
-- =========================
CREATE TABLE IF NOT EXISTS public.pollination_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    farm_name TEXT,
    farm_location TEXT,
    crop_type TEXT,
    acres FLOAT,
    preferred_start_date DATE,
    additional_info TEXT,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'completed', 'cancelled')),
    internal_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.pollination_requests IS 'Service requests for pollination contracts.';

CREATE INDEX IF NOT EXISTS idx_pollination_email ON pollination_requests (email);
CREATE INDEX IF NOT EXISTS idx_pollination_status ON pollination_requests (status);

ALTER TABLE pollination_requests ENABLE ROW LEVEL SECURITY;

-- Allow public inserts
DROP POLICY IF EXISTS "Public insert pollination_requests" ON pollination_requests;
CREATE POLICY "Public insert pollination_requests" ON pollination_requests
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Only admins/service_role can view/manage
DROP POLICY IF EXISTS "Service role manages pollination" ON pollination_requests;
CREATE POLICY "Service role manages pollination" ON pollination_requests
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);


-- =========================
-- 3. NEWSLETTER SUBSCRIBERS
-- =========================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    source TEXT DEFAULT 'footer',
    is_active BOOLEAN DEFAULT true,
    unsubscribed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.newsletter_subscribers IS 'Email newsletter subscribers list.';

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (email);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public inserts
DROP POLICY IF EXISTS "Public insert newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "Public insert newsletter_subscribers" ON newsletter_subscribers
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Only service_role can view full list (spam protection)
DROP POLICY IF EXISTS "Service role manages newsletter" ON newsletter_subscribers;
CREATE POLICY "Service role manages newsletter" ON newsletter_subscribers
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
