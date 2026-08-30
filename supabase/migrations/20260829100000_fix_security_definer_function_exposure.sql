-- ==============================================================================
-- Fix: Supabase Linter Warnings 0028 & 0029 (SECURITY DEFINER Exposure)
-- Description: Revokes execute permissions from anon/authenticated on internal
--              functions, converts data RPCs to SECURITY INVOKER, and locks
--              down admin/trigger utilities.
-- ==============================================================================

BEGIN;

-- 1. DROP or RESTRICT DANGEROUS FUNCTIONS
DO $$ 
BEGIN
    -- If exec_query exists, revoke ALL execute permissions from public/anon/authenticated
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'exec_query') THEN
        EXECUTE 'REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon';
        EXECUTE 'REVOKE ALL ON FUNCTION public.exec_query(text) FROM PUBLIC, anon, authenticated';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.exec_query(text) TO service_role';
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- 2. SECURE TRIGGER & INTERNAL HELPER FUNCTIONS
-- Trigger and admin check functions should never be callable via anon or public REST RPC.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT oid::regprocedure::text AS sig
        FROM pg_proc
        WHERE pronamespace = 'public'::regnamespace
          AND proname IN (
              '_sync_auth_user_profile',
              'handle_new_user',
              'handle_user_profile_sync',
              'rls_auto_enable',
              'reference_library_is_admin',
              'is_admin',
              'exec_query'
          )
    ) LOOP
        BEGIN
            EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', r.sig);
            -- For triggers and dangerous functions, also revoke authenticated RPC access
            IF r.sig ~* '(_sync|handle_|rls_|exec_query)' THEN
                EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated', r.sig);
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Skipping %: %', r.sig, SQLERRM;
        END;
    END LOOP;
END $$;


-- 3. CONVERT DATA RPCS TO SECURITY INVOKER
-- These functions should respect Row Level Security (RLS) policies of the logged-in user.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT oid::regprocedure::text AS sig
        FROM pg_proc
        WHERE pronamespace = 'public'::regnamespace
          AND proname IN (
              'get_api_usage_stats',
              'get_hive_health_trends',
              'get_user_analysis_stats'
          )
    ) LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION %s SECURITY INVOKER', r.sig);
            EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', r.sig);
            EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', r.sig);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Skipping %: %', r.sig, SQLERRM;
        END;
    END LOOP;
END $$;


-- 4. GENERAL SECURITY HARDENING FOR ALL PUBLIC SCHEMA FUNCTIONS
-- By default in PostgreSQL, functions grant EXECUTE to PUBLIC. Revoke default public execution.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon;

-- 5. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

COMMIT;
