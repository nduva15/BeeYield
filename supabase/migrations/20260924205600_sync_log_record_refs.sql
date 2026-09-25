-- Ensure integration tables exist before altering columns or creating indexes

-- 1. Integration sync logs
CREATE TABLE IF NOT EXISTS public.integration_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  provider text NOT NULL,
  event text NOT NULL,
  status text NOT NULL DEFAULT 'ok',
  detail text,
  record_id text,
  record_kind text,
  hive_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_sync_logs TO anon, authenticated;
GRANT ALL ON public.integration_sync_logs TO service_role;

-- Enable RLS
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'integration_sync_logs' 
      AND policyname = 'integration_sync_logs open'
  ) THEN
    CREATE POLICY "integration_sync_logs open" 
      ON public.integration_sync_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Add columns if the table already existed previously without them
ALTER TABLE public.integration_sync_logs
  ADD COLUMN IF NOT EXISTS record_id text,
  ADD COLUMN IF NOT EXISTS record_kind text,
  ADD COLUMN IF NOT EXISTS hive_label text;

CREATE INDEX IF NOT EXISTS integration_sync_logs_record_idx
  ON public.integration_sync_logs (device_id, record_id);

-- 2. Integration connections (non-secret config)
CREATE TABLE IF NOT EXISTS public.integration_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  provider text NOT NULL,
  status text NOT NULL DEFAULT 'disconnected',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  sync_enabled boolean NOT NULL DEFAULT true,
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, provider)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_connections TO anon, authenticated;
GRANT ALL ON public.integration_connections TO service_role;
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'integration_connections' 
      AND policyname = 'integration_connections open'
  ) THEN
    CREATE POLICY "integration_connections open" 
      ON public.integration_connections FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 3. Integration credentials: server-only, never readable from the browser
CREATE TABLE IF NOT EXISTS public.integration_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  provider text NOT NULL,
  secrets jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, provider)
);

GRANT ALL ON public.integration_secrets TO service_role;
ALTER TABLE public.integration_secrets ENABLE ROW LEVEL SECURITY;
