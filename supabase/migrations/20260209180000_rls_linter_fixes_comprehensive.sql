-- =====================================================
-- COMPREHENSIVE RLS PERFORMANCE AND LINTER FIXES
-- =====================================================
-- This migration fixes all "0003_auth_rls_initplan" warnings
-- and ensures robust Admin/User data isolation.

BEGIN;

-- 1. ENHANCED is_admin() FUNCTION
-- Handles both 'profiles' and 'user_profiles' and optimizes for performance.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $admin_check$
DECLARE
    current_uid uuid;
BEGIN
    current_uid := (SELECT auth.uid());
    IF current_uid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Try profiles first (primary source)
    IF EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = current_uid AND role IN ('admin', 'super_admin', 'superadmin')
    ) THEN
        RETURN TRUE;
    END IF;

    -- Try user_profiles as fallback
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = $1 AND role IN (''admin'', ''super_admin'', ''superadmin''))'
        INTO current_uid -- reusing variable for Boolean result
        USING current_uid;
        
        -- Note: The above EXECUTE is a bit tricky with types, let's simplify.
    END IF;

    RETURN FALSE;
END;
$admin_check$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Simplified version for stability
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $admin_check$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'super_admin', 'superadmin')
    ) OR (
        EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles')
        AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'super_admin', 'superadmin')
        )
    );
END;
$admin_check$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 2. BETTER CLEANUP FUNCTION
CREATE OR REPLACE FUNCTION public.clean_all_legacy_policies(table_name text)
RETURNS void AS $cleanup$
DECLARE
    policy_rec RECORD;
BEGIN
    FOR policy_rec IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = table_name
    LOOP
        -- Drop any policy that looks like it belongs to our common patterns
        IF policy_rec.policyname ~* 'admin|user|auth|public|enable|anon|service|owner|full|manage|all|honey|authenticated|ticket|reading' THEN
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_rec.policyname, table_name);
        END IF;

    END LOOP;
END;
$cleanup$ LANGUAGE plpgsql;

-- 3. APPLY TO EVERY TABLE IN PUBLIC SCHEMA
DO $master_fix$
DECLARE
    tbl_rec RECORD;
    user_col text;
    col_type text;
BEGIN
    FOR tbl_rec IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('spatial_ref_sys', 'profiles', 'user_profiles') -- handled separately
    LOOP
        -- Clean existing messy policies
        PERFORM public.clean_all_legacy_policies(tbl_rec.table_name);
        
        -- Identify User Column and its Type
        user_col := NULL;
        col_type := NULL;
        
        SELECT column_name, data_type INTO user_col, col_type
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = tbl_rec.table_name 
        AND column_name IN ('user_id', 'customer_user_id', 'generated_by_user_id', 'traced_by_user_id')
        ORDER BY CASE column_name 
            WHEN 'user_id' THEN 1 
            WHEN 'customer_user_id' THEN 2 
            WHEN 'generated_by_user_id' THEN 3 
            WHEN 'traced_by_user_id' THEN 4 
        END ASC
        LIMIT 1;

        -- Admin Policy (Standard for all)
        EXECUTE format('CREATE POLICY "Admin full access" ON public.%I FOR ALL USING ((SELECT public.is_admin()))', tbl_rec.table_name);

        -- User Policy (If column exists)
        IF user_col IS NOT NULL THEN
            IF col_type = 'uuid' THEN
                EXECUTE format('CREATE POLICY "Users manage own data" ON public.%I FOR ALL USING ((SELECT auth.uid()) = %I)', tbl_rec.table_name, user_col);
            ELSE
                -- Cast auth.uid() to text if the column is text/varchar
                EXECUTE format('CREATE POLICY "Users manage own data" ON public.%I FOR ALL USING ((SELECT auth.uid())::text = %I::text)', tbl_rec.table_name, user_col);
            END IF;
        END IF;

        -- Public Read (Selective)
        IF tbl_rec.table_name IN ('products', 'product_variants', 'blog_posts', 'learning_modules', 'learning_lessons', 'faqs', 'partners', 'company_stats', 'job_listings') THEN
            EXECUTE format('CREATE POLICY "Public read access" ON public.%I FOR SELECT USING (true)', tbl_rec.table_name);
        END IF;

        -- Public Insert (Forms)
        IF tbl_rec.table_name IN ('contact_submissions', 'pollination_requests', 'newsletter_subscribers', 'newsletter_subscriptions', 'job_applications', 'tracing_history') THEN
            EXECUTE format('CREATE POLICY "Public insert access" ON public.%I FOR INSERT WITH CHECK (true)', tbl_rec.table_name);
        END IF;
    END LOOP;
END $master_fix$;

-- 4. SPECIAL HANDLING FOR COMPLEX LOGIC TABLES
DO $special_fix$
BEGIN
    -- profiles
    PERFORM public.clean_all_legacy_policies('profiles');
    CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT USING ((SELECT public.is_admin()));
    CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL USING ((SELECT auth.uid()) = id);

    -- user_profiles (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        PERFORM public.clean_all_legacy_policies('user_profiles');
        CREATE POLICY "Admins view all user_profiles" ON public.user_profiles FOR SELECT USING ((SELECT public.is_admin()));
        CREATE POLICY "Users manage own user_profile" ON public.user_profiles FOR ALL USING ((SELECT auth.uid()) = id);
    END IF;

    -- apiary_shares
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'apiary_shares') THEN
        PERFORM public.clean_all_legacy_policies('apiary_shares');
        CREATE POLICY "Admin full access" ON public.apiary_shares FOR ALL USING ((SELECT public.is_admin()));
        CREATE POLICY "Owners manage shares" ON public.apiary_shares FOR ALL USING (
            EXISTS (SELECT 1 FROM public.apiaries WHERE id = apiary_shares.apiary_id AND user_id = (SELECT auth.uid()))
        );
        CREATE POLICY "Users view shared with them" ON public.apiary_shares FOR SELECT USING ((SELECT auth.uid()) = shared_with_user_id);
    END IF;

    -- pollination_activity_logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pollination_activity_logs') THEN
        PERFORM public.clean_all_legacy_policies('pollination_activity_logs');
        CREATE POLICY "Admin full access" ON public.pollination_activity_logs FOR ALL USING ((SELECT public.is_admin()));
        CREATE POLICY "Users view own activity logs" ON public.pollination_activity_logs FOR SELECT USING (
            EXISTS (SELECT 1 FROM pollination_contracts WHERE id = pollination_activity_logs.contract_id AND user_id = (SELECT auth.uid()))
        );
    END IF;

    -- request_comments
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'request_comments') THEN
        PERFORM public.clean_all_legacy_policies('request_comments');
        CREATE POLICY "Admin full access" ON public.request_comments FOR ALL USING ((SELECT public.is_admin()));
        CREATE POLICY "Users manage comments on own requests" ON public.request_comments FOR ALL USING (
            EXISTS (SELECT 1 FROM requests WHERE id = request_comments.request_id AND user_id = (SELECT auth.uid()))
        );
    END IF;

    -- generated_documents (add Public tag)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'generated_documents') THEN
        CREATE POLICY "Public viewable documents" ON public.generated_documents FOR SELECT USING (is_public = true);
    END IF;

END $special_fix$;

-- 5. FINAL CLEANUP
DROP FUNCTION public.clean_all_legacy_policies(text);

COMMIT;
