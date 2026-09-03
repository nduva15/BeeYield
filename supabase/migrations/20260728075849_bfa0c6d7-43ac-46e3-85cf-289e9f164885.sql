-- PROFILES
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
CREATE POLICY "profiles_own" ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- APIARIES
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
CREATE POLICY "apiaries_own" ON public.apiaries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER apiaries_updated_at BEFORE UPDATE ON public.apiaries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- HIVES
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
CREATE POLICY "hives_own" ON public.hives FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER hives_updated_at BEFORE UPDATE ON public.hives
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DEVICES
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
CREATE POLICY "devices_own" ON public.devices FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER devices_updated_at BEFORE UPDATE ON public.devices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- MEASUREMENTS
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
CREATE POLICY "measurements_own" ON public.device_measurements FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER measurements_updated_at BEFORE UPDATE ON public.device_measurements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_hives_apiary ON public.hives(apiary_id);
CREATE INDEX idx_devices_apiary ON public.devices(apiary_id);
CREATE INDEX idx_measurements_device_time ON public.device_measurements(device_id, recorded_at DESC);