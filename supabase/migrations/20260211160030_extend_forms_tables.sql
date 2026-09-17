-- Migration to extend contact_submissions and pollination_requests tables
-- TEMPORARILY DISABLED TO ALLOW STARTUP
-- will re-enable after verification

-- BEGIN;
-- ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS first_name TEXT;
-- ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS last_name TEXT;
-- ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS phone TEXT;
-- ...
-- COMMIT;
