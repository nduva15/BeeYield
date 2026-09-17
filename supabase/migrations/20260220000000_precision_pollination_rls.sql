-- BeeYield Precision Pollination: Security & RLS Migration
-- Target: Supabase / Postgres

-- 1. Enable RLS on core tables if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orchards') THEN
        ALTER TABLE public.orchards ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'telemetry_gateways') THEN
        ALTER TABLE public.telemetry_gateways ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hives') THEN
        ALTER TABLE public.hives ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sensor_data') THEN
        ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'calculator_logs') THEN
        ALTER TABLE public.calculator_logs ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'yield_predictions') THEN
        ALTER TABLE public.yield_predictions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. Drop existing policies to prevent conflicts if tables exist
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orchards') THEN
        DROP POLICY IF EXISTS "Growers manage own orchards" ON public.orchards;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'yield_predictions') THEN
        DROP POLICY IF EXISTS "Growers view own yield predictions" ON public.yield_predictions;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'telemetry_gateways') THEN
        DROP POLICY IF EXISTS "Beekeepers manage own gateways" ON public.telemetry_gateways;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hives') THEN
        DROP POLICY IF EXISTS "Beekeepers view own hives" ON public.hives;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sensor_data') THEN
        DROP POLICY IF EXISTS "Beekeepers view own sensor data" ON public.sensor_data;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'calculator_logs') THEN
        DROP POLICY IF EXISTS "Users manage own calculator logs" ON public.calculator_logs;
    END IF;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 3. GROWER & BEEKEEPER POLICIES (applied safely via dynamic SQL if tables and columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orchards') THEN
        EXECUTE 'CREATE POLICY "Growers manage own orchards" ON public.orchards FOR ALL USING (auth.uid() = grower_id)';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'yield_predictions') 
       AND EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orchards') THEN
        EXECUTE 'CREATE POLICY "Growers view own yield predictions" ON public.yield_predictions FOR SELECT USING (orchard_id IN (SELECT id FROM public.orchards WHERE grower_id = auth.uid()))';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'telemetry_gateways') THEN
        EXECUTE 'CREATE POLICY "Beekeepers manage own gateways" ON public.telemetry_gateways FOR ALL USING (auth.uid() = beekeeper_id)';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hives') 
       AND EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'hives' AND column_name = 'gateway_id') THEN
        EXECUTE 'CREATE POLICY "Beekeepers view own hives" ON public.hives FOR SELECT USING (gateway_id IN (SELECT id FROM public.telemetry_gateways WHERE beekeeper_id = auth.uid()))';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sensor_data') THEN
        EXECUTE 'CREATE POLICY "Beekeepers view own sensor data" ON public.sensor_data FOR SELECT USING (hive_id IN (SELECT h.id FROM public.hives h JOIN public.telemetry_gateways g ON h.gateway_id = g.id WHERE g.beekeeper_id = auth.uid()))';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'calculator_logs') THEN
        EXECUTE 'CREATE POLICY "Users manage own calculator logs" ON public.calculator_logs FOR ALL USING (auth.uid() = user_id)';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
