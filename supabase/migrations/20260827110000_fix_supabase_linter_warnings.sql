-- Migration: Fix Supabase Linter Warnings (Auth InitPlan, Multiple Permissive Policies, Duplicate Indexes)
-- Date: 2026-08-27

BEGIN;

-- ============================================================================
-- 1. DROP DUPLICATE INDEXES (Rule 0009: duplicate_index)
-- ============================================================================
DROP INDEX IF EXISTS public.idx_varroa_hive_date;
DROP INDEX IF EXISTS public.idx_varroa_user;
DROP INDEX IF EXISTS public.idx_varroa_treatment_hive;
DROP INDEX IF EXISTS public.idx_varroa_treatment_user;

-- ============================================================================
-- 2. CONSOLIDATE QUEENS & QUEEN REARING BATCHES POLICIES (Rules 0003 & 0006)
-- ============================================================================

-- A. Table: queens
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'queens') THEN
        DROP POLICY IF EXISTS "queens_select_own" ON public.queens;
        DROP POLICY IF EXISTS "queens_insert_own" ON public.queens;
        DROP POLICY IF EXISTS "queens_update_own" ON public.queens;
        DROP POLICY IF EXISTS "queens_delete_own" ON public.queens;
        DROP POLICY IF EXISTS "queens_service_role" ON public.queens;
        DROP POLICY IF EXISTS "queens_owner_access" ON public.queens;

        CREATE POLICY "queens_owner_access" ON public.queens
        FOR ALL TO authenticated
        USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
        WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));
    END IF;
END $$;

-- B. Table: queen_rearing_batches
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'queen_rearing_batches') THEN
        DROP POLICY IF EXISTS "qrb_select_own" ON public.queen_rearing_batches;
        DROP POLICY IF EXISTS "qrb_insert_own" ON public.queen_rearing_batches;
        DROP POLICY IF EXISTS "qrb_update_own" ON public.queen_rearing_batches;
        DROP POLICY IF EXISTS "qrb_delete_own" ON public.queen_rearing_batches;
        DROP POLICY IF EXISTS "qrb_service_role" ON public.queen_rearing_batches;
        DROP POLICY IF EXISTS "qrb_owner_access" ON public.queen_rearing_batches;

        CREATE POLICY "qrb_owner_access" ON public.queen_rearing_batches
        FOR ALL TO authenticated
        USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
        WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));
    END IF;
END $$;

-- ============================================================================
-- 3. CONSOLIDATE OWNER ACCESS POLICIES (Rules 0003 & 0006)
-- ============================================================================

-- A. Table: apiaries
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'apiaries') THEN
        DROP POLICY IF EXISTS "Users can manage their own apiaries" ON public.apiaries;
        DROP POLICY IF EXISTS "authenticated_access" ON public.apiaries;
        DROP POLICY IF EXISTS "apiaries_owner_access" ON public.apiaries;

        CREATE POLICY "apiaries_owner_access" ON public.apiaries
        FOR ALL TO authenticated
        USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
        WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));
    END IF;
END $$;

-- B. Table: hives
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'hives') THEN
        DROP POLICY IF EXISTS "Users can manage their own hives" ON public.hives;
        DROP POLICY IF EXISTS "authenticated_access" ON public.hives;
        DROP POLICY IF EXISTS "hives_owner_access" ON public.hives;

        CREATE POLICY "hives_owner_access" ON public.hives
        FOR ALL TO authenticated
        USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
        WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));
    END IF;
END $$;

-- C. Table: harvests
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'harvests') THEN
        DROP POLICY IF EXISTS "Users can manage their own harvests" ON public.harvests;
        DROP POLICY IF EXISTS "authenticated_access" ON public.harvests;
        DROP POLICY IF EXISTS "harvests_owner_access" ON public.harvests;

        CREATE POLICY "harvests_owner_access" ON public.harvests
        FOR ALL TO authenticated
        USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
        WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));
    END IF;
END $$;

-- D. Table: varroa_readings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'varroa_readings') THEN
        DROP POLICY IF EXISTS "authenticated_access" ON public.varroa_readings;
        DROP POLICY IF EXISTS "varroa_readings_owner_access" ON public.varroa_readings;

        CREATE POLICY "varroa_readings_owner_access" ON public.varroa_readings
        FOR ALL TO authenticated
        USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
        WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));
    END IF;
END $$;

-- E. Table: varroa_treatments
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'varroa_treatments') THEN
        DROP POLICY IF EXISTS "authenticated_access" ON public.varroa_treatments;
        DROP POLICY IF EXISTS "varroa_treatments_owner_access" ON public.varroa_treatments;

        CREATE POLICY "varroa_treatments_owner_access" ON public.varroa_treatments
        FOR ALL TO authenticated
        USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()))
        WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));
    END IF;
END $$;

-- F. Table: profiles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles') THEN
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
    END IF;
END $$;

-- ============================================================================
-- 4. CONSOLIDATE REFERENCE & FORM TABLES POLICIES (Rule 0006)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'bee_disease_references') THEN
        DROP POLICY IF EXISTS "Admins can manage bee disease references" ON public.bee_disease_references;
        DROP POLICY IF EXISTS "Public can view published bee disease references" ON public.bee_disease_references;
        DROP POLICY IF EXISTS "bee_disease_references_public_read" ON public.bee_disease_references;

        CREATE POLICY "bee_disease_references_public_read" ON public.bee_disease_references
        FOR SELECT TO public USING (true);
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'bee_species_references') THEN
        DROP POLICY IF EXISTS "Admins can manage bee species references" ON public.bee_species_references;
        DROP POLICY IF EXISTS "Public can view published bee species references" ON public.bee_species_references;
        DROP POLICY IF EXISTS "bee_species_references_public_read" ON public.bee_species_references;

        CREATE POLICY "bee_species_references_public_read" ON public.bee_species_references
        FOR SELECT TO public USING (true);
    END IF;
END $$;

DO $$
DECLARE
    t text;
    form_tables text[] := ARRAY['contact_messages', 'contact_submissions', 'newsletter_subscribers', 'pollination_requests'];
BEGIN
    FOREACH t IN ARRAY form_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = t) THEN
            EXECUTE format('DROP POLICY IF EXISTS "Allow public insert %I" ON public.%I', t, t);
            EXECUTE format('DROP POLICY IF EXISTS "Public insert only" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "allow_anon_insert_contact_messages" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "contact_messages_public_insert" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "allow_anon_insert_contact_submissions" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "allow_anon_insert_newsletter" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "allow_anon_insert_pollination" ON public.%I', t);
            EXECUTE format('DROP POLICY IF EXISTS "public_insert_access" ON public.%I', t);

            EXECUTE format('CREATE POLICY "public_insert_access" ON public.%I FOR INSERT TO public WITH CHECK (true)', t);
        END IF;
    END LOOP;
END $$;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
