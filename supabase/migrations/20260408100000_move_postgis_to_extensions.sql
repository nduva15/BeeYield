-- Keep PostGIS system tables out of the public API schema when supported.
-- On hosted PostGIS builds that cannot move the extension schema, harden the
-- exposed extension table directly so it is no longer publicly accessible.

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
                RAISE NOTICE 'postgis cannot be moved to extensions on this host';
        END;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_class AS c
        JOIN pg_namespace AS n
          ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relname = 'spatial_ref_sys'
          AND c.relkind = 'r'
          AND c.relrowsecurity = false
    ) THEN
        EXECUTE 'ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY';
        EXECUTE 'ALTER TABLE public.spatial_ref_sys FORCE ROW LEVEL SECURITY';
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
