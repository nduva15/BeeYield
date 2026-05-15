-- =====================================================
-- COMPREHENSIVE RLS PERFORMANCE AND CONSOLIDATION FIX
-- =====================================================
-- This migration resolves:
-- 1. "0003_auth_rls_initplan": Replaces auth.<function>() with (SELECT auth.<function>())
-- 2. "0006_multiple_permissive_policies": Consolidates overlapping policies
--
-- Tables covered: All in public schema, with special attention to owner columns.

BEGIN;

-- 1. ENSURE OPTIMIZED is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $admin_check$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'super_admin', 'superadmin')
    );
END;
$admin_check$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 2. DISABLING TRIGGER TEMPORARILY IF NEEDED? (No, not needed for RLS)

-- 3. MASTER CLEANUP AND RE-IMPLEMENTATION
DO $rls_master_fix$
DECLARE
    tbl_rec RECORD;
    user_col text;
    col_type text;
    is_public_read boolean;
    is_public_insert boolean;
    policy_rec RECORD;
BEGIN
    FOR tbl_rec IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('spatial_ref_sys') -- Skip PostGIS system table
    LOOP
        -- A. DROP ALL EXISTING POLICIES for this table
        FOR policy_rec IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = tbl_rec.table_name
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_rec.policyname, tbl_rec.table_name);
        END LOOP;

        -- B. CONFIGURATION
        -- Public read tables
        is_public_read := tbl_rec.table_name IN ('products', 'product_variants', 'blog_posts', 'learning_modules', 'learning_lessons', 'faqs', 'partners', 'company_stats', 'job_listings', 'pollination_packages', 'tracing_history');
        
        -- Public insert tables (Forms etc)
        is_public_insert := tbl_rec.table_name IN ('contact_submissions', 'pollination_requests', 'newsletter_subscribers', 'newsletter_subscriptions', 'job_applications', 'donations', 'tracing_history');

        -- C. IDENTIFY OWNER COLUMN
        user_col := NULL;
        col_type := NULL;
        SELECT column_name, data_type INTO user_col, col_type
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = tbl_rec.table_name 
        AND column_name IN ('user_id', 'customer_user_id', 'generated_by_user_id', 'traced_by_user_id')
        ORDER BY CASE column_name 
            WHEN 'user_id' THEN 1 
            WHEN 'customer_user_id' THEN 2 
            WHEN 'generated_by_user_id' THEN 3 
            WHEN 'traced_by_user_id' THEN 4 
        END ASC
        LIMIT 1;

        -- D. APPLY CONSOLIDATED POLICIES

        -- 1. Admin Access (FOR ALL)
        -- This covers all actions for admins in one single permissive policy.
        EXECUTE format('CREATE POLICY "Admin full access" ON public.%I FOR ALL TO authenticated USING ((SELECT public.is_admin()))', tbl_rec.table_name);

        -- 2. Public Read (FOR SELECT)
        IF is_public_read THEN
            EXECUTE format('CREATE POLICY "Public select access" ON public.%I FOR SELECT TO anon, authenticated USING (true)', tbl_rec.table_name);
        END IF;

        -- 3. Public Insert (FOR INSERT)
        IF is_public_insert THEN
            EXECUTE format('CREATE POLICY "Public insert access" ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', tbl_rec.table_name);
        END IF;

        -- 4. User Self-Management (FOR ALL or Specific Actions)
        IF user_col IS NOT NULL THEN
            IF is_public_read AND is_public_insert THEN
                -- If public can already read and insert, user only needs UPDATE/DELETE
                EXECUTE format('CREATE POLICY "Users manage own data" ON public.%I FOR ALL TO authenticated USING ((SELECT auth.uid())%s = %I%s)', 
                    tbl_rec.table_name, 
                    CASE WHEN col_type = 'uuid' THEN '' ELSE '::text' END,
                    user_col,
                    CASE WHEN col_type = 'uuid' THEN '' ELSE '::text' END
                );
            ELSIF is_public_read THEN
                -- Public can read, user needs INSERT/UPDATE/DELETE
                EXECUTE format('CREATE POLICY "Users manage own data" ON public.%I FOR ALL TO authenticated USING ((SELECT auth.uid())%s = %I%s) WITH CHECK ((SELECT auth.uid())%s = %I%s)', 
                    tbl_rec.table_name, 
                    CASE WHEN col_type = 'uuid' THEN '' ELSE '::text' END, user_col, CASE WHEN col_type = 'uuid' THEN '' ELSE '::text' END,
                    CASE WHEN col_type = 'uuid' THEN '' ELSE '::text' END, user_col, CASE WHEN col_type = 'uuid' THEN '' ELSE '::text' END
                );
            ELSE
                -- Standard table: User manages everything they own
                EXECUTE format('CREATE POLICY "Users manage own data" ON public.%I FOR ALL TO authenticated USING ((SELECT auth.uid())%s = %I%s) WITH CHECK ((SELECT auth.uid())%s = %I%s)', 
                    tbl_rec.table_name, 
                    CASE WHEN col_type = 'uuid' THEN '' ELSE '::text' END, user_col, CASE WHEN col_type = 'uuid' THEN '' ELSE '::text' END,
                    CASE WHEN col_type = 'uuid' THEN '' ELSE '::text' END, user_col, CASE WHEN col_type = 'uuid' THEN '' ELSE '::text' END
                );
            END IF;
        END IF;

    END LOOP;
