CREATE TABLE public.harvest_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  hives INTEGER NOT NULL,
  acres NUMERIC NOT NULL,
  crop TEXT NOT NULL,
  frame_type TEXT NOT NULL,
  fill_pct INTEGER NOT NULL,
  hhi INTEGER NOT NULL,
  region TEXT NOT NULL,
  local_estimate_kg NUMERIC,
  ai_forecast TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.harvest_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to harvest runs"
ON public.harvest_runs
FOR ALL
USING (true)
WITH CHECK (true);

CREATE INDEX idx_harvest_runs_device_id ON public.harvest_runs(device_id, created_at DESC);