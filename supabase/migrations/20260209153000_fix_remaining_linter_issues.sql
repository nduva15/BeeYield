-- Migration to fix remaining linter issues: Search Path, Extensions, Public Policies

-- 1. Fix Function Search Path Mutable
-- We set explicit search_path for all flagged functions to prevent hijacking.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Dynamically fix search_path for key system/analytics functions
    FOR r IN (
        SELECT oid::regprocedure::text as signature
        FROM pg_proc 
        WHERE proname IN ('get_hive_health_trends', 'handle_recurring_tasks_v2', 'exec_sql')
        AND pronamespace = 'public'::regnamespace
    ) LOOP
        EXECUTE format('ALTER FUNCTION %s SET search_path = public, extensions', r.signature);
    END LOOP;
    
    -- Special security for exec_sql if it exists
    PERFORM 1 FROM pg_proc WHERE proname = 'exec_sql';
    IF FOUND THEN
        REVOKE EXECUTE ON FUNCTION public.exec_sql(text) FROM public, anon, authenticated;
        GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
    END IF;
END $$;


DO $$
DECLARE
    r RECORD;
BEGIN
    -- Dynamically fix search_path for logging functions with complex signatures
    FOR r IN (
        SELECT oid::regprocedure::text as signature
        FROM pg_proc 
        WHERE proname IN ('log_activity', 'log_document', 'log_trace')
        AND pronamespace = 'public'::regnamespace
    ) LOOP
        EXECUTE format('ALTER FUNCTION %s SET search_path = public, extensions', r.signature);
    END LOOP;
END $$;


DO $$
DECLARE
    r RECORD;
BEGIN
    -- Fix remaining service and utility functions
    FOR r IN (
        SELECT oid::regprocedure::text as signature
        FROM pg_proc 
        WHERE proname IN (
            'is_admin_user', 
            'update_modified_column', 
            'update_image_analyses_updated_at',
            'update_updated_at_column',
            'user_roles_updated_at',
            'handle_new_user',
            'get_user_analysis_stats',
            'create_policy_if_not_exists',
            'event_trigger_fn'
        )
        AND pronamespace = 'public'::regnamespace
    ) LOOP
        EXECUTE format('ALTER FUNCTION %s SET search_path = public, extensions', r.signature);
    END LOOP;
END $$;



-- 2. Move Extensions to 'extensions' schema
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Extension Security & schema cleanup
-- Note: extensions like 'postgis' and 'pg_net' are system-managed.
-- We skip direct 'ALTER' on system tables like 'spatial_ref_sys' to avoid ownership errors.
-- These are best managed via the Supabase Dashboard or left as-is if ownership is restricted.
DO $$
BEGIN
    -- We've already moved non-system extensions where possible or secured app-level functions.
    NULL;
END $$;





-- 3. Fix Materialized View Exposure
-- Revoke access from API roles
DO $$ BEGIN
    REVOKE ALL ON TABLE public.mv_daily_page_views FROM anon, authenticated;
    REVOKE ALL ON TABLE public.mv_daily_orders FROM anon, authenticated;
    REVOKE ALL ON TABLE public.mv_daily_scans FROM anon, authenticated;
EXCEPTION WHEN OTHERS THEN NULL; END $$;



-- 4. Clean up overly permissive and duplicate RLS policies

-- Helper to clean up ALL legacy/conflicting policies for a table
CREATE OR REPLACE FUNCTION public.clean_legacy_policies(tbl_name text) RETURNS void AS $$
DECLARE
    pol_rec RECORD;
BEGIN
    FOR pol_rec IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = tbl_name
    LOOP
        -- Drop any policy that looks like it belongs to our common patterns
        IF pol_rec.policyname ~* 'admin|user|auth|public|enable|anon|service|owner|full|manage|all' THEN
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol_rec.policyname, tbl_name);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;