END $rls_master_fix$;

-- 4. SPECIAL CASE TABLES (Missing owner column or complex logic)
DO $special_cases$
BEGIN
    -- profiles (Owner is 'id')
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        DROP POLICY IF EXISTS "Admin full access" ON public.profiles;
        DROP POLICY IF EXISTS "Users manage own data" ON public.profiles;
        -- Re-drop potentially renamed/legacy ones
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated profile access" ON public.profiles';
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles';
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles';
        
        CREATE POLICY "Admin full access" ON public.profiles FOR ALL TO authenticated USING ((SELECT public.is_admin()));
        CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated USING ((SELECT auth.uid()) = id);
    END IF;

    -- apiary_shares (Join logic)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'apiary_shares') THEN
        CREATE POLICY "Users view shared with them" ON public.apiary_shares FOR SELECT TO authenticated USING ((SELECT auth.uid()) = shared_with_user_id);
        CREATE POLICY "Apiary owners manage shares" ON public.apiary_shares FOR ALL TO authenticated USING (
            EXISTS (SELECT 1 FROM public.apiaries WHERE id = apiary_shares.apiary_id AND user_id = (SELECT auth.uid()))
        );
    END IF;

    -- sensor_readings & land_readings & disease_detections (Join logic)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sensor_readings') THEN
         CREATE POLICY "Users view sensor data" ON public.sensor_readings FOR SELECT TO authenticated USING (
            EXISTS (SELECT 1 FROM public.hives h WHERE h.id = sensor_readings.hive_id AND h.user_id = (SELECT auth.uid()))
         );
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'land_readings') THEN
         CREATE POLICY "Users view land data" ON public.land_readings FOR SELECT TO authenticated USING (
            EXISTS (SELECT 1 FROM public.apiaries a WHERE a.id = land_readings.apiary_id AND a.user_id = (SELECT auth.uid()))
         );
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inspections') THEN
         -- Inspections does not have user_id in some versions, it links via hive_id
         -- If it HAS user_id, it's covered by the master loop. If not, we add this:
         IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inspections' AND column_name = 'user_id') THEN
             CREATE POLICY "Users view own inspections" ON public.inspections FOR SELECT TO authenticated USING (
                EXISTS (SELECT 1 FROM public.hives h WHERE h.id = inspections.hive_id AND h.user_id = (SELECT auth.uid()))
             );
             CREATE POLICY "Users manage own inspections" ON public.inspections FOR ALL TO authenticated USING (
                EXISTS (SELECT 1 FROM public.hives h WHERE h.id = inspections.hive_id AND h.user_id = (SELECT auth.uid()))
             );
         END IF;
    END IF;

    -- pollination_activity_logs (Join logic)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pollination_activity_logs') THEN
        CREATE POLICY "Users view own pollination logs" ON public.pollination_activity_logs FOR SELECT TO authenticated USING (
            EXISTS (SELECT 1 FROM public.pollination_contracts pc WHERE pc.id = pollination_activity_logs.contract_id AND pc.user_id = (SELECT auth.uid()))
        );
    END IF;

    -- order_items (Join logic)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_items') THEN
        CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT TO authenticated USING (
            EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = (SELECT auth.uid()))
        );
        CREATE POLICY "Users create own order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
            EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = (SELECT auth.uid()))
        );
    END IF;

END $special_cases$;

COMMIT;
