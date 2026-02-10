-- =====================================================
-- FINAL DATABASE LINTER RESOLUTION (ROUND 2)
-- =====================================================
-- This migration addresses:
-- 1. "0009_duplicate_index": Removes redundant indexes reported by the linter.
-- 2. "0006_multiple_permissive_policies": Refines RLS to ensure no role has 
--    multiple policies for the same action on the same table.

BEGIN;

-- 1. DROP DUPLICATE INDEXES
DROP INDEX IF EXISTS public.idx_apiaries_code;
DROP INDEX IF EXISTS public.idx_batches_code;
DROP INDEX IF EXISTS public.idx_harvests_user;
DROP INDEX IF EXISTS public.idx_hives_code;
DROP INDEX IF EXISTS public.tasks_due_date_idx;
DROP INDEX IF EXISTS public.tasks_user_id_idx;

-- 2. REFINE RLS TO ELIMINATE OVERLAPS
-- We need to ensure that for any (role, action), there is exactly one policy.

-- Helper to drop all policies for a table (re-defined here for safety)
CREATE OR REPLACE FUNCTION public.drop_all_policies_v2(tbl_name text)
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

DO $rls_refinement$
DECLARE
    tbl_rec RECORD;
    user_col text;
    col_type text;
    is_public_read boolean;
    is_public_insert boolean;
BEGIN
    FOR tbl_rec IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('spatial_ref_sys') 
    LOOP
        -- Step A: Clear slate
        PERFORM public.drop_all_policies_v2(tbl_rec.table_name);
        
        -- Step B: Configuration
        is_public_read := tbl_rec.table_name IN ('products', 'product_variants', 'blog_posts', 'learning_modules', 'learning_lessons', 'faqs', 'partners', 'company_stats', 'job_listings', 'tracing_history');
        is_public_insert := tbl_rec.table_name IN ('contact_submissions', 'pollination_requests', 'newsletter_subscribers', 'newsletter_subscriptions', 'job_applications', 'tracing_history', 'donations');

        -- Step C: Identify Owner Column
        user_col := NULL;
        col_type := NULL;
        SELECT column_name, data_type INTO user_col, col_type
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = tbl_rec.table_name 
        AND column_name IN ('user_id', 'customer_user_id', 'generated_by_user_id', 'traced_by_user_id')
        ORDER BY CASE column_name WHEN 'user_id' THEN 1 WHEN 'customer_user_id' THEN 2 WHEN 'generated_by_user_id' THEN 3 WHEN 'traced_by_user_id' THEN 4 END ASC
        LIMIT 1;

        -- Step D: APPLY POLICIES

        -- 1. PUBLIC SELECT (Anonymous + Authenticated)
        IF is_public_read THEN
            EXECUTE format('CREATE POLICY "Public select access" ON public.%I FOR SELECT TO anon, authenticated USING (true)', tbl_rec.table_name);
        END IF;

        -- 2. PUBLIC INSERT (Anonymous + Authenticated)
        IF is_public_insert THEN
            EXECUTE format('CREATE POLICY "Public insert access" ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', tbl_rec.table_name);
        END IF;

        -- 3. SECURED ACCESS (Authenticated Only)
        -- We split actions to avoid overlap with Public policies.
        
        -- If it's a public read table, authenticated users already have SELECT via "Public select access".
        -- If it's a public insert table, authenticated users already have INSERT via "Public insert access".
        
        -- Action: ALL (if not public read/insert) OR specific actions (if public parts exist)
        
        IF NOT is_public_read AND NOT is_public_insert THEN
            -- Standard Table: Give ALL access based on ownership/admin
            IF user_col IS NOT NULL THEN
                IF col_type = 'uuid' THEN
                    EXECUTE format('CREATE POLICY "Authenticated full access" ON public.%I FOR ALL TO authenticated USING ((SELECT public.is_admin()) OR (SELECT auth.uid()) = %I)', tbl_rec.table_name, user_col);
                ELSE
                    EXECUTE format('CREATE POLICY "Authenticated full access" ON public.%I FOR ALL TO authenticated USING ((SELECT public.is_admin()) OR (SELECT auth.uid())::text = %I::text)', tbl_rec.table_name, user_col);
                END IF;
            ELSE
                EXECUTE format('CREATE POLICY "Admin full access" ON public.%I FOR ALL TO authenticated USING ((SELECT public.is_admin()))', tbl_rec.table_name);
            END IF;
        ELSE
            -- Complex Table: Only grant actions NOT covered by public policies, OR simplify.
            
            -- Grant SELECT if not public read
            IF NOT is_public_read THEN
                 IF user_col IS NOT NULL THEN
                    EXECUTE format('CREATE POLICY "Authenticated select" ON public.%I FOR SELECT TO authenticated USING ((SELECT public.is_admin()) OR (SELECT auth.uid())%s = %I%s)', tbl_rec.table_name, CASE WHEN col_type='uuid' THEN '' ELSE '::text' END, user_col, CASE WHEN col_type='uuid' THEN '' ELSE '::text' END);
                 ELSE
                    EXECUTE format('CREATE POLICY "Admin select" ON public.%I FOR SELECT TO authenticated USING ((SELECT public.is_admin()))', tbl_rec.table_name);
                 END IF;
            END IF;

            -- Grant INSERT if not public insert
            IF NOT is_public_insert THEN
                 IF user_col IS NOT NULL THEN
                    EXECUTE format('CREATE POLICY "Authenticated insert" ON public.%I FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()) OR (SELECT auth.uid())%s = %I%s)', tbl_rec.table_name, CASE WHEN col_type='uuid' THEN '' ELSE '::text' END, user_col, CASE WHEN col_type='uuid' THEN '' ELSE '::text' END);
                 ELSE
                    EXECUTE format('CREATE POLICY "Admin insert" ON public.%I FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()))', tbl_rec.table_name);
                 END IF;
            END IF;

            -- Always grant UPDATE/DELETE for owners/admins
            IF user_col IS NOT NULL THEN
                EXECUTE format('CREATE POLICY "Authenticated update" ON public.%I FOR UPDATE TO authenticated USING ((SELECT public.is_admin()) OR (SELECT auth.uid())%s = %I%s)', tbl_rec.table_name, CASE WHEN col_type='uuid' THEN '' ELSE '::text' END, user_col, CASE WHEN col_type='uuid' THEN '' ELSE '::text' END);
                EXECUTE format('CREATE POLICY "Authenticated delete" ON public.%I FOR DELETE TO authenticated USING ((SELECT public.is_admin()) OR (SELECT auth.uid())%s = %I%s)', tbl_rec.table_name, CASE WHEN col_type='uuid' THEN '' ELSE '::text' END, user_col, CASE WHEN col_type='uuid' THEN '' ELSE '::text' END);
            ELSE
                EXECUTE format('CREATE POLICY "Admin update" ON public.%I FOR UPDATE TO authenticated USING ((SELECT public.is_admin()))', tbl_rec.table_name);
                EXECUTE format('CREATE POLICY "Admin delete" ON public.%I FOR DELETE TO authenticated USING ((SELECT public.is_admin()))', tbl_rec.table_name);
            END IF;
        END IF;

    END LOOP;
