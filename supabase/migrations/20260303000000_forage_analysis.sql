-- Create agro_meteo_readings table for forage analysis
CREATE TABLE IF NOT EXISTS public.agro_meteo_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE,
    temperature FLOAT,
    humidity FLOAT,
    pressure FLOAT,
    wind_speed FLOAT,
    rainfall FLOAT,
    solar_radiation FLOAT,
    recorded_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agro_meteo_readings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "agro_meteo_readings_select_all" ON public.agro_meteo_readings FOR SELECT USING (true);
CREATE POLICY "agro_meteo_readings_service_role" ON public.agro_meteo_readings FOR ALL TO service_role USING (true);

-- Ensure flower_sources has necessary columns if it exists
ALTER TABLE public.flower_sources ADD COLUMN IF NOT EXISTS nectar_potential FLOAT DEFAULT 0.5;
ALTER TABLE public.flower_sources ADD COLUMN IF NOT EXISTS optimal_temp_min FLOAT DEFAULT 15.0;
ALTER TABLE public.flower_sources ADD COLUMN IF NOT EXISTS optimal_temp_max FLOAT DEFAULT 30.0;
ALTER TABLE public.flower_sources ADD COLUMN IF NOT EXISTS bloom_start_month INTEGER DEFAULT 1;
ALTER TABLE public.flower_sources ADD COLUMN IF NOT EXISTS bloom_end_month INTEGER DEFAULT 12;
