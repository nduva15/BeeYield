-- Keep PostGIS system tables out of the public API schema when supported.
-- Hosted Supabase projects may prevent moving PostGIS after install, and the
-- extension-owned spatial_ref_sys table cannot be altered directly by app roles.
-- In that case, this migration exits cleanly and the project must be fixed via
-- the Extensions UI or by changing exposed API schemas.

CREATE SCHEMA IF NOT EXISTS extensions;

DO $$
DECLARE
    current_schema text;
BEGIN
    SELECT n.nspname
    INTO current_schema
    FROM pg_extension AS e
    JOIN pg_namespace AS n
      ON n.oid = e.extnamespace
    WHERE e.extname = 'postgis';

    IF current_schema IS NULL THEN
        RAISE NOTICE 'postgis extension is not installed';
        RETURN;
    END IF;

    IF current_schema <> 'extensions' THEN
        BEGIN
            EXECUTE 'ALTER EXTENSION postgis SET SCHEMA extensions';
        EXCEPTION
            WHEN feature_not_supported THEN
                RAISE NOTICE 'postgis cannot be moved to extensions on this host; fix via Extensions UI or API schema settings';
            WHEN insufficient_privilege THEN
                RAISE NOTICE 'current role cannot move postgis; fix via Extensions UI or owner-level migration';
        END;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
