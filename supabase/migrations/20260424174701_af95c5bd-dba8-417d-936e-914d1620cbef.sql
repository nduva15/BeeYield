-- Per-version saved layouts on harvest_run_versions
ALTER TABLE public.harvest_run_versions
  ADD COLUMN IF NOT EXISTS site_layout JSONB;

-- Threaded + anchored comments
ALTER TABLE public.harvest_run_comments
  ADD COLUMN IF NOT EXISTS parent_id UUID,
  ADD COLUMN IF NOT EXISTS anchor_type TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS anchor_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS anchor_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS anchor_step INTEGER;

CREATE INDEX IF NOT EXISTS idx_comments_run ON public.harvest_run_comments(run_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.harvest_run_comments(parent_id);

-- Bloom phenology observations (per device + crop + region)
CREATE TABLE IF NOT EXISTS public.bloom_observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  crop TEXT NOT NULL,
  region TEXT NOT NULL,
  bloom_start DATE,
  peak_bloom DATE,
  bloom_end DATE,
  intensity INTEGER NOT NULL DEFAULT 50,
  notes TEXT,
  ai_insights TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bloom_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to bloom observations"
  ON public.bloom_observations FOR ALL TO public USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_bloom_device ON public.bloom_observations(device_id);

-- Bee flight / activity logs
CREATE TABLE IF NOT EXISTS public.bee_flight_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  hive_label TEXT NOT NULL DEFAULT 'Hive 1',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  bees_per_minute INTEGER NOT NULL DEFAULT 0,
  pollen_loads INTEGER NOT NULL DEFAULT 0,
  weather TEXT,
  florage_source TEXT,
  flight_distance_m INTEGER,
  notes TEXT,
  ai_insights TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bee_flight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to bee flight logs"
  ON public.bee_flight_logs FOR ALL TO public USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_flight_device ON public.bee_flight_logs(device_id);