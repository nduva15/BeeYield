-- Migration to fix requests table schema
-- Renames 'type' to 'category' to match backend schemas and frontend expectations

BEGIN;

DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='type') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='category') THEN
        ALTER TABLE public.requests RENAME COLUMN type TO category;
    END IF;
END $$;

-- Also ensure 'priority' has consistent casing if needed, but TEXT is fine.
-- The backend uses 'Medium' (capitalized) as default in schema, but lower 'medium' in migration.
-- We'll allow any case.

COMMIT;
