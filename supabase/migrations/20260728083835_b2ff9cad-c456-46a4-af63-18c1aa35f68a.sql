-- =========================
-- SHARED / DEVICE-SCOPED
-- =========================

CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'New Chat',
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO anon, authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to conversations" ON public.conversations FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_conversations_device_id ON public.conversations(device_id);

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO anon, authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to chat messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);

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
  notes TEXT,
  assumptions JSONB,
  site_layout JSONB,
  moa_filters JSONB,
  prompt_variant TEXT NOT NULL DEFAULT 'baseline',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.harvest_runs TO anon, authenticated;
GRANT ALL ON public.harvest_runs TO service_role;
ALTER TABLE public.harvest_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to harvest runs" ON public.harvest_runs FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_harvest_runs_device_id ON public.harvest_runs(device_id, created_at DESC);

CREATE TABLE public.harvest_run_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.harvest_runs(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL DEFAULT 'v1',
  ai_forecast TEXT,
  local_estimate_kg NUMERIC,
  assumptions JSONB,
  site_layout JSONB,
  moa_filters JSONB,
  prompt_variant TEXT NOT NULL DEFAULT 'baseline',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.harvest_run_versions TO anon, authenticated;
GRANT ALL ON public.harvest_run_versions TO service_role;
ALTER TABLE public.harvest_run_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to harvest run versions" ON public.harvest_run_versions FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_harvest_run_versions_run_id ON public.harvest_run_versions(run_id, created_at DESC);

CREATE TABLE public.harvest_run_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.harvest_runs(id) ON DELETE CASCADE,
  parent_id UUID,
  author_name TEXT NOT NULL DEFAULT 'Partner',
  body TEXT NOT NULL,
  anchor_type TEXT NOT NULL DEFAULT 'general',
  anchor_lat DOUBLE PRECISION,
  anchor_lng DOUBLE PRECISION,
  anchor_step INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.harvest_run_comments TO anon, authenticated;
GRANT ALL ON public.harvest_run_comments TO service_role;
ALTER TABLE public.harvest_run_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to harvest run comments" ON public.harvest_run_comments FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_comments_run ON public.harvest_run_comments(run_id, created_at DESC);
CREATE INDEX idx_comments_parent ON public.harvest_run_comments(parent_id);

CREATE TABLE public.bloom_observations (
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
  observed_on DATE NOT NULL DEFAULT CURRENT_DATE,
  run_id UUID REFERENCES public.harvest_runs(id) ON DELETE SET NULL,
  version_id UUID REFERENCES public.harvest_run_versions(id) ON DELETE SET NULL,
  zone_label TEXT,
  anchor_lat DOUBLE PRECISION,
  anchor_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bloom_observations TO anon, authenticated;
GRANT ALL ON public.bloom_observations TO service_role;
ALTER TABLE public.bloom_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to bloom observations" ON public.bloom_observations FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_bloom_device ON public.bloom_observations(device_id);
CREATE INDEX idx_bloom_observed_on ON public.bloom_observations(observed_on DESC);
CREATE INDEX idx_bloom_run_version ON public.bloom_observations(run_id, version_id);

CREATE TABLE public.bee_flight_logs (
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
  hive_lat DOUBLE PRECISION,
  hive_lng DOUBLE PRECISION,
  run_id UUID REFERENCES public.harvest_runs(id) ON DELETE SET NULL,
  version_id UUID REFERENCES public.harvest_run_versions(id) ON DELETE SET NULL,
  flight_bearing_deg INTEGER,
  flight_path JSONB,
  foraging_zone TEXT,
  storage_level_pct INTEGER,
  nutrition_score INTEGER,
  florage_indicator TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bee_flight_logs TO anon, authenticated;
GRANT ALL ON public.bee_flight_logs TO service_role;
ALTER TABLE public.bee_flight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to bee flight logs" ON public.bee_flight_logs FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_flight_device ON public.bee_flight_logs(device_id);
CREATE INDEX idx_flight_observed_at ON public.bee_flight_logs(observed_at DESC);
CREATE INDEX idx_flight_run_version ON public.bee_flight_logs(run_id, version_id);

CREATE TABLE public.florage_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  name TEXT NOT NULL,
  latin TEXT NOT NULL,
  bloom TEXT NOT NULL,
  nectar INTEGER NOT NULL DEFAULT 5,
  pollen INTEGER NOT NULL DEFAULT 5,
  radius INTEGER NOT NULL DEFAULT 800,
  notes TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.florage_plants TO anon, authenticated;
GRANT ALL ON public.florage_plants TO service_role;
ALTER TABLE public.florage_plants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to florage plants" ON public.florage_plants FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_florage_plants_device ON public.florage_plants(device_id);

CREATE TABLE public.alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  hive_label TEXT NOT NULL DEFAULT 'Hive 1',
  metric TEXT NOT NULL,
  comparator TEXT NOT NULL DEFAULT 'lt',
  threshold NUMERIC NOT NULL,
  window_hours INTEGER NOT NULL DEFAULT 48,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alert_rules TO anon, authenticated;
GRANT ALL ON public.alert_rules TO service_role;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to alert rules" ON public.alert_rules FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_alert_rules_device ON public.alert_rules(device_id);

CREATE TABLE public.alert_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  rule_id UUID,
  hive_label TEXT NOT NULL,
  metric TEXT NOT NULL,
  value NUMERIC,
  message TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  dedupe_key TEXT,
  snapshot_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alert_events TO anon, authenticated;
GRANT ALL ON public.alert_events TO service_role;
ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to alert events" ON public.alert_events FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_alert_events_device ON public.alert_events(device_id, created_at DESC);
CREATE UNIQUE INDEX alert_events_dedupe_key_uniq ON public.alert_events(dedupe_key) WHERE dedupe_key IS NOT NULL;

CREATE TABLE public.forecast_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  hive_label TEXT NOT NULL DEFAULT 'Hive 1',
  forecast_for_date DATE NOT NULL,
  predicted_bees_per_min NUMERIC,
  temp_c NUMERIC,
  wind_kmh NUMERIC,
  precip_mm NUMERIC,
  band TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forecast_snapshots TO anon, authenticated;
GRANT ALL ON public.forecast_snapshots TO service_role;
ALTER TABLE public.forecast_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to forecast snapshots" ON public.forecast_snapshots FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_forecast_snapshots_device ON public.forecast_snapshots(device_id, forecast_for_date);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TABLE public.bee_species (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL DEFAULT 'global',
  name TEXT NOT NULL,
  scientific TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  description TEXT,
  habitat TEXT,
  traits TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  notes TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bee_species TO anon, authenticated;
GRANT ALL ON public.bee_species TO service_role;
ALTER TABLE public.bee_species ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to bee species" ON public.bee_species FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER bee_species_updated_at BEFORE UPDATE ON public.bee_species FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.bee_diseases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL DEFAULT 'global',
  name TEXT NOT NULL,
  pathogen TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Other',
  severity TEXT NOT NULL DEFAULT 'Moderate',
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  treatments TEXT[] NOT NULL DEFAULT '{}',
  prevention TEXT,
  affected_castes TEXT,
  notes TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bee_diseases TO anon, authenticated;
GRANT ALL ON public.bee_diseases TO service_role;
ALTER TABLE public.bee_diseases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to bee diseases" ON public.bee_diseases FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER bee_diseases_updated_at BEFORE UPDATE ON public.bee_diseases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.varroa_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Run',
  mode TEXT NOT NULL DEFAULT 'deterministic',
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.varroa_simulations TO anon, authenticated;
GRANT ALL ON public.varroa_simulations TO service_role;
ALTER TABLE public.varroa_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to varroa simulations" ON public.varroa_simulations FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.calculator_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  calculator_key TEXT NOT NULL,
  label TEXT,
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calculator_runs TO anon, authenticated;
GRANT ALL ON public.calculator_runs TO service_role;
ALTER TABLE public.calculator_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to calculator runs" ON public.calculator_runs FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.dataset_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  dataset_kind TEXT NOT NULL DEFAULT 'bees',
  row_count INTEGER NOT NULL DEFAULT 0,
  schema_valid BOOLEAN NOT NULL DEFAULT false,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  sample_rows JSONB DEFAULT '[]'::jsonb,
  reindex_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dataset_imports TO anon, authenticated;
GRANT ALL ON public.dataset_imports TO service_role;
ALTER TABLE public.dataset_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to dataset_imports" ON public.dataset_imports FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.feeding_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  hive_label TEXT NOT NULL DEFAULT 'Hive 1',
  plan_label TEXT NOT NULL DEFAULT 'Season plan',
  plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feeding_schedules TO anon, authenticated;
GRANT ALL ON public.feeding_schedules TO service_role;
ALTER TABLE public.feeding_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to feeding_schedules" ON public.feeding_schedules FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.knowledge_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL DEFAULT 'global',
  topic TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  fact TEXT NOT NULL,
  citation TEXT,
  source_url TEXT,
  confidence NUMERIC NOT NULL DEFAULT 0.8,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_facts TO anon, authenticated;
GRANT ALL ON public.knowledge_facts TO service_role;
ALTER TABLE public.knowledge_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to knowledge_facts" ON public.knowledge_facts FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.yield_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Projection',
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.yield_projections TO anon, authenticated;
GRANT ALL ON public.yield_projections TO service_role;
ALTER TABLE public.yield_projections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to yield_projections" ON public.yield_projections FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.apiary_sizing_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Sizing run',
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.apiary_sizing_runs TO anon, authenticated;
GRANT ALL ON public.apiary_sizing_runs TO service_role;
ALTER TABLE public.apiary_sizing_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to apiary_sizing_runs" ON public.apiary_sizing_runs FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.knowledge_facts (topic, category, fact, citation, source_url, confidence, tags, is_default) VALUES
('Varroa destructor','disease','Varroa mites parasitize honey bee brood and adults, vectoring deformed wing virus (DWV); economic threshold ~3 mites per 100 bees in summer.','Rosenkranz et al. 2010, J. Invertebr. Pathol.','https://doi.org/10.1016/j.jip.2009.07.016',0.95,ARRAY['varroa','dwv','threshold'],true),
('American foulbrood','disease','AFB is caused by Paenibacillus larvae spores; spores remain viable >40 years; burning is the standard control in many jurisdictions.','Genersch 2010, J. Invertebr. Pathol.','https://doi.org/10.1016/j.jip.2009.06.015',0.93,ARRAY['afb','spore','burn'],true),
('Nosema ceranae','disease','Nosema ceranae is a microsporidian gut pathogen; fumagillin reduces spore loads but resistance is increasing.','Higes et al. 2013','',0.88,ARRAY['nosema','gut'],true),
('Apis mellifera scutellata','species','African honey bee subspecies common in Kibwezi/Makueni; defensive, swarm- and abscond-prone, productive in semi-arid acacia bloom.','Hepburn & Radloff 1998','',0.9,ARRAY['scutellata','africa','kibwezi'],true),
('Acacia mellifera','florage','Major dryland nectar source in eastern Kenya; bloom Mar-May and Oct-Dec; nectar score 9/10, pollen 7/10.','Kasina 2007','',0.85,ARRAY['acacia','kenya','nectar'],true),
('Manuka honey MGO','honey','Methylglyoxal (MGO) gives manuka its non-peroxide antibacterial activity; UMF 10+ = MGO 263 mg/kg.','Mavric et al. 2008','',0.92,ARRAY['manuka','mgo','umf'],true),
('Honey moisture','honey','Extraction safe at or below 18.6% moisture; above this, fermentation risk by osmotolerant yeasts increases sharply.','White 1975','',0.95,ARRAY['moisture','extraction'],true),
('Colony Collapse Disorder','disease','CCD is multifactorial: pesticides (neonicotinoids), pathogens (Nosema, viruses), nutrition, and stress combine.','vanEngelsdorp 2009','',0.85,ARRAY['ccd','multifactorial'],true),
('Foraging radius','behavior','Honey bees typically forage within 2-3 km but can fly up to 10-13 km if necessary.','Beekman & Ratnieks 2000','',0.9,ARRAY['forage','radius'],true),
('Waggle dance','behavior','Direction encoded by angle relative to vertical; distance encoded by waggle-run duration (~1 s = 1 km).','von Frisch 1967','',0.97,ARRAY['waggle','communication'],true),
('Winter cluster','management','Cluster forms below ~14C; core stays ~32-35C when brood present; consumes ~0.7-1.2 kg honey/week in cold.','Seeley 2010','',0.9,ARRAY['winter','cluster'],true),
('Almond pollination','crop','Almond pollination requires ~5 colonies/ha (2/acre) at 10-25% bloom for optimum nut set.','Klein et al. 2007','',0.93,ARRAY['almond','crop'],true),
('Tropilaelaps','disease','Tropilaelaps mercedesae is emerging in Asia; faster reproduction than Varroa; OIE-listed.','Anderson & Roberts 2013','',0.88,ARRAY['tropilaelaps','mite'],true),
('Sacbrood virus','disease','SBV affects larvae forming a fluid-filled sac; usually self-limiting if colony is strong.','Bailey 1969','',0.85,ARRAY['sbv','virus'],true);

-- =========================
-- ACCOUNT-SCOPED
-- =========================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NEW.phone),
    NEW.raw_user_meta_data ->> 'country'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
        country = COALESCE(public.profiles.country, EXCLUDED.country);
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.apiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  add_mode TEXT NOT NULL DEFAULT 'without_devices',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.apiaries TO authenticated;
GRANT ALL ON public.apiaries TO service_role;
ALTER TABLE public.apiaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apiaries_own" ON public.apiaries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER apiaries_updated_at BEFORE UPDATE ON public.apiaries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.hives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  apiary_id UUID NOT NULL REFERENCES public.apiaries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  max_brood_frames INTEGER NOT NULL DEFAULT 10,
  hygienic_bottom_board BOOLEAN NOT NULL DEFAULT false,
  queen_breeding_year INTEGER,
  queen_origin TEXT,
  queen_insemination TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hives TO authenticated;
GRANT ALL ON public.hives TO service_role;
ALTER TABLE public.hives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hives_own" ON public.hives FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER hives_updated_at BEFORE UPDATE ON public.hives FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  apiary_id UUID REFERENCES public.apiaries(id) ON DELETE SET NULL,
  hive_id UUID REFERENCES public.hives(id) ON DELETE SET NULL,
  device_kind TEXT NOT NULL DEFAULT 'hub',
  link_type TEXT NOT NULL DEFAULT 'online',
  serial TEXT NOT NULL,
  confirmation_code TEXT,
  label TEXT,
  firmware TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  battery_pct NUMERIC,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, serial)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.devices TO authenticated;
GRANT ALL ON public.devices TO service_role;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "devices_own" ON public.devices FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER devices_updated_at BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.device_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  hive_id UUID REFERENCES public.hives(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'online',
  temperature_c NUMERIC,
  humidity_pct NUMERIC,
  weight_kg NUMERIC,
  battery_pct NUMERIC,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_measurements TO authenticated;
GRANT ALL ON public.device_measurements TO service_role;
ALTER TABLE public.device_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "measurements_own" ON public.device_measurements FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER measurements_updated_at BEFORE UPDATE ON public.device_measurements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_hives_apiary ON public.hives(apiary_id);
CREATE INDEX idx_devices_apiary ON public.devices(apiary_id);
CREATE INDEX idx_measurements_device_time ON public.device_measurements(device_id, recorded_at DESC);