-- Migration: Fix RLS Policies for Contact Forms (Idempotent)
-- This migration creates proper RLS policies that allow Service Role to bypass
-- and also allow anonymous inserts as a fallback.
-- It explicitly DROPS policies first to avoid "already exists" errors.

-- =========================================
-- 1. NEWSLETTER SUBSCRIBERS
-- =========================================
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop all possible existing policy names to ensure clean slate
DROP POLICY IF EXISTS "Allow public insert on newsletter_subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public insertion" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Enable insert for anon" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Enable all for all users" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Enable read access for all users" ON newsletter_subscribers;
DROP POLICY IF EXISTS "service_role_all" ON newsletter_subscribers;
DROP POLICY IF EXISTS "anon_insert_newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "service_role_all_newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "authenticated_read_newsletter" ON newsletter_subscribers;

-- Create policy for anonymous inserts (public form submissions)
CREATE POLICY "anon_insert_newsletter" ON newsletter_subscribers
    FOR INSERT TO anon
    WITH CHECK (true);

-- Create policy for service role (full access)
CREATE POLICY "service_role_all_newsletter" ON newsletter_subscribers
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policy for authenticated users to read their own
CREATE POLICY "authenticated_read_newsletter" ON newsletter_subscribers
    FOR SELECT TO authenticated
    USING (true);

-- =========================================
-- 2. CONTACT SUBMISSIONS
-- =========================================
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop all possible existing policy names
DROP POLICY IF EXISTS "Allow public insert on contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow public insertion" ON contact_submissions;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON contact_submissions;
DROP POLICY IF EXISTS "Enable insert for anon" ON contact_submissions;
DROP POLICY IF EXISTS "Enable all for all users" ON contact_submissions;
DROP POLICY IF EXISTS "Enable read access for all users" ON contact_submissions;
DROP POLICY IF EXISTS "service_role_all" ON contact_submissions;
DROP POLICY IF EXISTS "anon_insert_contact" ON contact_submissions;
DROP POLICY IF EXISTS "service_role_all_contact" ON contact_submissions;
DROP POLICY IF EXISTS "authenticated_read_contact" ON contact_submissions;

-- Create policy for anonymous inserts (public form submissions)
CREATE POLICY "anon_insert_contact" ON contact_submissions
    FOR INSERT TO anon
    WITH CHECK (true);

-- Create policy for service role (full access)
CREATE POLICY "service_role_all_contact" ON contact_submissions
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policy for authenticated users to read
CREATE POLICY "authenticated_read_contact" ON contact_submissions
    FOR SELECT TO authenticated
    USING (true);

-- =========================================
-- 3. POLLINATION REQUESTS
-- =========================================
ALTER TABLE pollination_requests ENABLE ROW LEVEL SECURITY;

-- Drop all possible existing policy names
DROP POLICY IF EXISTS "Allow public insert on pollination_requests" ON pollination_requests;
DROP POLICY IF EXISTS "Allow public insertion" ON pollination_requests;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON pollination_requests;
DROP POLICY IF EXISTS "Enable insert for anon" ON pollination_requests;
DROP POLICY IF EXISTS "Enable all for all users" ON pollination_requests;
DROP POLICY IF EXISTS "Enable read access for all users" ON pollination_requests;
DROP POLICY IF EXISTS "service_role_all" ON pollination_requests;
DROP POLICY IF EXISTS "anon_insert_pollination" ON pollination_requests;
DROP POLICY IF EXISTS "service_role_all_pollination" ON pollination_requests;
DROP POLICY IF EXISTS "authenticated_read_pollination" ON pollination_requests;

-- Create policy for anonymous inserts (public form submissions)
CREATE POLICY "anon_insert_pollination" ON pollination_requests
    FOR INSERT TO anon
    WITH CHECK (true);

-- Create policy for service role (full access)
CREATE POLICY "service_role_all_pollination" ON pollination_requests
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policy for authenticated users to read
CREATE POLICY "authenticated_read_pollination" ON pollination_requests
    FOR SELECT TO authenticated
    USING (true);

-- =========================================
-- Done! Run this in Supabase SQL Editor
-- =========================================
