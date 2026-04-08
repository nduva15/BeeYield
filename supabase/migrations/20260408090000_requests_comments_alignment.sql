BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'requests'
          AND column_name = 'type'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'requests'
          AND column_name = 'category'
    ) THEN
        ALTER TABLE public.requests RENAME COLUMN type TO category;
    END IF;
END $$;

ALTER TABLE public.requests
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

CREATE TABLE IF NOT EXISTS public.request_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.request_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'request_comments'
          AND policyname = 'Users can read their request comments'
    ) THEN
        CREATE POLICY "Users can read their request comments"
        ON public.request_comments
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1
                FROM public.requests
                WHERE requests.id = request_comments.request_id
                  AND requests.user_id = auth.uid()
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'request_comments'
          AND policyname = 'Users can insert their request comments'
    ) THEN
        CREATE POLICY "Users can insert their request comments"
        ON public.request_comments
        FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1
                FROM public.requests
                WHERE requests.id = request_comments.request_id
                  AND requests.user_id = auth.uid()
            )
        );
    END IF;
END $$;

COMMIT;
