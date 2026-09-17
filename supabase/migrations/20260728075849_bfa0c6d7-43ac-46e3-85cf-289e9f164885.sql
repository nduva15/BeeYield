-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
CREATE POLICY "profiles_own" ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, country)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NEW.phone),
    NEW.raw_user_meta_data ->> 'country'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- APIARIES
CREATE TABLE IF NOT EXISTS public.apiaries (
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

ALTER TABLE public.apiaries
  ADD COLUMN IF NOT EXISTS add_mode TEXT DEFAULT 'without_devices',
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS notes TEXT;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.apiaries TO authenticated;
GRANT ALL ON public.apiaries TO service_role;
ALTER TABLE public.apiaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "apiaries_own" ON public.apiaries;
CREATE POLICY "apiaries_own" ON public.apiaries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS apiaries_updated_at ON public.apiaries;
CREATE TRIGGER apiaries_updated_at BEFORE UPDATE ON public.apiaries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- HIVES
CREATE TABLE IF NOT EXISTS public.hives (
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

ALTER TABLE public.hives
  ADD COLUMN IF NOT EXISTS max_brood_frames INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS hygienic_bottom_board BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS queen_breeding_year INTEGER,
  ADD COLUMN IF NOT EXISTS queen_origin TEXT,
  ADD COLUMN IF NOT EXISTS queen_insemination TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS notes TEXT;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hives TO authenticated;
GRANT ALL ON public.hives TO service_role;
ALTER TABLE public.hives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hives_own" ON public.hives;
CREATE POLICY "hives_own" ON public.hives FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS hives_updated_at ON public.hives;
CREATE TRIGGER hives_updated_at BEFORE UPDATE ON public.hives
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DEVICES
CREATE TABLE IF NOT EXISTS public.devices (
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

ALTER TABLE public.devices
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS serial TEXT,
  ADD COLUMN IF NOT EXISTS device_kind TEXT DEFAULT 'hub',
  ADD COLUMN IF NOT EXISTS link_type TEXT DEFAULT 'online',
  ADD COLUMN IF NOT EXISTS confirmation_code TEXT,
  ADD COLUMN IF NOT EXISTS label TEXT,
  ADD COLUMN IF NOT EXISTS firmware TEXT,
  ADD COLUMN IF NOT EXISTS battery_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS apiary_id UUID REFERENCES public.apiaries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS hive_id UUID REFERENCES public.hives(id) ON DELETE SET NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conrelid = 'public.devices'::regclass AND contype IN ('p', 'u') 
        AND conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'public.devices'::regclass AND attname = 'id')]
    ) THEN
        ALTER TABLE public.devices ADD CONSTRAINT devices_id_key UNIQUE (id);
    END IF;
EXCEPTION
    WHEN duplicate_table OR duplicate_object THEN null;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.devices TO authenticated;
GRANT ALL ON public.devices TO service_role;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "devices_own" ON public.devices;
CREATE POLICY "devices_own" ON public.devices FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS devices_updated_at ON public.devices;
CREATE TRIGGER devices_updated_at BEFORE UPDATE ON public.devices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MEASUREMENTS
CREATE TABLE IF NOT EXISTS public.device_measurements (
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

ALTER TABLE public.device_measurements
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS hive_id UUID REFERENCES public.hives(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'online',
  ADD COLUMN IF NOT EXISTS temperature_c NUMERIC,
  ADD COLUMN IF NOT EXISTS humidity_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
  ADD COLUMN IF NOT EXISTS battery_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS raw JSONB;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_measurements TO authenticated;
GRANT ALL ON public.device_measurements TO service_role;
ALTER TABLE public.device_measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "measurements_own" ON public.device_measurements;
CREATE POLICY "measurements_own" ON public.device_measurements FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS measurements_updated_at ON public.device_measurements;
CREATE TRIGGER measurements_updated_at BEFORE UPDATE ON public.device_measurements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_hives_apiary ON public.hives(apiary_id);
CREATE INDEX IF NOT EXISTS idx_devices_apiary ON public.devices(apiary_id);
CREATE INDEX IF NOT EXISTS idx_measurements_device_time ON public.device_measurements(device_id, recorded_at DESC);