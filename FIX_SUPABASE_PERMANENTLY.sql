-- ==========================================
-- BEE YIELD PERMANENT DATABASE FIX
-- Forms, Newsletter, and Service Tables
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. CONTACT SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inquiry_type VARCHAR(50) DEFAULT 'general', -- 'general', 'farmer', 'beekeeper', 'business'
    topic VARCHAR(100),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    name VARCHAR(200), -- full name for convenience
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    company VARCHAR(100),
    subject TEXT,
    message TEXT,
    form_specific_data JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'new', -- 'new', 'read', 'replied', 'closed'
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Potential extra fields from various forms
    farm_name VARCHAR(200),
    crop_type VARCHAR(100),
    acres DECIMAL,
    apiary_name VARCHAR(200),
    hive_count INTEGER,
    experience_years INTEGER
);

-- 2. POLLINATION REQUESTS
CREATE TABLE IF NOT EXISTS public.pollination_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    farm_name VARCHAR(200),
    farm_location TEXT,
    crop_type VARCHAR(100),
    acres DECIMAL,
    preferred_start_date DATE,
    additional_info TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'scheduled', 'active', 'completed', 'cancelled'
    assigned_agent UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    source VARCHAR(50) DEFAULT 'website', -- 'website', 'checkout', 'popup'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. JOB APPLICATIONS
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID, -- Link to a jobs table if it exists
    job_position VARCHAR(100),
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    years_experience INTEGER,
    resume_url TEXT,
    portfolio_url TEXT,
    cover_letter TEXT,
    status VARCHAR(20) DEFAULT 'applied', -- 'applied', 'reviewing', 'interviewing', 'offered', 'rejected', 'hired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. DONATIONS/PLEDGES
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_name VARCHAR(200),
    donor_email VARCHAR(255) NOT NULL,
    amount_usd DECIMAL(12, 2),
    project_name VARCHAR(100), -- 'reforestation', 'beekeeper_training', 'hive_adoption'
    message TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pledged', -- 'pledged', 'paid', 'cancelled'
    transaction_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. JOB LISTINGS
CREATE TABLE IF NOT EXISTS public.job_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    department VARCHAR(100),
    location VARCHAR(100),
    job_type VARCHAR(50), -- 'Full-time', 'Part-time', 'Contract', 'Remote'
    description TEXT,
    requirements JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    salary_range VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    posted_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SECURITY: ENABLE RLS
-- ==========================================

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pollination_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- SECURITY: POLICIES (Allow Public Insert)
-- ==========================================

DO $$
BEGIN
    -- Contact Submissions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can submit contact form') THEN
        CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions FOR INSERT WITH CHECK (true);
    END IF;
    
    -- Pollination Requests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can request pollination') THEN
        CREATE POLICY "Anyone can request pollination" ON public.pollination_requests FOR INSERT WITH CHECK (true);
    END IF;
    
    -- Newsletter Subscribers
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can subscribe to newsletter') THEN
        CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
    END IF;

    -- Job Applications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can apply for job') THEN
        CREATE POLICY "Anyone can apply for job" ON public.job_applications FOR INSERT WITH CHECK (true);
    END IF;

    -- Donations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can pledge donation') THEN
        CREATE POLICY "Anyone can pledge donation" ON public.donations FOR INSERT WITH CHECK (true);
    END IF;

    -- Job Listings (Public View)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view active jobs') THEN
        CREATE POLICY "Anyone can view active jobs" ON public.job_listings FOR SELECT USING (is_active = true);
    END IF;
END
$$;

-- ==========================================
-- ADMIN POLICIES (Allow Service Role and Authenticated Admins)
-- ==========================================

-- Note: Service Role (used by backend) ignores RLS. 
-- These policies are for Authenticated Users (Admins) if they use the dashboard.

DO $$
BEGIN
    -- Allow authenticated users to view data (Assuming you have an admin role or just allow all authenticated for now)
    -- In a strict environment, you'd check for an 'admin' claim in JWT
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view contact submissions') THEN
        CREATE POLICY "Authenticated users can view contact submissions" ON public.contact_submissions FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view pollination requests') THEN
        CREATE POLICY "Authenticated users can view pollination requests" ON public.pollination_requests FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view newsletter subscribers') THEN
        CREATE POLICY "Authenticated users can view newsletter subscribers" ON public.newsletter_subscribers FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END
$$;

-- ==========================================
-- ENSURE EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- FINISH
-- ==========================================
PRINT 'Database Setup Complete!';
