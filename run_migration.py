
import os
import sys

# Add backend directory to path so we can import app modules
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.app.db.supabase_db import get_client, get_admin_headers

def run_sql():
    sql = """
    -- Create generated_reports table
    CREATE TABLE IF NOT EXISTS public.generated_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        report_type TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
        file_format TEXT NOT NULL,
        file_url TEXT,
        parameters JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Create scheduled_reports table
    CREATE TABLE IF NOT EXISTS public.scheduled_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        report_type TEXT NOT NULL,
        frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
        recipients TEXT[] DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        last_run_at TIMESTAMPTZ,
        next_run_at TIMESTAMPTZ,
        report_config JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

    -- Policies for generated_reports
    DO $$ BEGIN
        CREATE POLICY "Users can view their own reports"
            ON public.generated_reports FOR SELECT
            USING (auth.uid() = user_id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
        CREATE POLICY "Users can create their own reports"
            ON public.generated_reports FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
        CREATE POLICY "Users can update their own reports"
            ON public.generated_reports FOR UPDATE
            USING (auth.uid() = user_id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
        CREATE POLICY "Users can delete their own reports"
            ON public.generated_reports FOR DELETE
            USING (auth.uid() = user_id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END $$;

    -- Policies for scheduled_reports
    DO $$ BEGIN
        CREATE POLICY "Users can view their own schedules"
            ON public.scheduled_reports FOR SELECT
            USING (auth.uid() = user_id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
        CREATE POLICY "Users can create their own schedules"
            ON public.scheduled_reports FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
        CREATE POLICY "Users can update their own schedules"
            ON public.scheduled_reports FOR UPDATE
            USING (auth.uid() = user_id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
        CREATE POLICY "Users can delete their own schedules"
            ON public.scheduled_reports FOR DELETE
            USING (auth.uid() = user_id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END $$;
    """
    
    print("Executing SQL via Rest API RPC (if available) or direct connection...")
    # NOTE: The REST API cannot execute arbitrary SQL. We need to use the POSTGRES connection string.
    # But since I don't have the password easily exposed (it's in environment variables or config), I will try to use the `psql` command line tool if available with default connection for local dev.
    
    # Actually, `npx supabase db execute` is what I want.
    pass

if __name__ == "__main__":
    run_sql()
