-- Migration to align form tables with frontend/backend schemas
-- Addresses missing columns in contact_submissions and pollination_requests

BEGIN;

-- 1. Update contact_submissions table
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS inquiry_type TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS farm_name TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS crop_type TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS acres DECIMAL;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS apiary_name TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS hive_count INTEGER;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS experience_years TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS form_specific_data JSONB;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- 2. Update pollination_requests table
-- Existing columns: id, name, email, phone, crop_type, acres, location_details, status, created_at
ALTER TABLE public.pollination_requests ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.pollination_requests ADD COLUMN IF NOT EXISTS farm_name TEXT;
ALTER TABLE public.pollination_requests ADD COLUMN IF NOT EXISTS farm_location TEXT;
ALTER TABLE public.pollination_requests ADD COLUMN IF NOT EXISTS preferred_start_date TEXT;
ALTER TABLE public.pollination_requests ADD COLUMN IF NOT EXISTS additional_info TEXT;

-- 3. Update newsletter_subscribers table
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'footer';

COMMIT;
