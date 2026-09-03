
-- harvest_runs additions
ALTER TABLE public.harvest_runs
  ADD COLUMN IF NOT EXISTS moa_filters jsonb,
  ADD COLUMN IF NOT EXISTS prompt_variant text NOT NULL DEFAULT 'baseline';

-- harvest_run_versions additions
ALTER TABLE public.harvest_run_versions
  ADD COLUMN IF NOT EXISTS prompt_variant text NOT NULL DEFAULT 'baseline';

-- bloom_observations additions
ALTER TABLE public.bloom_observations
  ADD COLUMN IF NOT EXISTS run_id uuid,
  ADD COLUMN IF NOT EXISTS version_id uuid,
  ADD COLUMN IF NOT EXISTS observed_on date NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS zone_label text,
  ADD COLUMN IF NOT EXISTS anchor_lat double precision,
  ADD COLUMN IF NOT EXISTS anchor_lng double precision;

-- bee_flight_logs additions
ALTER TABLE public.bee_flight_logs
  ADD COLUMN IF NOT EXISTS run_id uuid;

-- florage_plants
CREATE TABLE IF NOT EXISTS public.florage_plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  name text NOT NULL,
  latin text NOT NULL,
  bloom text NOT NULL,
  nectar integer NOT NULL DEFAULT 5,
  pollen integer NOT NULL DEFAULT 5,
  radius integer NOT NULL DEFAULT 800,
  notes text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.florage_plants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to florage plants" ON public.florage_plants;
CREATE POLICY "Allow all access to florage plants" ON public.florage_plants
  FOR ALL USING (true) WITH CHECK (true);

-- alert_rules
CREATE TABLE IF NOT EXISTS public.alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  hive_label text NOT NULL DEFAULT 'Hive 1',
  metric text NOT NULL,
  comparator text NOT NULL DEFAULT 'lt',
  threshold numeric NOT NULL,
  window_hours integer NOT NULL DEFAULT 48,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to alert rules" ON public.alert_rules;
CREATE POLICY "Allow all access to alert rules" ON public.alert_rules
  FOR ALL USING (true) WITH CHECK (true);

-- alert_events
CREATE TABLE IF NOT EXISTS public.alert_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  rule_id uuid,
  hive_label text NOT NULL,
  metric text NOT NULL,
  value numeric,
  message text NOT NULL,
  acknowledged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to alert events" ON public.alert_events;
CREATE POLICY "Allow all access to alert events" ON public.alert_events
  FOR ALL USING (true) WITH CHECK (true);

-- forecast_snapshots
CREATE TABLE IF NOT EXISTS public.forecast_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  hive_label text NOT NULL DEFAULT 'Hive 1',
  forecast_for_date date NOT NULL,
  predicted_bees_per_min numeric,
  temp_c numeric,
  wind_kmh numeric,
  precip_mm numeric,
  band text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.forecast_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to forecast snapshots" ON public.forecast_snapshots;
CREATE POLICY "Allow all access to forecast snapshots" ON public.forecast_snapshots
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_florage_plants_device ON public.florage_plants(device_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_device ON public.alert_rules(device_id);
CREATE INDEX IF NOT EXISTS idx_alert_events_device ON public.alert_events(device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forecast_snapshots_device ON public.forecast_snapshots(device_id, forecast_for_date);
CREATE INDEX IF NOT EXISTS idx_bloom_obs_run ON public.bloom_observations(run_id);
CREATE INDEX IF NOT EXISTS idx_flight_logs_run ON public.bee_flight_logs(run_id);
