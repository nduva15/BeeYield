-- Resolve linter 0013 (rls_disabled_in_public) for public.spatial_ref_sys.
-- The table belongs to the PostGIS extension, so the migration role may not own it.
-- Strategy: enable RLS + read-only policy if permitted; otherwise fall back to
-- revoking API-role write access, and finally leave a NOTICE with the manual step.

DO $$
BEGIN
  IF to_regclass('public.spatial_ref_sys') IS NULL THEN
    RETURN;
  END IF;

  BEGIN
    ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read" ON public.spatial_ref_sys;
    CREATE POLICY "Allow public read" ON public.spatial_ref_sys
      FOR SELECT TO anon, authenticated USING (true);
    RAISE NOTICE 'RLS enabled on public.spatial_ref_sys';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Not owner of public.spatial_ref_sys; RLS not enabled. Falling back to privilege revoke.';
    BEGIN
      REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.spatial_ref_sys FROM anon, authenticated;
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE NOTICE 'Cannot revoke either. Run as postgres: ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;';
    END;
  END;
END
$$;
