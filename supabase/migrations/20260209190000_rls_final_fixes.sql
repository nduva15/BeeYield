-- =====================================================
-- FINAL RLS PERFORMANCE AND LINTER RESOLUTION (v2)
-- =====================================================
-- This migration addresses:
-- 1. "0003_auth_rls_initplan" (using (SELECT auth.uid()) and (SELECT public.is_admin()))
-- 2. "0006_multiple_permissive_policies" (by combining Admin/User policies into ONE)
-- 3. Robust Cleanup (Drops ALL policies before applying optimized ones)

BEGIN;

-- 1. OPTIMIZED is_admin() FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $admin_check$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) 
        AND role IN ('admin', 'super_admin', 'superadmin', 'staff', 'owner')
    );
END;
$admin_check$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 2. AGGRESSIVE CLEANUP FUNCTION
CREATE OR REPLACE FUNCTION public.drop_all_policies(tbl_name text)
RETURNS void AS $drop$
DECLARE
    pol_rec RECORD;
BEGIN
    FOR pol_rec IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = tbl_name
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol_rec.policyname, tbl_name);
    END LOOP;
END;
$drop$ LANGUAGE plpgsql;

-- 3. BROAD FIX FOR ALL TABLES (Unified Policy Pattern)
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
        AND table_name NOT IN ('spatial_ref_sys') 
    LOOP
        -- Step 0: Ensure RLS is enabled
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_rec.table_name);

        -- Step A: Clear slate
        PERFORM public.drop_all_policies(tbl_rec.table_name);
        
        -- Step B: Identify Actor/Owner Column
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

        -- Step C: Unified Authenticated Access Policy
        -- COMBINING Admin and User access into ONE permissive policy to satisfy linter rule 0006.
        -- Using (SELECT ...) patterns to satisfy linter rule 0003.
        IF user_col IS NOT NULL THEN
            IF col_type = 'uuid' THEN
                EXECUTE format('CREATE POLICY "Authenticated users and admins" ON public.%I FOR ALL TO authenticated USING ((SELECT public.is_admin()) OR (SELECT auth.uid()) = %I)', tbl_rec.table_name, user_col);
            ELSE
                EXECUTE format('CREATE POLICY "Authenticated users and admins" ON public.%I FOR ALL TO authenticated USING ((SELECT public.is_admin()) OR (SELECT auth.uid())::text = %I::text)', tbl_rec.table_name, user_col);
            END IF;
        ELSE
            -- Just admin if no user column
            EXECUTE format('CREATE POLICY "Admins full access" ON public.%I FOR ALL TO authenticated USING ((SELECT public.is_admin()))', tbl_rec.table_name);
        END IF;

        -- Step D: Public Content (Read Always)
        IF tbl_rec.table_name IN ('products', 'product_variants', 'blog_posts', 'learning_modules', 'learning_lessons', 'faqs', 'partners', 'company_stats', 'job_listings') THEN
            EXECUTE format('CREATE POLICY "Public read access" ON public.%I FOR SELECT TO anon, authenticated USING (true)', tbl_rec.table_name);
        END IF;

        -- Step E: Public Interaction (Insert Always)
        IF tbl_rec.table_name IN ('contact_submissions', 'pollination_requests', 'newsletter_subscribers', 'newsletter_subscriptions', 'job_applications', 'tracing_history', 'donations') THEN
            EXECUTE format('CREATE POLICY "Public insert access" ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', tbl_rec.table_name);
        END IF;

    END LOOP;
END $master_fix$;

-- 4. RE-APPLY SPECIAL CASES (Indirect checks)
DO $special_fix$
BEGIN
    -- profiles (id is the user identifier here)
    PERFORM public.drop_all_policies('profiles');
    CREATE POLICY "Authenticated users and admins" ON public.profiles FOR ALL TO authenticated USING ((SELECT public.is_admin()) OR (SELECT auth.uid()) = id);

    -- apiary_shares
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'apiary_shares') THEN
        PERFORM public.drop_all_policies('apiary_shares');
        CREATE POLICY "Authenticated access apiary_shares" ON public.apiary_shares FOR ALL TO authenticated USING (
            (SELECT public.is_admin()) OR 
            (SELECT auth.uid()) = shared_with_user_id OR
            EXISTS (SELECT 1 FROM public.apiaries WHERE id = apiary_shares.apiary_id AND user_id = (SELECT auth.uid()))
        );
    END IF;

    -- sensor_readings
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sensor_readings') THEN
        PERFORM public.drop_all_policies('sensor_readings');
        CREATE POLICY "Authenticated access sensor_readings" ON public.sensor_readings FOR ALL TO authenticated USING (
            (SELECT public.is_admin()) OR 
            EXISTS (SELECT 1 FROM public.hives h WHERE h.id = sensor_readings.hive_id AND h.user_id = (SELECT auth.uid()))
        );
    END IF;

    -- land_readings
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'land_readings') THEN
        PERFORM public.drop_all_policies('land_readings');
        CREATE POLICY "Authenticated access land_readings" ON public.land_readings FOR ALL TO authenticated USING (
            (SELECT public.is_admin()) OR 
            EXISTS (SELECT 1 FROM public.apiaries a WHERE a.id = land_readings.apiary_id AND a.user_id = (SELECT auth.uid()))
        );
    END IF;

    -- disease_detections
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'disease_detections') THEN
        PERFORM public.drop_all_policies('disease_detections');
        CREATE POLICY "Authenticated access disease_detections" ON public.disease_detections FOR ALL TO authenticated USING (
            (SELECT public.is_admin()) OR 
            EXISTS (SELECT 1 FROM public.hives h WHERE h.id = disease_detections.hive_id AND h.user_id = (SELECT auth.uid()))
        );
    END IF;

    -- request_comments
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'request_comments') THEN
        PERFORM public.drop_all_policies('request_comments');
        CREATE POLICY "Authenticated access request_comments" ON public.request_comments FOR ALL TO authenticated USING (
            (SELECT public.is_admin()) OR 
            EXISTS (SELECT 1 FROM requests WHERE id = request_comments.request_id AND user_id = (SELECT auth.uid()))
        );
    END IF;

END $special_fix$;

-- 5. FINAL HOUSEKEEPING
DROP FUNCTION public.drop_all_policies(text);

COMMIT;