END $rls_refinement$;

-- 3. APPLY SPECIAL CASES (Non-owner column logic)
DO $special_cases$
BEGIN
    -- profiles (handled by loop if 'id' were in list, but let's be explicit)
    PERFORM public.drop_all_policies_v2('profiles');
    CREATE POLICY "Authenticated profile access" ON public.profiles FOR ALL TO authenticated USING ((SELECT public.is_admin()) OR (SELECT auth.uid()) = id);

    -- apiary_shares
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'apiary_shares') THEN
        PERFORM public.drop_all_policies_v2('apiary_shares');
        CREATE POLICY "Authenticated apiary_shares access" ON public.apiary_shares FOR ALL TO authenticated USING (
            (SELECT public.is_admin()) OR 
            (SELECT auth.uid()) = shared_with_user_id OR
            EXISTS (SELECT 1 FROM public.apiaries WHERE id = apiary_shares.apiary_id AND user_id = (SELECT auth.uid()))
        );
    END IF;

    -- Readings & Detections (Indirect check)
    -- Sensor Readings
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sensor_readings') THEN
        PERFORM public.drop_all_policies_v2('sensor_readings');
        CREATE POLICY "Authenticated sensor access" ON public.sensor_readings FOR ALL TO authenticated USING (
            (SELECT public.is_admin()) OR EXISTS (SELECT 1 FROM public.hives h WHERE h.id = sensor_readings.hive_id AND h.user_id = (SELECT auth.uid()))
        );
    END IF;

    -- Land Readings
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'land_readings') THEN
        PERFORM public.drop_all_policies_v2('land_readings');
        CREATE POLICY "Authenticated land access" ON public.land_readings FOR ALL TO authenticated USING (
            (SELECT public.is_admin()) OR EXISTS (SELECT 1 FROM public.apiaries a WHERE a.id = land_readings.apiary_id AND a.user_id = (SELECT auth.uid()))
        );
    END IF;

    -- Disease Detections
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'disease_detections') THEN
        PERFORM public.drop_all_policies_v2('disease_detections');
        CREATE POLICY "Authenticated disease access" ON public.disease_detections FOR ALL TO authenticated USING (
            (SELECT public.is_admin()) OR EXISTS (SELECT 1 FROM public.hives h WHERE h.id = disease_detections.hive_id AND h.user_id = (SELECT auth.uid()))
        );
    END IF;

    -- spatial_ref_sys (PostGIS system table in public schema)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'spatial_ref_sys') THEN
        BEGIN
            -- Attempt to take ownership to allow RLS enablement
            EXECUTE 'ALTER TABLE public.spatial_ref_sys OWNER TO ' || current_user;
            EXECUTE 'ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY';
            EXECUTE 'DROP POLICY IF EXISTS "Public read access" ON public.spatial_ref_sys';
            EXECUTE 'CREATE POLICY "Public read access" ON public.spatial_ref_sys FOR SELECT USING (true)';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Skipping spatial_ref_sys: %', SQLERRM;
        END;
    END IF;

END $special_cases$;

-- HOUSEKEEPING
DROP FUNCTION public.drop_all_policies_v2(text);

COMMIT;
