-- ============================================================
-- BeeYield Backend Integration: Static Pages
-- Version: 1.0
-- Date: 2026-02-11
-- Description: Creates tables, RLS, indexes and RPCs for pages
--   that were previously static/mock-only:
--     Varroa Analytics, Sound Analysis, Billing, USB Pairing,
--     Server Status, Agro Intelligence, Health Guide.
--   Tables for Image Analysis, Bluetooth, and Sensor Readings
--   already exist in earlier migrations.
-- ============================================================

-- =========================
-- 1. ACOUSTIC READINGS
-- =========================
CREATE TABLE IF NOT EXISTS public.acoustic_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID NOT NULL REFERENCES public.hives(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    frequency_hz FLOAT NOT NULL,
    amplitude_db FLOAT,
    health_index FLOAT CHECK (health_index >= 0 AND health_index <= 1),
    spectral_profile JSONB DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT '{}',
    model_version TEXT DEFAULT 'v1.0',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.acoustic_readings IS 'Time-series acoustic data captured from hive microphones for sound analysis.';

CREATE INDEX IF NOT EXISTS idx_acoustic_hive_time ON acoustic_readings (hive_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_acoustic_user ON acoustic_readings (user_id);
CREATE INDEX IF NOT EXISTS idx_acoustic_tags ON acoustic_readings USING GIN (tags);

ALTER TABLE acoustic_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "acoustic_readings_select_own" ON acoustic_readings;
CREATE POLICY "acoustic_readings_select_own" ON acoustic_readings
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "acoustic_readings_insert_own" ON acoustic_readings;
CREATE POLICY "acoustic_readings_insert_own" ON acoustic_readings
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "acoustic_readings_update_own" ON acoustic_readings;
CREATE POLICY "acoustic_readings_update_own" ON acoustic_readings
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "acoustic_readings_delete_own" ON acoustic_readings;
CREATE POLICY "acoustic_readings_delete_own" ON acoustic_readings
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

GRANT ALL ON acoustic_readings TO authenticated;
GRANT ALL ON acoustic_readings TO service_role;


-- =========================
-- 2. VARROA READINGS
-- =========================
CREATE TABLE IF NOT EXISTS public.varroa_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID NOT NULL REFERENCES public.hives(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
    method TEXT DEFAULT 'alcohol_wash' CHECK (method IN ('alcohol_wash', 'sticky_board', 'sugar_roll', 'visual', 'other')),
    mite_count INTEGER NOT NULL DEFAULT 0,
    sample_size INTEGER DEFAULT 300,
    infestation_rate FLOAT GENERATED ALWAYS AS (
        CASE WHEN sample_size > 0 THEN (mite_count::FLOAT / sample_size) * 100 ELSE 0 END
    ) STORED,
    inspector_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.varroa_readings IS 'Varroa mite counts and infestation rates for hives.';

CREATE INDEX IF NOT EXISTS idx_varroa_hive_date ON varroa_readings (hive_id, reading_date DESC);
CREATE INDEX IF NOT EXISTS idx_varroa_user ON varroa_readings (user_id);

ALTER TABLE varroa_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "varroa_readings_select_own" ON varroa_readings;
CREATE POLICY "varroa_readings_select_own" ON varroa_readings
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "varroa_readings_insert_own" ON varroa_readings;
CREATE POLICY "varroa_readings_insert_own" ON varroa_readings
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "varroa_readings_update_own" ON varroa_readings;
CREATE POLICY "varroa_readings_update_own" ON varroa_readings
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "varroa_readings_delete_own" ON varroa_readings;
CREATE POLICY "varroa_readings_delete_own" ON varroa_readings
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

GRANT ALL ON varroa_readings TO authenticated;
GRANT ALL ON varroa_readings TO service_role;


-- =========================
-- 3. VARROA TREATMENTS
-- =========================
CREATE TABLE IF NOT EXISTS public.varroa_treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID NOT NULL REFERENCES public.hives(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    treatment_type TEXT NOT NULL CHECK (treatment_type IN ('oxalic_acid', 'formic_acid', 'thymol', 'amitraz', 'fluvalinate', 'biotechnical', 'other')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    dosage TEXT,
    effectiveness_percent FLOAT CHECK (effectiveness_percent >= 0 AND effectiveness_percent <= 100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.varroa_treatments IS 'Treatment records for varroa mite management.';

CREATE INDEX IF NOT EXISTS idx_varroa_treatment_hive ON varroa_treatments (hive_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_varroa_treatment_user ON varroa_treatments (user_id);

ALTER TABLE varroa_treatments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "varroa_treatments_select_own" ON varroa_treatments;
CREATE POLICY "varroa_treatments_select_own" ON varroa_treatments
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "varroa_treatments_insert_own" ON varroa_treatments;
CREATE POLICY "varroa_treatments_insert_own" ON varroa_treatments
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "varroa_treatments_update_own" ON varroa_treatments;
CREATE POLICY "varroa_treatments_update_own" ON varroa_treatments
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "varroa_treatments_delete_own" ON varroa_treatments;
CREATE POLICY "varroa_treatments_delete_own" ON varroa_treatments
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

GRANT ALL ON varroa_treatments TO authenticated;
GRANT ALL ON varroa_treatments TO service_role;


-- =========================
-- 4. SUBSCRIPTIONS & BILLING
-- =========================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'basic', 'premium', 'enterprise')),
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_annual DECIMAL(10,2),
    max_hives INTEGER DEFAULT 5,
    max_apiaries INTEGER DEFAULT 1,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'paused')),
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    description TEXT,
    invoice_url TEXT,
    stripe_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.subscription_plans IS 'Available subscription tiers for the BeeYield platform.';
COMMENT ON TABLE public.subscriptions IS 'User subscription records.';
COMMENT ON TABLE public.transactions IS 'Payment/transaction history for billing.';

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (created_at DESC);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Plans are publicly readable
DROP POLICY IF EXISTS "plans_readable_by_all" ON subscription_plans;
CREATE POLICY "plans_readable_by_all" ON subscription_plans
    FOR SELECT TO authenticated
    USING (true);

-- Users see only their own subscriptions
DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
CREATE POLICY "subscriptions_select_own" ON subscriptions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Users see only their own transactions
DROP POLICY IF EXISTS "transactions_select_own" ON transactions;
CREATE POLICY "transactions_select_own" ON transactions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

GRANT SELECT ON subscription_plans TO authenticated;
GRANT SELECT ON subscriptions TO authenticated;
GRANT SELECT ON transactions TO authenticated;
GRANT ALL ON subscription_plans TO service_role;
GRANT ALL ON subscriptions TO service_role;
GRANT ALL ON transactions TO service_role;


-- =========================
-- 5. USB/HARDWARE PAIRING
-- =========================
CREATE TABLE IF NOT EXISTS public.paired_usb_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_uid TEXT NOT NULL,
    device_type TEXT DEFAULT 'beeyield_hub' CHECK (device_type IN ('beeyield_hub', 'usb_scale', 'usb_sensor', 'other')),
    serial_number TEXT,
    firmware_version TEXT,
    last_known_config JSONB DEFAULT '{}'::jsonb,
    paired_at TIMESTAMPTZ DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ,
    status TEXT DEFAULT 'paired' CHECK (status IN ('paired', 'disconnected', 'firmware_updating', 'error')),
    UNIQUE (user_id, device_uid)
);

COMMENT ON TABLE public.paired_usb_devices IS 'Tracks USB hardware pairings for the UsbHubDashboard.';

CREATE INDEX IF NOT EXISTS idx_usb_user ON paired_usb_devices (user_id);

ALTER TABLE paired_usb_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usb_devices_manage_own" ON paired_usb_devices;
CREATE POLICY "usb_devices_manage_own" ON paired_usb_devices
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

GRANT ALL ON paired_usb_devices TO authenticated;
GRANT ALL ON paired_usb_devices TO service_role;


-- =========================
-- 6. API USAGE / SERVER STATUS
-- =========================
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    method TEXT DEFAULT 'GET',
    status_code INTEGER,
    response_time_ms INTEGER,
    called_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.api_usage_logs IS 'Tracks per-user API usage for ServerStatusView.';

CREATE INDEX IF NOT EXISTS idx_api_usage_user_time ON api_usage_logs (user_id, called_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage_logs (endpoint);

ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "api_usage_select_own" ON api_usage_logs;
CREATE POLICY "api_usage_select_own" ON api_usage_logs
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

GRANT SELECT ON api_usage_logs TO authenticated;
GRANT ALL ON api_usage_logs TO service_role;

-- RPC: Aggregate API usage stats
CREATE OR REPLACE FUNCTION public.get_api_usage_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_calls BIGINT,
    avg_response_ms FLOAT,
    error_count BIGINT,
    top_endpoints JSONB,
    daily_usage JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT
            COUNT(*) AS total,
            AVG(response_time_ms)::FLOAT AS avg_ms,
            COUNT(*) FILTER (WHERE status_code >= 400) AS errors
        FROM api_usage_logs
        WHERE user_id = p_user_id
          AND called_at >= NOW() - (p_days || ' days')::INTERVAL
    ),
    top_ep AS (
        SELECT jsonb_agg(jsonb_build_object('endpoint', endpoint, 'count', cnt))
        FROM (
            SELECT endpoint, COUNT(*) AS cnt
            FROM api_usage_logs
            WHERE user_id = p_user_id
              AND called_at >= NOW() - (p_days || ' days')::INTERVAL
            GROUP BY endpoint
            ORDER BY cnt DESC
            LIMIT 10
        ) sub
    ),
    daily AS (
        SELECT jsonb_agg(jsonb_build_object('date', d, 'count', cnt))
        FROM (
            SELECT DATE(called_at) AS d, COUNT(*) AS cnt
            FROM api_usage_logs
            WHERE user_id = p_user_id
              AND called_at >= NOW() - (p_days || ' days')::INTERVAL
            GROUP BY DATE(called_at)
            ORDER BY d
        ) sub
    )
    SELECT
        s.total,
        s.avg_ms,
        s.errors,
        COALESCE(te.jsonb_agg, '[]'::jsonb),
        COALESCE(da.jsonb_agg, '[]'::jsonb)
    FROM stats s, top_ep te, daily da;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_api_usage_stats TO authenticated;


-- =========================
-- 7. AGRO / SATELLITE DATA
-- =========================
CREATE TABLE IF NOT EXISTS public.satellite_indices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ndvi FLOAT,
    evi FLOAT,
    soil_moisture_index FLOAT,
    cloud_cover_percent FLOAT,
    source TEXT DEFAULT 'sentinel-2',
    geojson_boundary JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.satellite_indices IS 'Satellite-derived vegetation and soil indices for Agro Intelligence.';

CREATE INDEX IF NOT EXISTS idx_satellite_apiary_time ON satellite_indices (apiary_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_satellite_user ON satellite_indices (user_id);

ALTER TABLE satellite_indices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "satellite_select_own" ON satellite_indices;
CREATE POLICY "satellite_select_own" ON satellite_indices
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "satellite_insert_own" ON satellite_indices;
CREATE POLICY "satellite_insert_own" ON satellite_indices
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

GRANT ALL ON satellite_indices TO authenticated;
GRANT ALL ON satellite_indices TO service_role;

-- Weather History (per-apiary)
CREATE TABLE IF NOT EXISTS public.weather_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    temp_celsius FLOAT,
    humidity_percent FLOAT,
    wind_speed_kmh FLOAT,
    precipitation_mm FLOAT,
    uv_index FLOAT,
    conditions TEXT, -- 'sunny', 'cloudy', 'rain', 'storm'
    source TEXT DEFAULT 'openweather',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.weather_history IS 'Historical weather data for apiary locations.';

CREATE INDEX IF NOT EXISTS idx_weather_apiary_time ON weather_history (apiary_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_user ON weather_history (user_id);

ALTER TABLE weather_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "weather_select_own" ON weather_history;
CREATE POLICY "weather_select_own" ON weather_history
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "weather_insert_own" ON weather_history;
CREATE POLICY "weather_insert_own" ON weather_history
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

GRANT ALL ON weather_history TO authenticated;
GRANT ALL ON weather_history TO service_role;


-- =========================
-- 8. HEALTH KNOWLEDGE BASE
-- =========================
CREATE TABLE IF NOT EXISTS public.health_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('disease', 'pest', 'nutrition', 'management', 'seasonal', 'emergency', 'general')),
    severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
    symptoms TEXT[],
    description TEXT NOT NULL,
    treatment_options TEXT[],
    prevention_tips TEXT[],
    image_url TEXT,
    source_references JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.health_knowledge_base IS 'Curated knowledge articles for the Health Guide page.';

CREATE INDEX IF NOT EXISTS idx_health_kb_category ON health_knowledge_base (category);
CREATE INDEX IF NOT EXISTS idx_health_kb_severity ON health_knowledge_base (severity);

ALTER TABLE health_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Knowledge base is publicly readable by authenticated users
DROP POLICY IF EXISTS "health_kb_read_all" ON health_knowledge_base;
CREATE POLICY "health_kb_read_all" ON health_knowledge_base
    FOR SELECT TO authenticated
    USING (is_published = true);

-- Only service_role can write
GRANT SELECT ON health_knowledge_base TO authenticated;
GRANT ALL ON health_knowledge_base TO service_role;


-- =========================
-- 9. FORAGE ZONES (Flight Map)
-- =========================
CREATE TABLE IF NOT EXISTS public.forage_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    zone_name TEXT,
    flora_type TEXT, -- 'acacia', 'sunflower', 'wildflower', etc.
    radius_km FLOAT DEFAULT 1.5,
    density_score FLOAT CHECK (density_score >= 0 AND density_score <= 1),
    season TEXT CHECK (season IN ('spring', 'summer', 'autumn', 'winter', 'year_round')),
    geojson JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.forage_zones IS 'Foraging areas mapped around apiaries for the Flight Map view.';

CREATE INDEX IF NOT EXISTS idx_forage_apiary ON forage_zones (apiary_id);
CREATE INDEX IF NOT EXISTS idx_forage_user ON forage_zones (user_id);

ALTER TABLE forage_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forage_zones_manage_own" ON forage_zones;
CREATE POLICY "forage_zones_manage_own" ON forage_zones
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

GRANT ALL ON forage_zones TO authenticated;
GRANT ALL ON forage_zones TO service_role;


-- =========================
-- 10. SEED HEALTH KNOWLEDGE BASE
-- =========================
INSERT INTO public.health_knowledge_base (title, category, severity, symptoms, description, treatment_options, prevention_tips)
VALUES
    (
        'American Foulbrood (AFB)',
        'disease', 'critical',
        ARRAY['Sunken, perforated brood caps', 'Foul odor', 'Ropey larval remains', 'Scale on cell walls'],
        'A highly contagious bacterial disease (Paenibacillus larvae) affecting bee larvae. Spores can survive for decades. Reportable in most jurisdictions.',
        ARRAY['Burn infected equipment', 'Antibiotic treatment (oxytetracycline) where legal', 'Shook swarm method onto new foundation'],
        ARRAY['Regular brood inspections', 'Avoid sharing equipment', 'Maintain strong colonies', 'Purchase verified disease-free stock']
    ),
    (
        'Varroa Destructor',
        'pest', 'critical',
        ARRAY['Deformed wings in emerging bees', 'Reduced colony population', 'Visible mites on bees/brood', 'Spotty brood pattern'],
        'The most destructive parasite of honey bees worldwide. Feeds on fat bodies of bees and transmits multiple viruses. Without treatment, colonies typically collapse within 1-3 years.',
        ARRAY['Oxalic acid vaporization', 'Formic acid treatment', 'Thymol-based products (Apiguard)', 'Biotechnical methods (drone brood removal)'],
        ARRAY['Monitor mite loads monthly', 'Treat in late summer before winter bees are raised', 'Use resistant stock (VSH, Russian)', 'Rotate treatment methods']
    ),
    (
        'Nosema',
        'disease', 'warning',
        ARRAY['Dysentery (brown streaking on hive)', 'Reduced foraging activity', 'Queen supersedure', 'Crawling bees at entrance'],
        'A microsporidian gut parasite (Nosema ceranae/apis) that disrupts digestion and shortens bee lifespan. More prevalent in cool, damp conditions.',
        ARRAY['Fumagillin treatment where available', 'Re-queening with resistant stock', 'Ensure adequate ventilation'],
        ARRAY['Good hive ventilation', 'Clean water sources', 'Avoid overcrowded apiaries', 'Replace old comb regularly']
    ),
    (
        'Small Hive Beetle (SHB)',
        'pest', 'warning',
        ARRAY['Slime on combs', 'Fermented honey', 'Beetle larvae in comb', 'Adult beetles hiding in crevices'],
        'Aethina tumida, a scavenger beetle that damages comb, honey, and pollen. Thrives in warm, humid environments. Larvae cause the most damage.',
        ARRAY['Beetle traps (oil-based)', 'Ground drenching for pupae', 'Reduce hive space for weak colonies'],
        ARRAY['Maintain strong colonies', 'Extract honey promptly', 'Keep apiary area clear of debris', 'Use screened bottom boards']
    ),
    (
        'Seasonal: Winter Preparation',
        'seasonal', 'info',
        ARRAY[]::TEXT[],
        'Proper winter preparation is critical for colony survival. Ensure adequate food stores (18-27kg honey), reduce entrances, and verify queen health before the cold season.',
        ARRAY[]::TEXT[],
        ARRAY['Combine weak colonies in autumn', 'Feed 2:1 sugar syrup if stores are low', 'Install mouse guards', 'Ensure upper ventilation', 'Treat for varroa before winter bees are raised']
    ),
    (
        'Emergency: Colony Collapse Disorder (CCD)',
        'emergency', 'critical',
        ARRAY['Rapid loss of adult bees', 'Queen present with few workers', 'No dead bees near hive', 'Delayed robbing of resources'],
        'A phenomenon characterized by the sudden disappearance of the majority of worker bees. Multiple contributing factors including pesticides, pathogens, and nutritional stress.',
        ARRAY['Remove contaminated comb', 'Requeen the colony', 'Provide supplemental feeding', 'Consult local extension agency'],
        ARRAY['Diversify pollen sources', 'Minimize pesticide exposure', 'Maintain genetic diversity', 'Regular health monitoring']
    )
ON CONFLICT DO NOTHING;


-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
