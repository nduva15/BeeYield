-- ==========================================
-- BEEYIELD: INFRASTRUCTURE & BILLING EXTENSION (RECOVERY)
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. EXTEND HIVES WITH GEOSPATIAL DATA (Optional PostGIS dependency)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
        ALTER TABLE public.hives ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT) NULL;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Skipping geospatial column: PostGIS error or missing.';
END $$;

-- 2. CREATE BILLING LEDGER (eTIMS & Financials)
-- This is the authoritative table for all transactions.
CREATE TABLE IF NOT EXISTS public.billing_ledger (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
    module_type TEXT NOT NULL, -- Pollination, Honey, Sale, etc.
    description TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    etims_status TEXT DEFAULT 'pending' CHECK (etims_status IN ('pending', 'synced', 'failed')),
    etims_invoice_id TEXT,
    pdf_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INFRASTRUCTURE REGISTRY (IoT & Hardware)
CREATE TABLE IF NOT EXISTS public.infrastructure_registry (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE SET NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('gateway', 'weight_scale', 'acoustic_node')),
    serial_number TEXT UNIQUE NOT NULL,
    calibration_offset DECIMAL(10, 4) DEFAULT 0,
    firmware_version TEXT,
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. HEALTH AUDIT LOGS (AI Diagnostics)
CREATE TABLE IF NOT EXISTS public.health_audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE NOT NULL,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('vision', 'acoustic')),
    mite_count INTEGER,
    brood_coverage_pct DECIMAL(5, 2),
    spectral_classification TEXT, -- swarming, optimal, queenless, etc.
    confidence_score DECIMAL(5, 4),
    image_path TEXT,
    result_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. EXPORT AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.export_audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    export_type TEXT NOT NULL, -- PDF, XLS, Bulk
    entity_scope TEXT, -- Billing, Hives, etc.
    file_name TEXT,
    record_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. GEOFENCES (Security Boundaries)
CREATE TABLE IF NOT EXISTS public.geofences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    alert_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Spatial columns (location/boundary) removed from core creation to avoid PostGIS dependency failures.
-- They can be added via a separate optional migration.

-- 7. ENABLE RLS
ALTER TABLE public.billing_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofences ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT table_name FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name IN ('billing_ledger', 'infrastructure_registry', 'health_audit_logs', 'export_audit_logs', 'geofences')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users can view own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can view own %I" ON public.%I FOR SELECT USING (auth.uid() = user_id)', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can insert own %I" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Users can update own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can update own %I" ON public.%I FOR UPDATE USING (auth.uid() = user_id)', tbl, tbl);
    END LOOP;
END;
$$;

-- 9. TRIGGERS FOR updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name IN ('billing_ledger', 'infrastructure_registry', 'geofences')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()', t, t);
    END LOOP;
END;
$$;
