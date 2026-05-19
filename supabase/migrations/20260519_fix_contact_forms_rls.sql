-- ============================================================
-- FIX: Contact Forms RLS Policies
-- Version: 1.0
-- Date: 2026-05-19
-- Description: Fix broken RLS policies for public inserts
--              Change "TO public" to "TO anon, authenticated"
-- ============================================================

-- Fix contact_submissions: Allow both anon and authenticated users
DROP POLICY IF EXISTS "Allow public insert contact_submissions" ON public.contact_submissions;
CREATE POLICY "contact_submissions_public_insert" ON public.contact_submissions 
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- Allow service_role to read/update/delete
DROP POLICY IF EXISTS "service_role_all_contact" ON public.contact_submissions;
CREATE POLICY "contact_submissions_service_role" ON public.contact_submissions 
    FOR ALL 
    TO service_role
    USING (true) 
    WITH CHECK (true);

-- Fix pollination_requests: Allow both anon and authenticated users
DROP POLICY IF EXISTS "Allow public insert pollination_requests" ON public.pollination_requests;
CREATE POLICY "pollination_requests_public_insert" ON public.pollination_requests 
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- Allow service_role to read/update/delete
DROP POLICY IF EXISTS "service_role_all_pollination" ON public.pollination_requests;
CREATE POLICY "pollination_requests_service_role" ON public.pollination_requests 
    FOR ALL 
    TO service_role
    USING (true) 
    WITH CHECK (true);

-- Fix newsletter_subscribers: Allow both anon and authenticated users
DROP POLICY IF EXISTS "Allow public insert newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_subscribers_public_insert" ON public.newsletter_subscribers 
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- Allow service_role to read/update/delete
DROP POLICY IF EXISTS "service_role_all_newsletter" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_subscribers_service_role" ON public.newsletter_subscribers 
    FOR ALL 
    TO service_role
    USING (true) 
    WITH CHECK (true);

-- Fix contact_messages: Allow both anon and authenticated users
DROP POLICY IF EXISTS "Allow public insert contact_messages" ON public.contact_messages;
CREATE POLICY "contact_messages_public_insert" ON public.contact_messages 
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- Allow service_role to read/update/delete
DROP POLICY IF EXISTS "service_role_all_messages" ON public.contact_messages;
CREATE POLICY "contact_messages_service_role" ON public.contact_messages 
    FOR ALL 
    TO service_role
    USING (true) 
    WITH CHECK (true);

-- Verify tables exist and have proper structure
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pollination_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
