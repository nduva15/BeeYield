-- =====================================================
-- PRECISION POLLINATION MODULE - DATABASE SCHEMA
-- =====================================================
-- This schema supports the BeeYield Precision Pollination feature
-- including contracts, hive assignments, and analytics

-- =====================================================
-- 1. POLLINATION CONTRACTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS pollination_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_code VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farmer_id UUID REFERENCES farmers(id) ON DELETE SET NULL,
    
    -- Contract Details
    crop_type VARCHAR(100) NOT NULL,
    farm_location VARCHAR(255) NOT NULL,
    farm_size_acres DECIMAL(10, 2) NOT NULL CHECK (farm_size_acres > 0),
    
    -- Date Range
    contract_start_date DATE NOT NULL,
    contract_end_date DATE NOT NULL,
    CHECK (contract_end_date >= contract_start_date),
    
    -- Hive Requirements
    hive_count_required INTEGER NOT NULL CHECK (hive_count_required > 0),
    hive_count_deployed INTEGER DEFAULT 0 CHECK (hive_count_deployed >= 0),
    target_fpa DECIMAL(5, 2) NOT NULL CHECK (target_fpa > 0), -- Frames Per Acre
    actual_fpa DECIMAL(5, 2), -- Calculated based on deployment
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    
    -- Financial
    payment_amount DECIMAL(12, 2),
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
    
    -- Additional Info
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for pollination_contracts
CREATE INDEX IF NOT EXISTS idx_pollination_contracts_user_id ON pollination_contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_pollination_contracts_farmer_id ON pollination_contracts(farmer_id);
CREATE INDEX IF NOT EXISTS idx_pollination_contracts_status ON pollination_contracts(status);
CREATE INDEX IF NOT EXISTS idx_pollination_contracts_dates ON pollination_contracts(contract_start_date, contract_end_date);
CREATE INDEX IF NOT EXISTS idx_pollination_contracts_crop_type ON pollination_contracts(crop_type);

-- =====================================================
-- 2. HIVE ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS hive_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES pollination_contracts(id) ON DELETE CASCADE,
    hive_id UUID NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
    
    -- Assignment Details
    assignment_date DATE NOT NULL,
    removal_date DATE,
    CHECK (removal_date IS NULL OR removal_date >= assignment_date),
    
    -- Placement Information
    placement_location VARCHAR(255),
    placement_lat DECIMAL(10, 7),
    placement_lng DECIMAL(10, 7),
    
    -- Additional Info
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a hive can't be assigned to multiple active contracts
    UNIQUE(hive_id, contract_id)
);

-- Indexes for hive_assignments
CREATE INDEX IF NOT EXISTS idx_hive_assignments_contract_id ON hive_assignments(contract_id);
CREATE INDEX IF NOT EXISTS idx_hive_assignments_hive_id ON hive_assignments(hive_id);
CREATE INDEX IF NOT EXISTS idx_hive_assignments_dates ON hive_assignments(assignment_date, removal_date);

-- =====================================================
-- 3. CROP POLLINATION REQUIREMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS crop_pollination_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name VARCHAR(100) UNIQUE NOT NULL,
    
    -- Pollination Requirements
    target_fpa DECIMAL(5, 2) NOT NULL, -- Target Frames Per Acre
    min_fpa DECIMAL(5, 2) NOT NULL,
    optimal_fpa DECIMAL(5, 2) NOT NULL,
    
    -- Crop Characteristics
    bloom_period_days INTEGER NOT NULL,
    pollination_dependency VARCHAR(20) NOT NULL CHECK (pollination_dependency IN ('High', 'Medium', 'Low')),
    expected_yield_increase_percent DECIMAL(5, 2) NOT NULL,
    
    -- Additional Info
    description TEXT,
    best_practices TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. POLLINATION ACTIVITY LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS pollination_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES pollination_contracts(id) ON DELETE CASCADE,
    hive_id UUID REFERENCES hives(id) ON DELETE SET NULL,
    
    -- Activity Details
    activity_type VARCHAR(50) NOT NULL, -- deployment, removal, inspection, alert, payment
    activity_description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical', 'success')),
    
    -- Metadata (JSON for flexible data storage)
    metadata JSONB,
    
    -- Timestamp
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for pollination_activity_logs
CREATE INDEX IF NOT EXISTS idx_pollination_activity_logs_contract_id ON pollination_activity_logs(contract_id);
CREATE INDEX IF NOT EXISTS idx_pollination_activity_logs_hive_id ON pollination_activity_logs(hive_id);
CREATE INDEX IF NOT EXISTS idx_pollination_activity_logs_timestamp ON pollination_activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pollination_activity_logs_severity ON pollination_activity_logs(severity);

