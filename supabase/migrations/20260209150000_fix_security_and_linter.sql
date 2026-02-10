-- Fix Security Definer Views
-- These views were flagged as Security Definer, implying they run with creator privileges.
-- We switch them to Security Invoker to enforce RLS of the querying user.

DO $$ BEGIN
  ALTER VIEW IF EXISTS public.hive_alert_settings_view SET (security_invoker = true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER VIEW IF EXISTS public.admin_payment_summary SET (security_invoker = true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER VIEW IF EXISTS public.admin_tracing_summary SET (security_invoker = true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER VIEW IF EXISTS public.pollination_contract_analytics SET (security_invoker = true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER VIEW IF EXISTS public.active_pollination_contracts SET (security_invoker = true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER VIEW IF EXISTS public.admin_document_summary SET (security_invoker = true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER VIEW IF EXISTS public.admin_activity_summary SET (security_invoker = true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  ALTER VIEW IF EXISTS public.yearly_harvest_summary SET (security_invoker = true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Fix RLS on spatial_ref_sys
DO $$ BEGIN
  ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Allow public read" ON public.spatial_ref_sys;
  CREATE POLICY "Allow public read" ON public.spatial_ref_sys FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Fix Insecure Admin Policies
-- 1. Ensure profiles has a role column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. Create secure admin check function
-- SECURITY DEFINER ensures it runs with owner privileges (bypassing RLS on profiles to avoid recursion)
-- We use a subquery for auth.uid() to ensure it's evaluated once per query, not per row.
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

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;


-- 3. Replace policies using a robust anonymous block
DO $policy_cleanup$
DECLARE
    tbl_name text;
    -- Extensive list of tables to ensure Admin full access is consistently applied
    table_list text[] := ARRAY[
        'hive_sensor_data', 'product_views', 'products', 'product_variants', 'farmers',
        'pollination_analytics', 'apiaries', 'hives', 'order_items', 'donations',
        'partners', 'faqs', 'pollination_services', 'pollination_packages',
        'order_tracking_events', 'user_wallets', 'wallet_transactions', 'addresses',
        'cart_items', 'harvests', 'reviews', 'page_views', 'processing_records',
        'honey_batches', 'contact_submissions', 'pollination_requests', 'newsletter_subscribers',
        'user_profiles', 'job_applications', 'job_listings', 'newsletter_subscriptions',
        'generated_documents', 'media_items', 'activity_logs', 'team_members',
        'invoice_registry', 'tasks', 'inspections', 'meters_buildings', 'meters_apartments',
        'crop_pollination_requirements', 'pollination_activity_logs', 'pollination_contracts',
        'hive_assignments', 'payment_transactions', 'user_addresses', 'product_reviews',
        'job_positions', 'company_stats', 'search_queries', 'iot_devices', 'learning_modules',
        'learning_lessons', 'traceability_scans', 'flower_sources', 'wishlists',
        'user_payment_methods', 'orders', 'client_hives', 'email_events', 'crops_pollinated',
        'impact_stories', 'company_milestones', 'esg_metrics', 'tracing_history', 'colonies',
        'batches', 'api_requests', 'blog_posts', 'stock_movements', 'order_events',
        'company_values', 'meters_devices', 'profiles', 'blockchain_records',
        'meters_readings', 'meters_billing_rates', 'meters_events', 'esg_initiatives',
        'packaged_batches', 'sdgs', 'esg_pillars'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY table_list LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl_name) THEN
            EXECUTE format('DROP POLICY IF EXISTS "Admin full access" ON public.%I', tbl_name);
            EXECUTE format('CREATE POLICY "Admin full access" ON public.%I FOR ALL USING ((SELECT public.is_admin()))', tbl_name);
        END IF;
    END LOOP;
END $policy_cleanup$;
