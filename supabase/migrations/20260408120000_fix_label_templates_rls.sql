-- Resolve Supabase advisor warning: rls_disabled_in_public.
-- label_templates is intentionally public-read, but it still needs RLS enabled.

BEGIN;

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

COMMIT;
