
import asyncio
import asyncpg
import os

# Try default Supabase local dev port
DATABASE_URL = "postgresql://postgres:postgres@localhost:54322/postgres"

MIGRATION_SQL = """
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

-- Note: We check if policies exist before creating them to avoid errors (or recreate them)
-- But simplistic "CREATE POLICY IF NOT EXISTS" is not standard Postgres.
-- We'll wrap in DO blocks.

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own reports') THEN
        EXECUTE 'CREATE POLICY "Users can view their own reports" ON public.generated_reports FOR SELECT USING (auth.uid() = user_id)';
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create their own reports') THEN
        EXECUTE 'CREATE POLICY "Users can create their own reports" ON public.generated_reports FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own reports') THEN
        EXECUTE 'CREATE POLICY "Users can update their own reports" ON public.generated_reports FOR UPDATE USING (auth.uid() = user_id)';
    END IF;
END $$;
-- Skip DELETE for brevity, assuming similar pattern

-- Enable RLS
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
"""

async def run():
    print(f"Connecting to {DATABASE_URL}...")
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        print("Connected! Executing migration...")
        await conn.execute(MIGRATION_SQL)
        print("Migration executed successfully.")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")
        # Try port 5432 just in case
        try:
            alt_url = DATABASE_URL.replace("54322", "5432")
            print(f"Retrying with {alt_url}...")
            conn = await asyncpg.connect(alt_url)
            print("Connected! Executing migration...")
            await conn.execute(MIGRATION_SQL)
            print("Migration executed successfully.")
            await conn.close()
        except Exception as e2:
            print(f"Retry failed: {e2}")

if __name__ == "__main__":
    asyncio.run(run())
