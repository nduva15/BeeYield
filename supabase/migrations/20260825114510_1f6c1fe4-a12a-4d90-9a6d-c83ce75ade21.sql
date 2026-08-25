-- Inspections
CREATE TABLE public.inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  location text NOT NULL DEFAULT '',
  hive_label text NOT NULL DEFAULT '',
  batch text NOT NULL DEFAULT '',
  inspected_on date NOT NULL DEFAULT CURRENT_DATE,
  colony_health text NOT NULL DEFAULT 'healthy',
  queen_seen boolean NOT NULL DEFAULT false,
  queen_cells integer NOT NULL DEFAULT 0,
  brood_frames integer NOT NULL DEFAULT 0,
  honey_frames integer NOT NULL DEFAULT 0,
  varroa_count integer NOT NULL DEFAULT 0,
  temperament text NOT NULL DEFAULT 'calm',
  weather text,
  issues text[] NOT NULL DEFAULT '{}',
  actions text[] NOT NULL DEFAULT '{}',
  notes text,
  ai_insights text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspections TO anon, authenticated;
GRANT ALL ON public.inspections TO service_role;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inspections open" ON public.inspections FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER inspections_updated_at BEFORE UPDATE ON public.inspections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Sound analyses
CREATE TABLE public.sound_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  hive_label text NOT NULL DEFAULT '',
  recorded_at timestamptz NOT NULL DEFAULT now(),
  duration_sec numeric NOT NULL DEFAULT 0,
  sample_rate integer NOT NULL DEFAULT 22050,
  segments integer NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  health_state text NOT NULL DEFAULT 'Healthy',
  health_confidence numeric NOT NULL DEFAULT 0,
  piping_detected boolean NOT NULL DEFAULT false,
  piping_confidence numeric NOT NULL DEFAULT 0,
  disease_predictions jsonb NOT NULL DEFAULT '[]'::jsonb,
  inference_mode text NOT NULL DEFAULT 'dsp',
  ai_insights text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sound_analyses TO anon, authenticated;
GRANT ALL ON public.sound_analyses TO service_role;
ALTER TABLE public.sound_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sound_analyses open" ON public.sound_analyses FOR ALL USING (true) WITH CHECK (true);

-- Integration connections (non-secret config only)
CREATE TABLE public.integration_connections (
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
CREATE POLICY "integration_connections open" ON public.integration_connections FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER integration_connections_updated_at BEFORE UPDATE ON public.integration_connections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Integration credentials: server-only, never readable from the browser
CREATE TABLE public.integration_secrets (
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
CREATE TRIGGER integration_secrets_updated_at BEFORE UPDATE ON public.integration_secrets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Sync activity log
CREATE TABLE public.integration_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  provider text NOT NULL,
  event text NOT NULL,
  status text NOT NULL DEFAULT 'ok',
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.integration_sync_logs TO anon, authenticated;
GRANT ALL ON public.integration_sync_logs TO service_role;
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integration_sync_logs open" ON public.integration_sync_logs FOR ALL USING (true) WITH CHECK (true);

-- Per-device app settings (modules + alert preferences)
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL UNIQUE,
  modules jsonb NOT NULL DEFAULT '{}'::jsonb,
  alert_prefs jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_settings open" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();