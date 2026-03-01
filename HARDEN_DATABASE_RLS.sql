-- BeeYield Project: Universal RLS Hardening Script
-- This script ensures ALL tables have RLS enabled and default to DENY except for specific allowed roles.

-- ====================================================================
-- 1. UTILITY FUNCTION: ENABLE RLS FOR ALL TABLES IN PUBLIC SCHEMA
-- ====================================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns', 'raster_columns', 'raster_overviews')
    ) LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
        EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' FORCE ROW LEVEL SECURITY;';
    END LOOP;
END $$;

-- ====================================================================
-- 2. DEFINE SYSTEM ROLE POLICIES (Backend Full Access)
-- ====================================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns', 'raster_columns', 'raster_overviews')
    ) LOOP
        -- Service Role (Backend/Admin) gets full access
        EXECUTE 'DROP POLICY IF EXISTS "service_role_all" ON ' || quote_ident(r.tablename);
        EXECUTE 'CREATE POLICY "service_role_all" ON ' || quote_ident(r.tablename) || 
                ' FOR ALL TO service_role USING (true) WITH CHECK (true);';
    END LOOP;
END $$;

-- ====================================================================
-- 3. DEFINE AUTHENTICATED USER POLICIES (User Self-Management)
-- ====================================================================
-- Note: Some tables need custom user_id matching logic.

-- General "Own Data" policy for tables with user_id or id matching
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns', 'raster_columns', 'raster_overviews')
    ) LOOP
        -- 1. Check for 'user_id' column (Common pattern)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = r.tablename AND column_name = 'user_id') THEN
            EXECUTE 'DROP POLICY IF EXISTS "Users can manage own data" ON ' || quote_ident(r.tablename);
            -- Explicit cast to text for both sides to handle cases where user_id is TEXT vs UUID
            EXECUTE 'CREATE POLICY "Users can manage own data" ON ' || quote_ident(r.tablename) || 
                    ' FOR ALL TO authenticated USING ((SELECT auth.uid())::text = user_id::text) WITH CHECK ((SELECT auth.uid())::text = user_id::text);';
        
        -- 2. Check for 'profiles' style link (id is the user_id)
        ELSIF r.tablename IN ('profiles', 'user_profiles') THEN
            EXECUTE 'DROP POLICY IF EXISTS "Users can manage own data" ON ' || quote_ident(r.tablename);
            EXECUTE 'CREATE POLICY "Users can manage own data" ON ' || quote_ident(r.tablename) || 
                    ' FOR ALL TO authenticated USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);';
        END IF;
    END LOOP;
END $$;

-- ====================================================================
-- 3.5. PUBLIC SUBMISSION POLICIES (Allow public insert for forms)
-- ====================================================================
DO $$
DECLARE
    form_tables TEXT[] := ARRAY['contact_submissions', 'contact_messages', 'pollination_requests', 'newsletter_subscribers', 'job_applications', 'donations'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY form_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = t) THEN
            EXECUTE 'DROP POLICY IF EXISTS "Allow public insert" ON ' || quote_ident(t);
            EXECUTE 'CREATE POLICY "Allow public insert" ON ' || quote_ident(t) || 
                    ' FOR INSERT TO public WITH CHECK (true);';
        END IF;
    END LOOP;
END $$;

-- ====================================================================
-- 4. PUBLIC READ POLICIES (Read-Only Content)
-- ====================================================================
DO $$
DECLARE
    public_read_tables TEXT[] := ARRAY['products', 'product_variants', 'blog_posts', 'learning_lessons'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY public_read_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = t) THEN
            EXECUTE 'DROP POLICY IF EXISTS "Public read access" ON ' || quote_ident(t);
            EXECUTE 'CREATE POLICY "Public read access" ON ' || quote_ident(t) || 
                    ' FOR SELECT TO public USING (true);';
        END IF;
    END LOOP;
END $$;

-- ====================================================================
-- 5. ADMIN FULL ACCESS (Role-based Bypass)
-- ====================================================================
-- Admins should be able to see/edit everything. 
-- This assumes a 'role' exists in 'profiles' or we use raw metadata check.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns', 'raster_columns', 'raster_overviews')
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Admin full access" ON ' || quote_ident(r.tablename);
        -- Logic: If user metadata contains role 'admin' or 'super_admin'
        EXECUTE 'CREATE POLICY "Admin full access" ON ' || quote_ident(r.tablename) || 
                ' FOR ALL TO authenticated USING (
                    ((SELECT auth.jwt()) ->> ''user_metadata'')::jsonb ->> ''role'' IN (''admin'', ''super_admin'')
                    OR (SELECT auth.email()) = ''timothynduva349@gmail.com''
                );';
    END LOOP;
END $$;
