-- ============================================
-- BeeYield Meters Module Schema
-- Supports building utility monitoring and settlements
-- ============================================

-- 1. Buildings Table
CREATE TABLE IF NOT EXISTS meters_buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    county TEXT,
    region TEXT,
    latitude FLOAT,
    longitude FLOAT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Apartments / Units Table
CREATE TABLE IF NOT EXISTS meters_apartments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES meters_buildings(id) ON DELETE CASCADE,
    unit_number TEXT NOT NULL, -- e.g. 'Apartment 12', 'Warehouse A1'
    floor TEXT,
    occupant_name TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Meters Table
CREATE TABLE IF NOT EXISTS meters_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apartment_id UUID REFERENCES meters_apartments(id) ON DELETE SET NULL,
    building_id UUID REFERENCES meters_buildings(id) ON DELETE CASCADE,
    meter_type TEXT NOT NULL, -- 'Water', 'Heat', 'Energy', 'Other'
    meter_number TEXT NOT NULL UNIQUE,
    meter_code TEXT, -- e.g. (C-WM-PL-001)
    status TEXT DEFAULT 'OK', -- 'OK', 'WARNING', 'ALERT', 'DISCONNECTED'
    has_alarm BOOLEAN DEFAULT false,
    install_date DATE,
    last_reading_value DECIMAL(12, 3),
    last_reading_unit TEXT,
    last_reading_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 4. Meter Readings (Time Series)
CREATE TABLE IF NOT EXISTS meters_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meter_id UUID REFERENCES meters_devices(id) ON DELETE CASCADE,
    value DECIMAL(12, 3) NOT NULL,
    unit TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    reading_type TEXT DEFAULT 'AUTOMATIC', -- 'AUTOMATIC', 'MANUAL'
    metadata JSONB DEFAULT '{}'
);

-- 5. Billing Rates
CREATE TABLE IF NOT EXISTS meters_billing_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meter_type TEXT NOT NULL, -- 'Water', 'Heat', 'Energy', 'Other'
    rate_per_unit DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    currency TEXT DEFAULT 'KES',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 6. Events / Alarms Log
CREATE TABLE IF NOT EXISTS meters_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meter_id UUID REFERENCES meters_devices(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'Leak', 'Tamper', 'Low Battery', 'Backflow'
    severity TEXT NOT NULL, -- 'INFO', 'WARNING', 'ALERT'
    message TEXT,
    reason TEXT,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Register for RLS
ALTER TABLE meters_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meters_apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meters_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE meters_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meters_billing_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE meters_events ENABLE ROW LEVEL SECURITY;

-- Public read for dev (simplified)
CREATE POLICY "Public read for meters_buildings" ON meters_buildings FOR SELECT USING (true);
CREATE POLICY "Public read for meters_apartments" ON meters_apartments FOR SELECT USING (true);
CREATE POLICY "Public read for meters_devices" ON meters_devices FOR SELECT USING (true);
CREATE POLICY "Public read for meters_readings" ON meters_readings FOR SELECT USING (true);
CREATE POLICY "Public read for meters_billing_rates" ON meters_billing_rates FOR SELECT USING (true);
CREATE POLICY "Public read for meters_events" ON meters_events FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meters_building ON meters_devices(building_id);
CREATE INDEX IF NOT EXISTS idx_meters_apartment ON meters_devices(apartment_id);
CREATE INDEX IF NOT EXISTS idx_meters_readings_timestamp ON meters_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_meters_events_timestamp ON meters_events(timestamp DESC);
