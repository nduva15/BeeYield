-- Bee Flight & Economic Routing Enhancements
-- Created: 2026-03-04

-- 1. Ensure flower_sources exists and has all required columns
CREATE TABLE IF NOT EXISTS public.flower_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    scientific_name TEXT,
    bloom_start_month INTEGER DEFAULT 1,
    bloom_end_month INTEGER DEFAULT 12,
    nectar_potential FLOAT DEFAULT 0.5,
    pollen_potential FLOAT DEFAULT 0.5,
    optimal_temp_min FLOAT DEFAULT 15.0,
    optimal_temp_max FLOAT DEFAULT 32.0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add description if missing (resilience)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'flower_sources' AND column_name = 'description') THEN
        ALTER TABLE public.flower_sources ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'flower_sources' AND column_name = 'name') THEN
        ALTER TABLE public.flower_sources ADD COLUMN name TEXT;
    END IF;
END $$;

-- 3. Seed flower sources
INSERT INTO public.flower_sources (name, scientific_name, bloom_start_month, bloom_end_month, nectar_potential, pollen_potential, optimal_temp_min, optimal_temp_max, description)
VALUES 
('Rapeseed', 'Brassica napus', 4, 6, 0.9, 0.7, 12, 25, 'High nectar value, early spring bloom.'),
('Lavender', 'Lavandula', 6, 8, 0.8, 0.4, 18, 35, 'Excellent honey quality, heat resistant.'),
('Acacia', 'Robinia pseudoacacia', 5, 5, 1.0, 0.2, 15, 28, 'Peak nectar flow, very short duration.'),
('Coffee', 'Coffea', 2, 4, 0.7, 0.5, 18, 30, 'Important tropical source.')
ON CONFLICT (id) DO NOTHING;

-- 4. Extend infrastructure_registry for mobility/routing
ALTER TABLE public.infrastructure_registry ADD COLUMN IF NOT EXISTS radius_km FLOAT DEFAULT 2.0;
ALTER TABLE public.infrastructure_registry ADD COLUMN IF NOT EXISTS max_radius_km FLOAT DEFAULT 5.0;
ALTER TABLE public.infrastructure_registry ADD COLUMN IF NOT EXISTS latitude FLOAT;
ALTER TABLE public.infrastructure_registry ADD COLUMN IF NOT EXISTS longitude FLOAT;

-- 5. Create agro_meteo_readings if not exists (redundancy check)
CREATE TABLE IF NOT EXISTS public.agro_meteo_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE,
    temperature FLOAT,
    humidity FLOAT,
    solar_pressure FLOAT,
    rainfall_mm FLOAT,
    wind_speed_ms FLOAT,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Enable RLS and public access
ALTER TABLE public.flower_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agro_meteo_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_flower_sources" ON public.flower_sources;
CREATE POLICY "public_read_flower_sources" ON public.flower_sources FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_read_agro_meteo" ON public.agro_meteo_readings;
CREATE POLICY "public_read_agro_meteo" ON public.agro_meteo_readings FOR SELECT TO public USING (true);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
