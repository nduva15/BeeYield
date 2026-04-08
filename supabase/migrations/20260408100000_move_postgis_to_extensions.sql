-- Keep PostGIS system tables out of the public API schema.
-- This removes extension-owned tables like spatial_ref_sys from public exposure.

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
        EXECUTE 'ALTER EXTENSION postgis SET SCHEMA extensions';
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
