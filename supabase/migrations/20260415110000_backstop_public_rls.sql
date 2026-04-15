-- Backstop RLS hardening for public tables.
-- Use this when the Supabase advisor reports `rls_disabled_in_public`
-- even though earlier migrations already attempted to secure the schema.

BEGIN;

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
        EXECUTE format(
            'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
            tbl.schemaname,
            tbl.tablename
        );
    END LOOP;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'label_templates'
    ) THEN
        ALTER TABLE public.label_templates ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public read label templates" ON public.label_templates;
        CREATE POLICY "Public read label templates"
        ON public.label_templates
        FOR SELECT
        TO anon, authenticated
        USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'saved_labels'
    ) THEN
        ALTER TABLE public.saved_labels ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users manage own labels" ON public.saved_labels;
        CREATE POLICY "Users manage own labels"
        ON public.saved_labels
        FOR ALL
        TO authenticated
        USING ((SELECT auth.uid()) = user_id)
        WITH CHECK ((SELECT auth.uid()) = user_id);
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';

COMMIT;