-- =====================================================
-- 5. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_pollination_contracts_updated_at ON pollination_contracts;
CREATE TRIGGER update_pollination_contracts_updated_at
    BEFORE UPDATE ON pollination_contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hive_assignments_updated_at ON hive_assignments;
CREATE TRIGGER update_hive_assignments_updated_at
    BEFORE UPDATE ON hive_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crop_pollination_requirements_updated_at ON crop_pollination_requirements;
CREATE TRIGGER update_crop_pollination_requirements_updated_at
    BEFORE UPDATE ON crop_pollination_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE pollination_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hive_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_pollination_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pollination_activity_logs ENABLE ROW LEVEL SECURITY;

-- Pollination Contracts Policies
DROP POLICY IF EXISTS "Users can view their own contracts" ON pollination_contracts;
CREATE POLICY "Users can view their own contracts"
    ON pollination_contracts FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

DROP POLICY IF EXISTS "Users can create their own contracts" ON pollination_contracts;
CREATE POLICY "Users can create their own contracts"
    ON pollination_contracts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own contracts" ON pollination_contracts;
CREATE POLICY "Users can update their own contracts"
    ON pollination_contracts FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

DROP POLICY IF EXISTS "Users can delete their own contracts" ON pollination_contracts;
CREATE POLICY "Users can delete their own contracts"
    ON pollination_contracts FOR DELETE
    USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Hive Assignments Policies (inherit from contract permissions)
DROP POLICY IF EXISTS "Users can view assignments for their contracts" ON hive_assignments;
CREATE POLICY "Users can view assignments for their contracts"
    ON hive_assignments FOR SELECT
    USING (
        contract_id IN (SELECT id FROM pollination_contracts WHERE user_id = auth.uid())
        OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
    );

DROP POLICY IF EXISTS "Users can create assignments for their contracts" ON hive_assignments;
CREATE POLICY "Users can create assignments for their contracts"
    ON hive_assignments FOR INSERT
    WITH CHECK (
        contract_id IN (SELECT id FROM pollination_contracts WHERE user_id = auth.uid())
        OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
    );

DROP POLICY IF EXISTS "Users can update assignments for their contracts" ON hive_assignments;
CREATE POLICY "Users can update assignments for their contracts"
    ON hive_assignments FOR UPDATE
    USING (
        contract_id IN (SELECT id FROM pollination_contracts WHERE user_id = auth.uid())
        OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
    );

DROP POLICY IF EXISTS "Users can delete assignments for their contracts" ON hive_assignments;
CREATE POLICY "Users can delete assignments for their contracts"
    ON hive_assignments FOR DELETE
    USING (
        contract_id IN (SELECT id FROM pollination_contracts WHERE user_id = auth.uid())
        OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
    );

-- Crop Requirements Policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view crop requirements" ON crop_pollination_requirements;
CREATE POLICY "Anyone can view crop requirements"
    ON crop_pollination_requirements FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Only admins can modify crop requirements" ON crop_pollination_requirements;
CREATE POLICY "Only admins can modify crop requirements"
    ON crop_pollination_requirements FOR ALL
    USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Activity Logs Policies
DROP POLICY IF EXISTS "Users can view logs for their contracts" ON pollination_activity_logs;
CREATE POLICY "Users can view logs for their contracts"
    ON pollination_activity_logs FOR SELECT
    USING (
        contract_id IN (SELECT id FROM pollination_contracts WHERE user_id = auth.uid())
        OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
    );

DROP POLICY IF EXISTS "System can create activity logs" ON pollination_activity_logs;
CREATE POLICY "System can create activity logs"
    ON pollination_activity_logs FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- 7. SEED DATA - CROP POLLINATION REQUIREMENTS
