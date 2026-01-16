-- Migration: Update contact_submissions and pollination_requests tables
-- Run this SQL in Supabase SQL Editor to fix the contact form submission issues

-- =========================================
-- 1. UPDATE POLLINATION_REQUESTS TABLE
-- =========================================
-- Add missing columns
ALTER TABLE pollination_requests ADD COLUMN IF NOT EXISTS farm_name TEXT;
ALTER TABLE pollination_requests ADD COLUMN IF NOT EXISTS farm_location TEXT;
ALTER TABLE pollination_requests ADD COLUMN IF NOT EXISTS preferred_start_date DATE;
ALTER TABLE pollination_requests ADD COLUMN IF NOT EXISTS additional_info TEXT;

-- =========================================
-- 2. UPDATE CONTACT_SUBMISSIONS TABLE
-- =========================================
-- Add all the missing columns for the contact form
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS inquiry_type TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS farm_name TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS crop_type TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS acres NUMERIC;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS apiary_name TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS hive_count INTEGER;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS experience_years TEXT;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS form_specific_data JSONB;

-- =========================================
-- 3. UPDATE NEWSLETTER_SUBSCRIBERS TABLE
-- =========================================
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS first_name TEXT;

-- =========================================
-- 4. ENSURE RLS POLICIES ALLOW INSERT
-- =========================================
-- These policies allow anyone to insert into the forms (required for public contact forms)
DROP POLICY IF EXISTS "Allow public insert on contact_submissions" ON contact_submissions;
CREATE POLICY "Allow public insert on contact_submissions" ON contact_submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert on pollination_requests" ON pollination_requests;
CREATE POLICY "Allow public insert on pollination_requests" ON pollination_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert on newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "Allow public insert on newsletter_subscribers" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

-- =========================================
-- Done! Your contact forms should now work.
-- =========================================
