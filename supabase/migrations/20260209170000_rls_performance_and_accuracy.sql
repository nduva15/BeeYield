-- =====================================================
-- RLS PERFORMANCE AND ACCURACY OPTIMIZATION
-- =====================================================
-- This migration addresses Supabase linter warnings (0003_auth_rls_initplan)
-- and corrects column-specific RLS policies for admin oversight tables.

-- 1. OPTIMIZE is_admin() FUNCTION
-- Ensure it uses subquery for auth.uid() to avoid row-by-row overhead
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    current_uid uuid;
BEGIN
    current_uid := (SELECT auth.uid());
    IF current_uid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = current_uid AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 2. HELPER FUNCTION TO CLEAN UP LEGACY POLICIES
CREATE OR REPLACE FUNCTION public.clean_legacy_policies(tbl_name text)
RETURNS void AS $$
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


-- 3. APPLY OPTIMIZED POLICIES FOR CORE TABLES
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'products', 'product_variants', 'farmers', 'apiaries', 'hives', 
        'harvests', 'inspections', 'tasks', 'orders', 'order_items',
        'blog_posts', 'learning_modules', 'learning_lessons', 'stock_movements',
        'requests', 'request_comments'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            PERFORM clean_legacy_policies(tbl);
            
            -- Admin Policy (Optimized)
            EXECUTE format('CREATE POLICY "Admin full access" ON public.%I FOR ALL USING ((SELECT public.is_admin()))', tbl);
            
            -- Public View Policy (if applicable)
            IF tbl IN ('products', 'product_variants', 'blog_posts', 'learning_modules', 'learning_lessons') THEN
                EXECUTE format('CREATE POLICY "Public read access" ON public.%I FOR SELECT USING (true)', tbl);
            END IF;
            
            -- User Self-Management (Optimized)
            -- Most of these tables use user_id
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'user_id') THEN
                EXECUTE format('CREATE POLICY "Users manage own data" ON public.%I FOR ALL USING ((SELECT auth.uid()) = user_id)', tbl);
            END IF;
        END IF;
    END LOOP;
END $$;

-- 4. FIX ACCURACY FOR SPECIAL TABLES (Custom User Columns)
DO $$
BEGIN
    -- payment_transactions (uses customer_user_id)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_transactions') THEN
        PERFORM clean_legacy_policies('payment_transactions');
        CREATE POLICY "Admin full access" ON public.payment_transactions FOR ALL USING ((SELECT public.is_admin()));
        CREATE POLICY "Users view own payments" ON public.payment_transactions FOR SELECT USING ((SELECT auth.uid()) = customer_user_id);
    END IF;

    -- tracing_history (uses traced_by_user_id)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tracing_history') THEN
        PERFORM clean_legacy_policies('tracing_history');
        CREATE POLICY "Admin full access" ON public.tracing_history FOR ALL USING ((SELECT public.is_admin()));
        CREATE POLICY "Users view own traces" ON public.tracing_history FOR SELECT USING ((SELECT auth.uid()) = traced_by_user_id);
        CREATE POLICY "Public trace insert" ON public.tracing_history FOR INSERT WITH CHECK (true);
        CREATE POLICY "Public trace view" ON public.tracing_history FOR SELECT USING (true);
    END IF;

    -- generated_documents (uses generated_by_user_id)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'generated_documents') THEN
        PERFORM clean_legacy_policies('generated_documents');
        CREATE POLICY "Admin full access" ON public.generated_documents FOR ALL USING ((SELECT public.is_admin()));
        CREATE POLICY "Users view own documents" ON public.generated_documents FOR SELECT USING ((SELECT auth.uid()) = generated_by_user_id OR is_public = true);
    END IF;

    -- pollination_activity_logs (Join on pollination_contracts)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pollination_activity_logs') THEN
        PERFORM clean_legacy_policies('pollination_activity_logs');
        CREATE POLICY "Admin full access" ON public.pollination_activity_logs FOR ALL USING ((SELECT public.is_admin()));
        CREATE POLICY "Users view own activity logs" ON public.pollination_activity_logs FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM pollination_contracts 
                WHERE pollination_contracts.id = pollination_activity_logs.contract_id 
                AND pollination_contracts.user_id = (SELECT auth.uid())
            )
        );
    END IF;

    -- 5. FIX POLLINATION MODULE PERFORMANCE
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pollination_contracts') THEN
        PERFORM clean_legacy_policies('pollination_contracts');
        CREATE POLICY "Admin full access" ON public.pollination_contracts FOR ALL USING ((SELECT public.is_admin()));
        CREATE POLICY "Users manage own contracts" ON public.pollination_contracts FOR ALL USING ((SELECT auth.uid()) = user_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hive_assignments') THEN
        PERFORM clean_legacy_policies('hive_assignments');
        CREATE POLICY "Admin full access" ON public.hive_assignments FOR ALL USING ((SELECT public.is_admin()));
        CREATE POLICY "Users view own assignments" ON public.hive_assignments FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM pollination_contracts 
                WHERE pollination_contracts.id = hive_assignments.contract_id 
                AND pollination_contracts.user_id = (SELECT auth.uid())
            )
        );
    END IF;

    -- account_registry (uses user_id)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'account_registry') THEN
        PERFORM clean_legacy_policies('account_registry');
        CREATE POLICY "Admin full access" ON public.account_registry FOR ALL USING ((SELECT public.is_admin()));
        CREATE POLICY "Users view own account" ON public.account_registry FOR SELECT USING ((SELECT auth.uid()) = user_id);
    END IF;

    -- invoice_registry (uses customer_user_id)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoice_registry') THEN
        PERFORM clean_legacy_policies('invoice_registry');
        CREATE POLICY "Admin full access" ON public.invoice_registry FOR ALL USING ((SELECT public.is_admin()));
        CREATE POLICY "Users view own invoices" ON public.invoice_registry FOR SELECT USING ((SELECT auth.uid()) = customer_user_id);
    END IF;

    -- request_comments (Join on requests)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'request_comments') THEN
        PERFORM clean_legacy_policies('request_comments');
        CREATE POLICY "Admin full access" ON public.request_comments FOR ALL USING ((SELECT public.is_admin()));
        CREATE POLICY "Users view comments on own requests" ON public.request_comments FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM requests 
                WHERE requests.id = request_comments.request_id 
                AND requests.user_id = (SELECT auth.uid())
            )
        );
        CREATE POLICY "Users add comments to own requests" ON public.request_comments FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM requests 
                WHERE requests.id = request_comments.request_id 
                AND requests.user_id = (SELECT auth.uid())
            )
        );
    END IF;
END $$;

-- 6. CLEANUP
DROP FUNCTION public.clean_legacy_policies(text);

COMMIT;
