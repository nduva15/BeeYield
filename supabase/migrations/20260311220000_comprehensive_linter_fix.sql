-- COMPREHENSIVE LINTER FIXES
-- Date: 2026-03-11
-- Description: Addresses Auth RLS Performance, Multiple Permissive Policies, and Duplicate Indexes.

-- 1. UTILITY: Optimized is_admin check (already exists but ensuring it's available)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    current_uid uuid;
BEGIN
    current_uid := (SELECT auth.uid());
    IF current_uid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = current_uid AND role IN ('admin', 'super_admin'))
        OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = current_uid)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 2. FIX DUPLICATE INDEXES
DROP INDEX IF EXISTS public.idx_contact_status;
DROP INDEX IF EXISTS public.idx_pollination_status;

-- 3. FIX PERFORMANCE & MULTIPLE POLICIES
-- We drop redundant/misconfigured policies and re-implement them with optimized patterns.

-- A. Table: agro_meteo_readings
DROP POLICY IF EXISTS "agro_meteo_readings_select_all" ON public.agro_meteo_readings;
DROP POLICY IF EXISTS "public_read_agro_meteo" ON public.agro_meteo_readings;
CREATE POLICY "public_read_agro_meteo" ON public.agro_meteo_readings FOR SELECT TO public USING (true);

-- B. Table: chat_sessions
DROP POLICY IF EXISTS "Users can read own chat_sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can inset own chat_sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can insert own chat_sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat_sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can delete own chat_sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can view own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can insert own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can delete own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_owner_access" ON public.chat_sessions;

CREATE POLICY "chat_sessions_owner_access" ON public.chat_sessions
FOR ALL TO authenticated
USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

-- C. Table: activity_logs
DROP POLICY IF EXISTS "Users can read own activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can insert own activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "authenticated_access" ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_owner_access" ON public.activity_logs;

CREATE POLICY "activity_logs_owner_access" ON public.activity_logs
FOR ALL TO authenticated
USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

-- D. Table: sensor_alerts
DROP POLICY IF EXISTS "Users can read own sensor_alerts" ON public.sensor_alerts;
DROP POLICY IF EXISTS "Users can insert own sensor_alerts" ON public.sensor_alerts;
DROP POLICY IF EXISTS "Users can update own sensor_alerts" ON public.sensor_alerts;
DROP POLICY IF EXISTS "authenticated_access" ON public.sensor_alerts;
DROP POLICY IF EXISTS "sensor_alerts_owner_access" ON public.sensor_alerts;

CREATE POLICY "sensor_alerts_owner_access" ON public.sensor_alerts
FOR ALL TO authenticated
USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

-- E. Table: automation_logs
DROP POLICY IF EXISTS "Users view own automation logs" ON public.automation_logs;
DROP POLICY IF EXISTS "Users can view own automation logs" ON public.automation_logs;
DROP POLICY IF EXISTS "authenticated_access" ON public.automation_logs;
DROP POLICY IF EXISTS "automation_logs_owner_access" ON public.automation_logs;

CREATE POLICY "automation_logs_owner_access" ON public.automation_logs
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.tasks t 
        WHERE t.id = public.automation_logs.task_id AND t.user_id = (SELECT auth.uid())
    ) OR (SELECT public.is_admin())
);

-- F. Table: saved_labels
DROP POLICY IF EXISTS "Users manage own labels" ON public.saved_labels;
DROP POLICY IF EXISTS "authenticated_access" ON public.saved_labels;
DROP POLICY IF EXISTS "saved_labels_owner_access" ON public.saved_labels;

CREATE POLICY "saved_labels_owner_access" ON public.saved_labels
FOR ALL TO authenticated
USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

-- G. Table: profiles (Multiple permissive policies fix)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_access" ON public.profiles;

CREATE POLICY "profiles_owner_access" ON public.profiles
FOR SELECT TO authenticated
USING ((SELECT auth.uid())::text = id::text OR (SELECT public.is_admin()));

CREATE POLICY "profiles_update_access" ON public.profiles
FOR UPDATE TO authenticated
USING ((SELECT auth.uid())::text = id::text OR (SELECT public.is_admin()))
WITH CHECK ((SELECT auth.uid())::text = id::text OR (SELECT public.is_admin()));

-- H. Table: apiaries & hives
DROP POLICY IF EXISTS "Users can view own apiaries" ON public.apiaries;
DROP POLICY IF EXISTS "Users can insert own apiaries" ON public.apiaries;
DROP POLICY IF EXISTS "Users can update own apiaries" ON public.apiaries;
DROP POLICY IF EXISTS "Users can delete own apiaries" ON public.apiaries;
DROP POLICY IF EXISTS "authenticated_access" ON public.apiaries;
DROP POLICY IF EXISTS "apiaries_owner_access" ON public.apiaries;

CREATE POLICY "apiaries_owner_access" ON public.apiaries
FOR ALL TO authenticated
USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Users can view own hives" ON public.hives;
DROP POLICY IF EXISTS "Users can insert own hives" ON public.hives;
DROP POLICY IF EXISTS "Users can update own hives" ON public.hives;
DROP POLICY IF EXISTS "Users can delete own hives" ON public.hives;
DROP POLICY IF EXISTS "authenticated_access" ON public.hives;
DROP POLICY IF EXISTS "hives_owner_access" ON public.hives;

