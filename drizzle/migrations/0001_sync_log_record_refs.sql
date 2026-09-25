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

ALTER TABLE public.integration_sync_logs
  ADD COLUMN IF NOT EXISTS record_id text,
  ADD COLUMN IF NOT EXISTS record_kind text,
  ADD COLUMN IF NOT EXISTS hive_label text;

CREATE INDEX IF NOT EXISTS integration_sync_logs_record_idx
  ON public.integration_sync_logs (device_id, record_id);