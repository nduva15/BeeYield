-- Run this in your Supabase SQL Editor to fix the schema synchronization issues

-- 1. Support for Newsletter Subscription fields
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'website',
ADD COLUMN IF NOT EXISTS first_name text;

-- 2. Support for Contact Form fields
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS subject text,
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS farm_name text,
ADD COLUMN IF NOT EXISTS crop_type text,
ADD COLUMN IF NOT EXISTS acres text,
ADD COLUMN IF NOT EXISTS apiary_name text,
ADD COLUMN IF NOT EXISTS hive_count integer,
ADD COLUMN IF NOT EXISTS experience_years text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';

-- 3. Support for Pollination Requests
ALTER TABLE public.pollination_requests 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS additional_info text;

-- Grant permissions if needed (usually public/anon needs insert)
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated, service_role;
GRANT INSERT ON public.contact_submissions TO anon, authenticated, service_role;
GRANT INSERT ON public.pollination_requests TO anon, authenticated, service_role;
