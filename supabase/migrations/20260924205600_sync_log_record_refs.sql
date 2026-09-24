-- Sync log record refs
ALTER TABLE public.integration_sync_logs
  ADD COLUMN IF NOT EXISTS record_id text,
  ADD COLUMN IF NOT EXISTS record_kind text,
  ADD COLUMN IF NOT EXISTS hive_label text;

CREATE INDEX IF NOT EXISTS integration_sync_logs_record_idx
  ON public.integration_sync_logs (device_id, record_id);
