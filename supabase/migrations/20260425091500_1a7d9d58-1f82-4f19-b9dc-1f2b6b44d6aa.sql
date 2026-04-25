-- Prompt variants and persisted MOA filters per run/version
ALTER TABLE public.harvest_runs
  ADD COLUMN IF NOT EXISTS prompt_variant TEXT NOT NULL DEFAULT 'baseline',
  ADD COLUMN IF NOT EXISTS moa_filters JSONB;

ALTER TABLE public.harvest_run_versions
  ADD COLUMN IF NOT EXISTS prompt_variant TEXT NOT NULL DEFAULT 'baseline',
  ADD COLUMN IF NOT EXISTS moa_filters JSONB;

-- Geo-aware bloom observations for MOA synchronization
ALTER TABLE public.bloom_observations
  ADD COLUMN IF NOT EXISTS observed_on DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS run_id UUID REFERENCES public.harvest_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version_id UUID REFERENCES public.harvest_run_versions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS zone_label TEXT,
  ADD COLUMN IF NOT EXISTS anchor_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS anchor_lng DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_bloom_observed_on ON public.bloom_observations(observed_on DESC);
CREATE INDEX IF NOT EXISTS idx_bloom_run_version ON public.bloom_observations(run_id, version_id);

-- Flight telemetry fields for MOA synchronization and planning
ALTER TABLE public.bee_flight_logs
  ADD COLUMN IF NOT EXISTS hive_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS hive_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS run_id UUID REFERENCES public.harvest_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version_id UUID REFERENCES public.harvest_run_versions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS flight_bearing_deg INTEGER,
  ADD COLUMN IF NOT EXISTS flight_path JSONB,
  ADD COLUMN IF NOT EXISTS foraging_zone TEXT,
  ADD COLUMN IF NOT EXISTS storage_level_pct INTEGER,
  ADD COLUMN IF NOT EXISTS nutrition_score INTEGER,
  ADD COLUMN IF NOT EXISTS florage_indicator TEXT;

CREATE INDEX IF NOT EXISTS idx_flight_observed_at ON public.bee_flight_logs(observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_flight_run_version ON public.bee_flight_logs(run_id, version_id);
