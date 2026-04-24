BEGIN;

ALTER TABLE public.profiles NO FORCE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';

COMMIT;
