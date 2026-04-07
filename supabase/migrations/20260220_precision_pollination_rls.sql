-- BeeYield Precision Pollination: Security & RLS Migration
-- Target: Supabase / Postgres

-- 1. Enable RLS on core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orchards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculator_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yield_predictions ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent conflicts
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Growers manage own orchards" ON orchards;
    DROP POLICY IF EXISTS "Growers view own yield predictions" ON yield_predictions;
    DROP POLICY IF EXISTS "Beekeepers manage own gateways" ON telemetry_gateways;
    DROP POLICY IF EXISTS "Beekeepers view own hives" ON hives;
    DROP POLICY IF EXISTS "Beekeepers view own sensor data" ON sensor_data;
    DROP POLICY IF EXISTS "Users manage own calculator logs" ON calculator_logs;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 3. GROWER POLICIES
-- Growers can only see and edit their own orchards
CREATE POLICY "Growers manage own orchards" 
ON public.orchards FOR ALL 
USING (auth.uid() = grower_id);

-- Growers can view yield predictions for their orchards
CREATE POLICY "Growers view own yield predictions" 
ON public.yield_predictions FOR SELECT 
USING (
    orchard_id IN (SELECT id FROM orchards WHERE grower_id = auth.uid())
);

-- 4. BEEKEEPER POLICIES
-- Beekeepers manage their deployed gateways
CREATE POLICY "Beekeepers manage own gateways" 
ON public.telemetry_gateways FOR ALL 
USING (auth.uid() = beekeeper_id);

-- Beekeepers see hives attached to their gateways
CREATE POLICY "Beekeepers view own hives" 
ON public.hives FOR SELECT 
USING (
    gateway_id IN (SELECT id FROM telemetry_gateways WHERE beekeeper_id = auth.uid())
);

-- Beekeepers see sensor data (telemetry & weight) for their hives
-- Optimized with a subquery check on gateway ownership
CREATE POLICY "Beekeepers view own sensor data" 
ON public.sensor_data FOR SELECT 
USING (
    hive_id IN (
        SELECT h.id FROM hives h 
        JOIN telemetry_gateways g ON h.gateway_id = g.id 
        WHERE g.beekeeper_id = auth.uid()
    )
);

-- 5. UNIVERSAL POLICIES (Calculators)
-- Users (both roles) can only see their own calculator history
CREATE POLICY "Users manage own calculator logs" 
ON public.calculator_logs FOR ALL 
USING (auth.uid() = user_id);

-- 6. Helper View for Admin auditing (Optional)
-- CREATE VIEW security_audit_summary AS ...
