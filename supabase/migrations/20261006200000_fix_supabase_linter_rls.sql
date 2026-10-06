-- ============================================================================
-- Migration: Fix Supabase Database Linter Errors
-- Issues Addressed:
--   1. policy_exists_rls_disabled (0007): RLS policies exist but RLS is disabled
--   2. rls_disabled_in_public (0013): Tables exposed in public schema without RLS
-- Date: 2026-10-06
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 0. Ensure is_admin helper function exists and is optimized
-- ----------------------------------------------------------------------------
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

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 1. Enable RLS and Configure Policies for Explicitly Linted Tables
-- ----------------------------------------------------------------------------

-- 1.1 batches
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'batches') THEN
        ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "batches_public_read" ON public.batches;
        CREATE POLICY "batches_public_read" ON public.batches
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.batches;
        CREATE POLICY "Admin full access" ON public.batches
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.2 blog_posts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blog_posts') THEN
        ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "blog_posts_public_read" ON public.blog_posts;
        DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
        CREATE POLICY "blog_posts_public_read" ON public.blog_posts
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.blog_posts;
        CREATE POLICY "Admin full access" ON public.blog_posts
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.3 company_milestones
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'company_milestones') THEN
        ALTER TABLE public.company_milestones ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "company_milestones_public_read" ON public.company_milestones;
        CREATE POLICY "company_milestones_public_read" ON public.company_milestones
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.company_milestones;
        CREATE POLICY "Admin full access" ON public.company_milestones
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.4 company_stats
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'company_stats') THEN
        ALTER TABLE public.company_stats ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "company_stats_public_read" ON public.company_stats;
        CREATE POLICY "company_stats_public_read" ON public.company_stats
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.company_stats;
        CREATE POLICY "Admin full access" ON public.company_stats
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.5 crops_pollinated
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'crops_pollinated') THEN
        ALTER TABLE public.crops_pollinated ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "crops_pollinated_public_read" ON public.crops_pollinated;
        CREATE POLICY "crops_pollinated_public_read" ON public.crops_pollinated
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.crops_pollinated;
        CREATE POLICY "Admin full access" ON public.crops_pollinated
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.6 esg_metrics
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'esg_metrics') THEN
        ALTER TABLE public.esg_metrics ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "esg_metrics_public_read" ON public.esg_metrics;
        CREATE POLICY "esg_metrics_public_read" ON public.esg_metrics
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.esg_metrics;
        CREATE POLICY "Admin full access" ON public.esg_metrics
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.7 impact_stories
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'impact_stories') THEN
        ALTER TABLE public.impact_stories ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "impact_stories_public_read" ON public.impact_stories;
        CREATE POLICY "impact_stories_public_read" ON public.impact_stories
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.impact_stories;
        CREATE POLICY "Admin full access" ON public.impact_stories
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.8 job_applications
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_applications') THEN
        ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public insert job_applications" ON public.job_applications;
        CREATE POLICY "Public insert job_applications" ON public.job_applications
            FOR INSERT TO anon, authenticated
            WITH CHECK (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.job_applications;
        CREATE POLICY "Admin full access" ON public.job_applications
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.9 job_positions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_positions') THEN
        ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "job_positions_public_read" ON public.job_positions;
        CREATE POLICY "job_positions_public_read" ON public.job_positions
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.job_positions;
        CREATE POLICY "Admin full access" ON public.job_positions
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.10 learning_lessons
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learning_lessons') THEN
        ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "learning_lessons_public_read" ON public.learning_lessons;
        CREATE POLICY "learning_lessons_public_read" ON public.learning_lessons
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.learning_lessons;
        CREATE POLICY "Admin full access" ON public.learning_lessons
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.11 learning_modules
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learning_modules') THEN
        ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "learning_modules_public_read" ON public.learning_modules;
        CREATE POLICY "learning_modules_public_read" ON public.learning_modules
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.learning_modules;
        CREATE POLICY "Admin full access" ON public.learning_modules
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.12 media_items
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media_items') THEN
        ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "media_items_public_read" ON public.media_items;
        CREATE POLICY "media_items_public_read" ON public.media_items
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.media_items;
        CREATE POLICY "Admin full access" ON public.media_items
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.13 orders
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
        DROP POLICY IF EXISTS "public_insert_orders" ON public.orders;
        CREATE POLICY "public_insert_orders" ON public.orders
            FOR INSERT TO public
            WITH CHECK (true);

        DROP POLICY IF EXISTS "Users manage own orders" ON public.orders;
        DROP POLICY IF EXISTS "public_select_orders_by_idempotency" ON public.orders;
        CREATE POLICY "Users view own orders" ON public.orders
            FOR SELECT TO authenticated
            USING ((SELECT auth.uid()) = user_id OR (SELECT public.is_admin()));

        DROP POLICY IF EXISTS "Admin full access" ON public.orders;
        CREATE POLICY "Admin full access" ON public.orders
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.14 order_items
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
        DROP POLICY IF EXISTS "public_insert_order_items" ON public.order_items;
        CREATE POLICY "public_insert_order_items" ON public.order_items
            FOR INSERT TO public
            WITH CHECK (true);

        DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
        DROP POLICY IF EXISTS "public_select_order_items" ON public.order_items;
        CREATE POLICY "public_select_order_items" ON public.order_items
            FOR SELECT TO public
            USING (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.order_items;
        CREATE POLICY "Admin full access" ON public.order_items
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.15 pollination_services
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pollination_services') THEN
        ALTER TABLE public.pollination_services ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "pollination_services_public_read" ON public.pollination_services;
        CREATE POLICY "pollination_services_public_read" ON public.pollination_services
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.pollination_services;
        CREATE POLICY "Admin full access" ON public.pollination_services
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.16 product_reviews
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_reviews') THEN
        ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "product_reviews_public_read" ON public.product_reviews;
        CREATE POLICY "product_reviews_public_read" ON public.product_reviews
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "product_reviews_user_insert" ON public.product_reviews;
        CREATE POLICY "product_reviews_user_insert" ON public.product_reviews
            FOR INSERT TO authenticated
            WITH CHECK (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.product_reviews;
        CREATE POLICY "Admin full access" ON public.product_reviews
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.17 product_variants
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_variants') THEN
        ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public view product_variants" ON public.product_variants;
        CREATE POLICY "Public view product_variants" ON public.product_variants
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access product_variants" ON public.product_variants;
        CREATE POLICY "Admin full access product_variants" ON public.product_variants
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.18 products
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public view products" ON public.products;
        CREATE POLICY "Public view products" ON public.products
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access products" ON public.products;
        CREATE POLICY "Admin full access products" ON public.products
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.19 team_members
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_members') THEN
        ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "team_members_public_read" ON public.team_members;
        CREATE POLICY "team_members_public_read" ON public.team_members
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.team_members;
        CREATE POLICY "Admin full access" ON public.team_members
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.20 label_templates
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'label_templates') THEN
        ALTER TABLE public.label_templates ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public read label templates" ON public.label_templates;
        CREATE POLICY "Public read label templates" ON public.label_templates
            FOR SELECT TO anon, authenticated
            USING (true);

        DROP POLICY IF EXISTS "Admin full access" ON public.label_templates;
        CREATE POLICY "Admin full access" ON public.label_templates
            FOR ALL TO authenticated
            USING ((SELECT public.is_admin()))
            WITH CHECK ((SELECT public.is_admin()));
    END IF;
END $$;

-- 1.21 spatial_ref_sys (PostGIS internal table - managed by supabase_admin)
-- Safe to skip in migrations as it is owned by supabase_admin and contains no user data.


-- ----------------------------------------------------------------------------
-- 2. UNIVERSAL BACKSTOP: Enable RLS on every remaining table in public schema
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename NOT IN (
              'geography_columns',
              'geometry_columns',
              'raster_columns',
              'raster_overviews',
              'spatial_ref_sys'
          )
          AND NOT EXISTS (
              SELECT 1
              FROM pg_class c
              JOIN pg_namespace n ON n.oid = c.relnamespace
              WHERE n.nspname = pg_tables.schemaname
                AND c.relname = pg_tables.tablename
                AND c.relrowsecurity = true
          )
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', tbl.schemaname, tbl.tablename);
            RAISE NOTICE 'Enabled RLS on %.%', tbl.schemaname, tbl.tablename;
        EXCEPTION
            WHEN insufficient_privilege THEN
                RAISE NOTICE 'Insufficient privilege to enable RLS on %.%', tbl.schemaname, tbl.tablename;
            WHEN OTHERS THEN
                RAISE NOTICE 'Failed to enable RLS on %.%: %', tbl.schemaname, tbl.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 3. Reload PostgREST Schema Cache
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

COMMIT;
