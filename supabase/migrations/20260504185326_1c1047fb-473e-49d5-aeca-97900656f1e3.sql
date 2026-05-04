
-- Bee species (editable, per-device + defaults)
CREATE TABLE IF NOT EXISTS public.bee_species (
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
ALTER TABLE public.bee_species ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to bee species" ON public.bee_species FOR ALL USING (true) WITH CHECK (true);

-- Bee diseases (editable)
CREATE TABLE IF NOT EXISTS public.bee_diseases (
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
ALTER TABLE public.bee_diseases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to bee diseases" ON public.bee_diseases FOR ALL USING (true) WITH CHECK (true);

-- Varroa simulations
CREATE TABLE IF NOT EXISTS public.varroa_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Run',
  mode TEXT NOT NULL DEFAULT 'deterministic',
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.varroa_simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to varroa simulations" ON public.varroa_simulations FOR ALL USING (true) WITH CHECK (true);

-- Calculator runs (feeding/equipment/economics/quizzes)
CREATE TABLE IF NOT EXISTS public.calculator_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  calculator_key TEXT NOT NULL,
  label TEXT,
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.calculator_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to calculator runs" ON public.calculator_runs FOR ALL USING (true) WITH CHECK (true);

-- Alert dedupe
ALTER TABLE public.alert_events ADD COLUMN IF NOT EXISTS dedupe_key TEXT;
ALTER TABLE public.alert_events ADD COLUMN IF NOT EXISTS snapshot_date DATE;
CREATE UNIQUE INDEX IF NOT EXISTS alert_events_dedupe_key_uniq ON public.alert_events(dedupe_key) WHERE dedupe_key IS NOT NULL;

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS bee_species_updated_at ON public.bee_species;
CREATE TRIGGER bee_species_updated_at BEFORE UPDATE ON public.bee_species FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS bee_diseases_updated_at ON public.bee_diseases;
CREATE TRIGGER bee_diseases_updated_at BEFORE UPDATE ON public.bee_diseases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