CREATE POLICY "hives_owner_access" ON public.hives
FOR ALL TO authenticated
USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

-- I. Table: harvests & inspections
DROP POLICY IF EXISTS "Users can view own harvests" ON public.harvests;
DROP POLICY IF EXISTS "Users can insert own harvests" ON public.harvests;
DROP POLICY IF EXISTS "Users can update own harvests" ON public.harvests;
DROP POLICY IF EXISTS "Users can delete own harvests" ON public.harvests;
DROP POLICY IF EXISTS "authenticated_access" ON public.harvests;
DROP POLICY IF EXISTS "harvests_owner_access" ON public.harvests;

CREATE POLICY "harvests_owner_access" ON public.harvests
FOR ALL TO authenticated
USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

DROP POLICY IF EXISTS "Users can view own inspections" ON public.inspections;
DROP POLICY IF EXISTS "Users can insert own inspections" ON public.inspections;
DROP POLICY IF EXISTS "Users can update own inspections" ON public.inspections;
DROP POLICY IF EXISTS "Users can delete own inspections" ON public.inspections;
DROP POLICY IF EXISTS "authenticated_access" ON public.inspections;
DROP POLICY IF EXISTS "inspections_owner_access" ON public.inspections;

CREATE POLICY "inspections_owner_access" ON public.inspections
FOR ALL TO authenticated
USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

-- J. General content tables (Public Read Consolidation)
-- Dropping specific "Users can view own ..." for tables that are already public read.
-- This resolves the multiple permissive policy warning.

DO $$
DECLARE
    t text;
    tables text[] := ARRAY['products', 'product_variants', 'blog_posts', 'learning_lessons', 'learning_modules', 'faqs', 'partners', 'impact_stories', 'flower_sources', 'job_listings', 'job_positions'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "authenticated_access" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "public_read_access" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "public_read_flower_sources" ON public.%I', t); -- Specific fix for flower_sources
        
        EXECUTE format('CREATE POLICY "public_read_access" ON public.%I FOR SELECT TO public USING (true)', t);
    END LOOP;
END $$;

-- K. Form tables (Public Insert Consolidation)
DO $$
DECLARE
    t text;
    tables text[] := ARRAY['contact_submissions', 'contact_messages', 'pollination_requests', 'newsletter_subscribers', 'newsletter_subscriptions', 'job_applications', 'donations'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "authenticated_access" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "public_insert_access" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public can send messages" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public can subscribe" ON public.%I', t);
        
        EXECUTE format('CREATE POLICY "public_insert_access" ON public.%I FOR INSERT TO public WITH CHECK (true)', t);
    END LOOP;
END $$;

-- L. Conversations (Conditional fix for legacy/missing table)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can manage conversations" ON public.conversations';
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations';
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert own conversations" ON public.conversations';
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations';
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete own conversations" ON public.conversations';
        EXECUTE 'DROP POLICY IF EXISTS "conversations_owner_access" ON public.conversations';

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'user_id') THEN
            EXECUTE 'CREATE POLICY "conversations_owner_access" ON public.conversations
                     FOR ALL TO authenticated
                     USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
                     WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))';
        END IF;
    END IF;
END $$;

-- M. Tasks (Multiple permissive policies fix)
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
DROP POLICY IF EXISTS "authenticated_access" ON public.tasks;
DROP POLICY IF EXISTS "tasks_owner_access" ON public.tasks;

CREATE POLICY "tasks_owner_access" ON public.tasks
FOR ALL TO authenticated
USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

-- N. Farmers (Multiple permissive policies fix)
DROP POLICY IF EXISTS "Users can view own farmers" ON public.farmers;
DROP POLICY IF EXISTS "Users can insert own farmers" ON public.farmers;
DROP POLICY IF EXISTS "Users can update own farmers" ON public.farmers;
DROP POLICY IF EXISTS "Users can delete own farmers" ON public.farmers;
DROP POLICY IF EXISTS "authenticated_access" ON public.farmers;
DROP POLICY IF EXISTS "farmers_owner_access" ON public.farmers;

CREATE POLICY "farmers_owner_access" ON public.farmers
FOR ALL TO authenticated
USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

-- R. PostGIS System Tables (RLS Security Fix)
-- The spatial_ref_sys table is public and needs RLS enabled to satisfy the linter.
-- Note: In some environments, the postgres role may not be the owner. We wrap this in a DO block.
DO $$
BEGIN
    ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read access for spatial_ref_sys" ON public.spatial_ref_sys;
    CREATE POLICY "Allow public read access for spatial_ref_sys" ON public.spatial_ref_sys FOR SELECT USING (true);
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Skipping spatial_ref_sys RLS: insufficient_privilege (must be owner)';
    WHEN OTHERS THEN
        RAISE NOTICE 'Skipping spatial_ref_sys RLS: %', SQLERRM;
END $$;

-- Ensure schema cache is updated
NOTIFY pgrst, 'reload schema';