DO $$
BEGIN
    -- Contact Submissions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_submissions') THEN
        PERFORM public.clean_legacy_policies('contact_submissions');
        EXECUTE 'CREATE POLICY "Public insert contact_submissions" ON public.contact_submissions FOR INSERT WITH CHECK (email IS NOT NULL)';
    END IF;

    -- Donations
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'donations') THEN
        PERFORM public.clean_legacy_policies('donations');
        EXECUTE 'CREATE POLICY "Public insert donations" ON public.donations FOR INSERT WITH CHECK (amount_usd > 0)';
    END IF;

    -- Newsletter
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers') THEN
        PERFORM public.clean_legacy_policies('newsletter_subscribers');
        EXECUTE 'CREATE POLICY "Public insert newsletter_subscribers" ON public.newsletter_subscribers FOR INSERT WITH CHECK (email IS NOT NULL)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'newsletter_subscriptions') THEN
        PERFORM public.clean_legacy_policies('newsletter_subscriptions');
        EXECUTE 'CREATE POLICY "Public insert newsletter_subscriptions" ON public.newsletter_subscriptions FOR INSERT WITH CHECK (email IS NOT NULL)';
    END IF;

    -- Job Applications
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_applications') THEN
        PERFORM public.clean_legacy_policies('job_applications');
        EXECUTE 'CREATE POLICY "Public insert job_applications" ON public.job_applications FOR INSERT WITH CHECK (job_id IS NOT NULL)';
    END IF;

    -- Pollination Requests
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pollination_requests') THEN
        PERFORM public.clean_legacy_policies('pollination_requests');
        EXECUTE 'CREATE POLICY "Public insert pollination_requests" ON public.pollination_requests FOR INSERT WITH CHECK (email IS NOT NULL)';
    END IF;

    -- Orders
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        PERFORM public.clean_legacy_policies('orders');
        EXECUTE 'CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;

    -- Order Items
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
        PERFORM public.clean_legacy_policies('order_items');
        EXECUTE 'CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT WITH CHECK (
          EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
        )';
    END IF;

    -- Payment Transactions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_transactions') THEN
        PERFORM public.clean_legacy_policies('payment_transactions');
        EXECUTE 'CREATE POLICY "Users can insert own payment_transactions" ON public.payment_transactions FOR INSERT WITH CHECK (auth.uid() = customer_user_id)';
    END IF;

    -- Pollination Activity Logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pollination_activity_logs') THEN
        PERFORM public.clean_legacy_policies('pollination_activity_logs');
        EXECUTE 'CREATE POLICY "Users can insert own pollination_activity_logs" ON public.pollination_activity_logs FOR INSERT WITH CHECK (
          EXISTS (SELECT 1 FROM pollination_contracts WHERE pollination_contracts.id = pollination_activity_logs.contract_id AND pollination_contracts.user_id = auth.uid())
        )';
    END IF;

    -- Generated Documents
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'generated_documents') THEN
        PERFORM public.clean_legacy_policies('generated_documents');
        EXECUTE 'CREATE POLICY "Users can insert own generated_documents" ON public.generated_documents FOR INSERT WITH CHECK (auth.uid() = generated_by_user_id)';
    END IF;

    -- Tracing History
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tracing_history') THEN
        PERFORM public.clean_legacy_policies('tracing_history');
        EXECUTE 'CREATE POLICY "Users can insert own tracing_history" ON public.tracing_history FOR INSERT WITH CHECK (auth.uid() = traced_by_user_id)';
        EXECUTE 'CREATE POLICY "Admin full access tracing_history" ON public.tracing_history FOR ALL USING (public.is_admin())';
        EXECUTE 'CREATE POLICY "Public view tracing_history" ON public.tracing_history FOR SELECT USING (true)';
    END IF;

    -- Hives (Core)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hives') THEN
        PERFORM public.clean_legacy_policies('hives');
        EXECUTE 'CREATE POLICY "Admin full access hives" ON public.hives FOR ALL USING (public.is_admin())';
        EXECUTE 'CREATE POLICY "Users view own hives" ON public.hives FOR SELECT USING (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users insert own hives" ON public.hives FOR INSERT WITH CHECK (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users update own hives" ON public.hives FOR UPDATE USING (auth.uid() = user_id)';
    END IF;

    -- Farmers (Core)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farmers') THEN
        PERFORM public.clean_legacy_policies('farmers');
        EXECUTE 'CREATE POLICY "Admin full access farmers" ON public.farmers FOR ALL USING (public.is_admin())';
        -- ADDED BACK USER POLICY TO PREVENT BROKEN ACCESS
        EXECUTE 'CREATE POLICY "Users manage own farmers" ON public.farmers FOR ALL USING (auth.uid() = user_id)';
    END IF;

    -- Honey Batches
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'honey_batches') THEN
        PERFORM public.clean_legacy_policies('honey_batches');
        EXECUTE 'CREATE POLICY "Admin full access honey_batches" ON public.honey_batches FOR ALL USING (public.is_admin())';
    END IF;

    -- Inspections (Core)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inspections') THEN
        PERFORM public.clean_legacy_policies('inspections');
        EXECUTE 'CREATE POLICY "Admin full access inspections" ON public.inspections FOR ALL USING (public.is_admin())';
        EXECUTE 'CREATE POLICY "Users view own inspections" ON public.inspections FOR SELECT USING (EXISTS (SELECT 1 FROM hives WHERE hives.id = inspections.hive_id AND hives.user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users insert own inspections" ON public.inspections FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM hives WHERE hives.id = inspections.hive_id AND hives.user_id = auth.uid()))';
    END IF;

    -- Products
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
        PERFORM public.clean_legacy_policies('products');
        EXECUTE 'CREATE POLICY "Admin full access products" ON public.products FOR ALL USING (public.is_admin())';
        EXECUTE 'CREATE POLICY "Public view products" ON public.products FOR SELECT USING (true)';
    END IF;

    -- Product Variants
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_variants') THEN
        PERFORM public.clean_legacy_policies('product_variants');
        EXECUTE 'CREATE POLICY "Admin full access product_variants" ON public.product_variants FOR ALL USING (public.is_admin())';
        EXECUTE 'CREATE POLICY "Public view product_variants" ON public.product_variants FOR SELECT USING (true)';
    END IF;

    -- Stock Movements
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stock_movements') THEN
        PERFORM public.clean_legacy_policies('stock_movements');
        EXECUTE 'CREATE POLICY "Admin full access stock_movements" ON public.stock_movements FOR ALL USING (public.is_admin())';
    END IF;

    -- Activity Logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_logs') THEN
        PERFORM public.clean_legacy_policies('activity_logs');
        CREATE POLICY "Users can insert own activity_logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Admin view activity_logs" ON public.activity_logs FOR SELECT USING (public.is_admin());
        CREATE POLICY "Users view own activity_logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Apiaries (Core)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'apiaries') THEN
        PERFORM public.clean_legacy_policies('apiaries');
        CREATE POLICY "Users manage own apiaries" ON public.apiaries FOR ALL USING (auth.uid() = user_id);
        CREATE POLICY "Admin manage apiaries" ON public.apiaries FOR ALL USING (public.is_admin());
    END IF;

    -- Harvests (Core)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'harvests') THEN
        PERFORM public.clean_legacy_policies('harvests');
        CREATE POLICY "Users view own harvests" ON public.harvests FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users insert own harvests" ON public.harvests FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users update own harvests" ON public.harvests FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Admin full access harvests" ON public.harvests FOR ALL USING (public.is_admin());
    END IF;

    -- Pollination Contracts
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pollination_contracts') THEN
        PERFORM public.clean_legacy_policies('pollination_contracts');
        CREATE POLICY "Admin full access pollination_contracts" ON public.pollination_contracts FOR ALL USING (public.is_admin());
        CREATE POLICY "Users view own pollination_contracts" ON public.pollination_contracts FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Pollination Packages
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pollination_packages') THEN
        PERFORM public.clean_legacy_policies('pollination_packages');
        CREATE POLICY "Admin full access pollination_packages" ON public.pollination_packages FOR ALL USING (public.is_admin());
        CREATE POLICY "Public view pollination_packages" ON public.pollination_packages FOR SELECT USING (true);
    END IF;
END $$;



-- Drop helper function
DROP FUNCTION public.clean_legacy_policies(text);


