-- ============================================
-- Queens & Queen Rearing Batches
-- ============================================

-- Queens table: tracks queen bees assigned to hives
CREATE TABLE IF NOT EXISTS queens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID REFERENCES hives(id) ON DELETE SET NULL,
    user_id UUID,
    name VARCHAR(255),
    breed VARCHAR(100),
    origin VARCHAR(100),          -- purchased, raised, swarm-caught
    marking_color VARCHAR(50),    -- white, yellow, red, green, blue
    year_introduced INT,
    status VARCHAR(50) DEFAULT 'active',  -- active, failed, superseded, lost
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queen Rearing Batches: tracks rearing cycles
CREATE TABLE IF NOT EXISTS queen_rearing_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID REFERENCES hives(id) ON DELETE CASCADE,
    user_id UUID,
    batch_name VARCHAR(255) NOT NULL,
    method VARCHAR(100) DEFAULT 'Grafting',   -- Grafting, Walk-away, Miller, Jenter, OTS
    start_date DATE NOT NULL,
    planned_units INT DEFAULT 20,
    notebook TEXT,
    generate_calendar BOOLEAN DEFAULT TRUE,
    generate_units BOOLEAN DEFAULT TRUE,
    generate_reminders BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'active',  -- active, completed, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_queens_hive_id ON queens(hive_id);
CREATE INDEX IF NOT EXISTS idx_queens_user_id ON queens(user_id);
CREATE INDEX IF NOT EXISTS idx_queen_rearing_hive_id ON queen_rearing_batches(hive_id);
CREATE INDEX IF NOT EXISTS idx_queen_rearing_user_id ON queen_rearing_batches(user_id);

-- RLS Policies (optional — service-role bypasses)
ALTER TABLE queens ENABLE ROW LEVEL SECURITY;
ALTER TABLE queen_rearing_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Queens: user can manage own" ON queens
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Queen Rearing: user can manage own" ON queen_rearing_batches
    FOR ALL USING (user_id = auth.uid());
