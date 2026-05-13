-- =============================================================
-- Migration: Fix RLS policies for public form submission tables
-- Date: 2026-05-12
-- Issue: Contact form, newsletter subscription, and pollination
--        request submissions fail with "row-level security policy"
--        error because no INSERT policy exists for anonymous users.
-- =============================================================

-- 1. contact_submissions: allow anonymous INSERT
DO $$ BEGIN
  CREATE POLICY allow_anon_insert_contact_submissions 
    ON public.contact_submissions FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. contact_messages: allow anonymous INSERT
DO $$ BEGIN
  CREATE POLICY allow_anon_insert_contact_messages 
    ON public.contact_messages FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. newsletter_subscribers: allow anonymous INSERT + UPDATE (needed for upsert on duplicate email)
DO $$ BEGIN
  CREATE POLICY allow_anon_insert_newsletter 
    ON public.newsletter_subscribers FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY allow_anon_update_newsletter 
    ON public.newsletter_subscribers FOR UPDATE TO anon USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. pollination_requests: allow anonymous INSERT
DO $$ BEGIN
  CREATE POLICY allow_anon_insert_pollination 
    ON public.pollination_requests FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
