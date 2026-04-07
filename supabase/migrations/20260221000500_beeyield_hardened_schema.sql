-- ==========================================
-- BEE YIELD PRD: FINAL SECURITY & SCHEMA SOLIDIFICATION
-- ADDRESSING ALL MISSING / NEEDS ADJUSTMENT ENTITIES
-- ==========================================

-- 1. ENSURE BASE TABLES EXIST (Idempotent)
-- These were identified as missing in the previous audit but are required by the PRD.

CREATE TABLE IF NOT EXISTS public.orchards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    grower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    boundary_geojson JSONB,
    acreage DECIMAL(10,2),
    crop_type TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.telemetry_gateways (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mac_address TEXT UNIQUE NOT NULL,
    beekeeper_id UUID REFERENCES auth.users(id) ON DELETE NOT NULL,
    apiary_id UUID REFERENCES public.apiaries(id),
    battery_pct INTEGER DEFAULT 100,
    rssi_dbm INTEGER,
    status TEXT DEFAULT 'Online', -- Online, Offline
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.calculator_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    module_type TEXT NOT NULL,
    input_json JSONB,
    output_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.yield_predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    orchard_id UUID REFERENCES public.orchards(id) ON DELETE CASCADE,
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE,
    forecast_date DATE DEFAULT CURRENT_DATE,
    predicted_yield_kg DECIMAL(12,2),
    confidence_score DECIMAL(4,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pollination_contracts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    grower_id UUID REFERENCES auth.users(id) NOT NULL,
    beekeeper_id UUID REFERENCES auth.users(id) NOT NULL,
    orchard_id UUID REFERENCES public.orchards(id),
    status TEXT DEFAULT 'active', -- active, completed, cancelled
    start_date DATE,
    end_date DATE,
    terms_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROFESSIONAL RLS (PRD SECTION 6 COMPLIANCE)

-- DROPPING LEGACY POLICIES
DO $$ 
BEGIN
    -- Orchards
    DROP POLICY IF EXISTS "Growers manage own orchards" ON orchards;
    DROP POLICY IF EXISTS "Beekeepers see contracted orchards" ON orchards;
    -- Apiaries
    DROP POLICY IF EXISTS "Beekeepers manage own apiaries" ON apiaries;
    -- Hives
    DROP POLICY IF EXISTS "Beekeepers manage own hives" ON hives;
    DROP POLICY IF EXISTS "Growers see contracted hives" ON hives;
    -- Sensor Data
    DROP POLICY IF EXISTS "Read own sensor data" ON sensor_readings;
    DROP POLICY IF EXISTS "Growers see contracted sensor data" ON sensor_readings;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- --- ORCHARDS ---
ALTER TABLE public.orchards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Growers manage own orchards" 
ON public.orchards FOR ALL 
USING ((SELECT auth.uid()) = grower_id);

CREATE POLICY "Beekeepers see contracted orchards" 
ON public.orchards FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM pollination_contracts 
        WHERE pollination_contracts.orchard_id = orchards.id 
        AND pollination_contracts.beekeeper_id = (SELECT auth.uid())
    )
);

-- --- APIARIES ---
ALTER TABLE public.apiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Beekeepers manage own apiaries" 
ON public.apiaries FOR ALL 
USING ((SELECT auth.uid()) = user_id);

-- Grower has NO access to apiaries directly as per Section 6 (only via Hives views)

-- --- HIVES ---
ALTER TABLE public.hives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Beekeepers manage own hives" 
ON public.hives FOR ALL 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Growers see contracted hives" 
ON public.hives FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM pollination_contracts 
        WHERE pollination_contracts.beekeeper_id = hives.user_id 
        AND pollination_contracts.grower_id = (SELECT auth.uid())
        AND pollination_contracts.status = 'active'
    )
);

-- --- SENSOR READINGS ---
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Beekeepers manage own sensor readings" 
ON public.sensor_readings FOR ALL 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Growers see contracted sensor data" 
ON public.sensor_readings FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM hives h
        JOIN pollination_contracts c ON h.user_id = c.beekeeper_id
        WHERE h.id = sensor_readings.hive_id
        AND c.grower_id = (SELECT auth.uid())
        AND c.status = 'active'
    )
);

-- --- CALCULATORS ---
ALTER TABLE public.calculator_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own calculator logs" 
ON public.calculator_logs FOR ALL 
USING ((SELECT auth.uid()) = user_id);

-- 3. HELPER FOR ROLE-BASED DASHBOARDS
-- This role is used in frontend filters but enforced by the row-level policies above.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Beekeeper';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;

-- 4. RE-ESTABLISH UPDATED_AT TRIGGERS
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('orchards', 'telemetry_gateways', 'pollination_contracts')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()', t, t);
    END LOOP;
END;
$$;
