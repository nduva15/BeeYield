-- Migration: Fix Supabase Linter Warning 0013 (rls_disabled_in_public) for spatial_ref_sys
-- Description: Enables RLS on public.spatial_ref_sys and creates a public read policy.
-- Also attempts to move PostGIS extension to 'extensions' schema if permitted by host.

BEGIN;

-- 1. Enable RLS on public.spatial_ref_sys if it exists in public schema
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'spatial_ref_sys'
    ) THEN
        ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

        -- Drop existing policy if present to make migration idempotent
        DROP POLICY IF EXISTS "Allow public read access for spatial_ref_sys" ON public.spatial_ref_sys;

        -- Create public read access policy so spatial coordinate references remain functional
        CREATE POLICY "Allow public read access for spatial_ref_sys"
        ON public.spatial_ref_sys
        FOR SELECT
        TO public
        USING (true);
    END IF;
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Skipping direct spatial_ref_sys RLS modification: insufficient privileges';
    WHEN OTHERS THEN
        RAISE NOTICE 'Skipping spatial_ref_sys RLS setup: %', SQLERRM;
END $$;

-- 2. Move PostGIS to extensions schema if supported
CREATE SCHEMA IF NOT EXISTS extensions;

DO $$
DECLARE
    current_schema text;
BEGIN
    SELECT n.nspname
    INTO current_schema
    FROM pg_extension AS e
    JOIN pg_namespace AS n ON n.oid = e.extnamespace
    WHERE e.extname = 'postgis';

    IF current_schema IS NOT NULL AND current_schema <> 'extensions' THEN
        BEGIN
            EXECUTE 'ALTER EXTENSION postgis SET SCHEMA extensions';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'PostGIS schema migration skipped: %', SQLERRM;
        END;
    END IF;
END $$;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
