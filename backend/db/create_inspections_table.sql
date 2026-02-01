-- Inspections Table
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID REFERENCES hives(id) ON DELETE CASCADE,
    inspector_name TEXT,
    inspection_date DATE NOT NULL,
    findings TEXT,
    actions_taken TEXT,
    
    -- Health & Status
    health_status TEXT, -- 'healthy', 'weak', 'diseased', 'critical'
    temperament TEXT, -- 'calm', 'aggressive', 'nervous'
    
    -- Stores
    honey_stores FLOAT, -- estimation in kg or frames
    pollen_stores FLOAT, -- estimation in frames
    
    -- Brood
    brood_pattern TEXT, -- 'solid', 'spotty', 'none'
    eggs_seen BOOLEAN DEFAULT false,
    queen_seen BOOLEAN DEFAULT false,
    queen_cells_seen BOOLEAN DEFAULT false,
    
    -- Varroa/Pests
    varroa_mite_count INTEGER DEFAULT 0, -- per 300 bees (ether wash/sugar shake)
    small_hive_beetles_seen INTEGER DEFAULT 0,
    
    -- General
    weather_condition TEXT,
    temperature_celsius FLOAT,
    
    -- Meta
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable RLS
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON inspections;
CREATE POLICY "Enable read access for all users" ON inspections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON inspections;
CREATE POLICY "Enable insert access for all users" ON inspections FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON inspections;
CREATE POLICY "Enable update access for all users" ON inspections FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON inspections;
CREATE POLICY "Enable delete access for all users" ON inspections FOR DELETE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inspections_hive_id ON inspections(hive_id);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(inspection_date);
