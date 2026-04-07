-- ==========================================
-- BEE YIELD BACKEND: PHASE 1 FOUNDATION
-- PRD COMPLIANCE MIGRATION
-- ==========================================

-- 1. ENHANCE PROFILES FOR ROLE-BASED ACCESS
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Beekeeper',
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'Free';

-- 2. CREATE MISSING ORCHARDS TABLE (Spatial Growers)
CREATE TABLE IF NOT EXISTS public.orchards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    grower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    location_name TEXT,
    boundary_geojson JSONB, -- PostGIS can also be used if needed
    acreage DECIMAL(10,2),
    crop_type TEXT,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE TELEMETRY GATEWAYS TABLE
CREATE TABLE IF NOT EXISTS public.telemetry_gateways (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mac_address TEXT UNIQUE NOT NULL,
    beekeeper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE SET NULL,
    orchard_id UUID REFERENCES public.orchards(id) ON DELETE SET NULL,
    battery_pct INTEGER DEFAULT 100,
    rssi_dbm INTEGER,
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'Online',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE CALCULATOR LOGS TABLE
CREATE TABLE IF NOT EXISTS public.calculator_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    module_type TEXT NOT NULL, -- e.g., 'HpaOptimizer', 'RoiCalculator'
    input_json JSONB NOT NULL,
    output_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE YIELD PREDICTIONS TABLE
CREATE TABLE IF NOT EXISTS public.yield_predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE,
    orchard_id UUID REFERENCES public.orchards(id) ON DELETE CASCADE,
    predicted_yield_kg DECIMAL(10,2),
    confidence_pct INTEGER,
    forecast_date DATE NOT NULL,
    model_version TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE POLLINATION CONTRACTS TABLE
CREATE TABLE IF NOT EXISTS public.pollination_contracts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    grower_id UUID REFERENCES auth.users(id) NOT NULL,
    beekeeper_id UUID REFERENCES auth.users(id) NOT NULL,
    orchard_id UUID REFERENCES public.orchards(id) ON DELETE SET NULL,
    hive_count_ordered INTEGER NOT NULL,
    hive_count_deployed INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'pending', -- pending, active, completed, cancelled
    target_fpa DECIMAL(4,2),
    actual_fpa DECIMAL(4,2),
    payment_amount DECIMAL(12,2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. SECURITY: ROW LEVEL SECURITY (RLS)
-- Enable RLS on all new tables
ALTER TABLE public.orchards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculator_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yield_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pollination_contracts ENABLE ROW LEVEL SECURITY;

-- 8. POLICIES

-- ORCHARDS: Growers own their orchards.
CREATE POLICY "Growers manage own orchards" ON public.orchards
    FOR ALL USING (auth.uid() = grower_id);

CREATE POLICY "Beekeepers see relevant orchards" ON public.orchards
    FOR SELECT USING (
        id IN (SELECT orchard_id FROM public.pollination_contracts WHERE beekeeper_id = auth.uid())
    );

-- TELEMETRY GATEWAYS: Owner-based management
CREATE POLICY "Beekeepers manage own gateways" ON public.telemetry_gateways
    FOR ALL USING (auth.uid() = beekeeper_id);

-- CALCULATOR LOGS: Private to user
CREATE POLICY "Users view own calculator logs" ON public.calculator_logs
    FOR ALL USING (auth.uid() = user_id);

-- YIELD PREDICTIONS: Visible to associated user
CREATE POLICY "Users view own yield predictions" ON public.yield_predictions
    FOR SELECT USING (
        apiary_id IN (SELECT id FROM public.apiaries WHERE user_id = auth.uid()) OR
        orchard_id IN (SELECT id FROM public.orchards WHERE grower_id = auth.uid())
    );

-- POLLINATION CONTRACTS: Both parties can view
CREATE POLICY "Parties view own contracts" ON public.pollination_contracts
    FOR ALL USING (auth.uid() = grower_id OR auth.uid() = beekeeper_id);

-- 9. REFINING CORE TABLES (Existing Policies)
-- Ensure Beekeeper vs Grower logic for Hives & Apiaries
CREATE POLICY "Growers see contracted apiaries" ON public.apiaries
    FOR SELECT USING (
        id IN (SELECT apiary_id FROM public.hives WHERE id IN (
            SELECT h.id FROM public.hives h
            JOIN public.pollination_contracts c ON h.apiary_id = c.id -- Simplified logic for now
        ))
    );

-- 10. UPDATE TRIGGERS
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('orchards', 'telemetry_gateways', 'pollination_contracts')
    LOOP
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()', t, t);
    END LOOP;
END;
$$;