-- =====================================================

INSERT INTO crop_pollination_requirements (crop_name, target_fpa, min_fpa, optimal_fpa, bloom_period_days, pollination_dependency, expected_yield_increase_percent, description)
VALUES
    ('Sunflower', 2.0, 1.5, 2.5, 21, 'High', 35.0, 'Sunflowers are highly dependent on bee pollination for seed set and oil content.'),
    ('Avocado', 2.5, 2.0, 3.0, 14, 'High', 40.0, 'Avocado flowers require cross-pollination and benefit greatly from strong bee colonies.'),
    ('Macadamia', 3.0, 2.5, 3.5, 28, 'High', 45.0, 'Macadamia nuts require intensive pollination during the extended bloom period.'),
    ('Coffee', 1.5, 1.0, 2.0, 7, 'Medium', 25.0, 'Coffee benefits from bee pollination but can self-pollinate to some extent.'),
    ('Mango', 2.0, 1.5, 2.5, 21, 'Medium', 30.0, 'Mango trees benefit from bee pollination for better fruit set and quality.'),
    ('Watermelon', 3.0, 2.5, 3.5, 14, 'High', 50.0, 'Watermelons are highly dependent on bees for pollination and fruit development.'),
    ('Cucumber', 2.5, 2.0, 3.0, 21, 'High', 40.0, 'Cucumbers require bee pollination for proper fruit formation.'),
    ('Tomato', 1.0, 0.5, 1.5, 28, 'Low', 15.0, 'Tomatoes can self-pollinate but benefit from bee vibration for better yields.'),
    ('Strawberry', 2.0, 1.5, 2.5, 14, 'Medium', 30.0, 'Strawberries benefit from bee pollination for larger, more uniform berries.'),
    ('Blueberry', 3.5, 3.0, 4.0, 21, 'High', 55.0, 'Blueberries are highly dependent on bee pollination for optimal yields.')
ON CONFLICT (crop_name) DO UPDATE SET
    target_fpa = EXCLUDED.target_fpa,
    min_fpa = EXCLUDED.min_fpa,
    optimal_fpa = EXCLUDED.optimal_fpa,
    bloom_period_days = EXCLUDED.bloom_period_days,
    pollination_dependency = EXCLUDED.pollination_dependency,
    expected_yield_increase_percent = EXCLUDED.expected_yield_increase_percent,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 8. HELPER VIEWS
-- =====================================================

-- View for active contracts with deployment statistics
CREATE OR REPLACE VIEW active_pollination_contracts AS
SELECT 
    pc.*,
    COUNT(ha.id) as assigned_hives,
    ROUND((COUNT(ha.id)::DECIMAL / pc.hive_count_required) * 100, 2) as deployment_percentage,
    ROUND((COUNT(ha.id)::DECIMAL * pc.target_fpa) / pc.farm_size_acres, 2) as current_fpa
FROM pollination_contracts pc
LEFT JOIN hive_assignments ha ON pc.id = ha.contract_id AND ha.removal_date IS NULL
WHERE pc.status = 'active'
GROUP BY pc.id;

-- View for contract analytics
CREATE OR REPLACE VIEW pollination_contract_analytics AS
SELECT 
    COUNT(*) as total_contracts,
    COUNT(*) FILTER (WHERE status = 'active') as active_contracts,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_contracts,
    SUM(hive_count_deployed) as total_hives_deployed,
    SUM(farm_size_acres) as total_acres_covered,
    ROUND(AVG(actual_fpa), 2) as average_fpa,
    SUM(payment_amount) FILTER (WHERE payment_status = 'paid') as total_revenue
FROM pollination_contracts;

COMMENT ON TABLE pollination_contracts IS 'Stores pollination service contracts with farmers';
COMMENT ON TABLE hive_assignments IS 'Tracks which hives are assigned to which pollination contracts';
COMMENT ON TABLE crop_pollination_requirements IS 'Reference data for crop-specific pollination requirements';
COMMENT ON TABLE pollination_activity_logs IS 'Activity logs for pollination operations';
