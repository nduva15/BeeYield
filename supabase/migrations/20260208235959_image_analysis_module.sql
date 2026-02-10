-- BeeYield Image Analysis Module Migration
-- Version: 1.0
-- Date: 2026-02-08
-- Description: Creates tables and policies for image analysis feature

-- ============================================
-- TABLE: image_analyses
-- ============================================
CREATE TABLE IF NOT EXISTS image_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    apiary_id UUID REFERENCES apiaries(id) ON DELETE SET NULL,
    hive_id UUID REFERENCES hives(id) ON DELETE SET NULL,
    
    -- Image Storage Paths (Supabase Storage URLs)
    original_image_path TEXT,
    annotated_image_path TEXT,
    thumbnail_path TEXT,
    
    -- Analysis Parameters
    confidence_threshold DECIMAL(3,2) DEFAULT 0.40,
    overlap_threshold DECIMAL(3,2) DEFAULT 0.50,
    analysis_type TEXT DEFAULT 'full' CHECK (analysis_type IN ('full', 'detection_only', 'health_only', 'auto', 'apiary_count', 'frame_analysis', 'pest_scan')),
    
    -- Core Results
    bee_count INTEGER DEFAULT 0,
    hive_count INTEGER DEFAULT 0,
    pest_count INTEGER DEFAULT 0,
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    health_status TEXT CHECK (health_status IN ('Healthy', 'Warning', 'Critical', 'Unknown')),
    overall_confidence DECIMAL(5,4) DEFAULT 0,
    
    -- Detailed Results (JSONB for flexibility)
    detections JSONB DEFAULT '[]'::jsonb,
    disease_indicators JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    
    -- Image Metadata
    image_width INTEGER,
    image_height INTEGER,
    file_size_bytes INTEGER,
    
    -- Processing Metadata
    processing_time_ms INTEGER,
    model_version TEXT DEFAULT 'v1.0',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure new columns exist (if table already existed)
ALTER TABLE image_analyses ADD COLUMN IF NOT EXISTS hive_count INTEGER DEFAULT 0;
ALTER TABLE image_analyses ADD COLUMN IF NOT EXISTS pest_count INTEGER DEFAULT 0;

-- Update Check Constraint for analysis_type
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'image_analyses_analysis_type_check') THEN 
        ALTER TABLE image_analyses DROP CONSTRAINT image_analyses_analysis_type_check; 
    END IF; 
END $$;

ALTER TABLE image_analyses ADD CONSTRAINT image_analyses_analysis_type_check 
    CHECK (analysis_type IN ('full', 'detection_only', 'health_only', 'auto', 'apiary_count', 'frame_analysis', 'pest_scan'));

-- Add comments for documentation
COMMENT ON TABLE image_analyses IS 'Stores bee/hive image analysis results including detections, health scores, and disease indicators';
COMMENT ON COLUMN image_analyses.detections IS 'Array of bee detection objects with bounding boxes and health classifications';
COMMENT ON COLUMN image_analyses.disease_indicators IS 'Aggregated disease indicators with probabilities and severities';
COMMENT ON COLUMN image_analyses.recommendations IS 'Array of actionable recommendation strings based on analysis';

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_image_analyses_user_id ON image_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_image_analyses_hive_id ON image_analyses(hive_id);
CREATE INDEX IF NOT EXISTS idx_image_analyses_apiary_id ON image_analyses(apiary_id);
CREATE INDEX IF NOT EXISTS idx_image_analyses_created_at ON image_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_analyses_health_status ON image_analyses(health_status);
CREATE INDEX IF NOT EXISTS idx_image_analyses_user_created ON image_analyses(user_id, created_at DESC);

-- GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_image_analyses_detections ON image_analyses USING GIN (detections);
CREATE INDEX IF NOT EXISTS idx_image_analyses_disease_indicators ON image_analyses USING GIN (disease_indicators);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE image_analyses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own analyses
DROP POLICY IF EXISTS "image_analyses_select_own" ON image_analyses;
CREATE POLICY "image_analyses_select_own" ON image_analyses
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Policy: Users can insert their own analyses
DROP POLICY IF EXISTS "image_analyses_insert_own" ON image_analyses;
CREATE POLICY "image_analyses_insert_own" ON image_analyses
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own analyses
DROP POLICY IF EXISTS "image_analyses_update_own" ON image_analyses;
CREATE POLICY "image_analyses_update_own" ON image_analyses
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own analyses
DROP POLICY IF EXISTS "image_analyses_delete_own" ON image_analyses;
CREATE POLICY "image_analyses_delete_own" ON image_analyses
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Policy: Users can view analyses for shared apiaries
DROP POLICY IF EXISTS "image_analyses_select_shared" ON image_analyses;
CREATE POLICY "image_analyses_select_shared" ON image_analyses
    FOR SELECT TO authenticated
    USING (
        apiary_id IS NOT NULL AND
        apiary_id IN (
            SELECT apiary_id FROM apiary_shares 
            WHERE shared_with_user_id = auth.uid()
        )
    );

-- Policy: Admin/superadmin can view all analyses (conditional — table may not exist yet)
DO $$
BEGIN
    DROP POLICY IF EXISTS "image_analyses_admin_all" ON image_analyses;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        CREATE POLICY "image_analyses_admin_all" ON image_analyses
            FOR ALL TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM user_profiles
                    WHERE id = auth.uid()
                    AND role IN ('admin', 'superadmin')
                )
            );
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
        CREATE POLICY "image_analyses_admin_all" ON image_analyses
            FOR ALL TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE id = auth.uid()
                    AND role IN ('admin', 'superadmin')
                )
            );
    END IF;
END $$;

-- ============================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_image_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS image_analyses_updated_at_trigger ON image_analyses;
CREATE TRIGGER image_analyses_updated_at_trigger
    BEFORE UPDATE ON image_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_image_analyses_updated_at();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get analysis statistics for a user
CREATE OR REPLACE FUNCTION get_user_analysis_stats(p_user_id UUID)
RETURNS TABLE (
    total_analyses BIGINT,
    total_bees_detected BIGINT,
    avg_health_score DECIMAL,
    healthy_count BIGINT,
    warning_count BIGINT,
    critical_count BIGINT,
    latest_analysis_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_analyses,
        COALESCE(SUM(bee_count), 0)::BIGINT as total_bees_detected,
        COALESCE(AVG(health_score), 0)::DECIMAL as avg_health_score,
        COUNT(*) FILTER (WHERE health_status = 'Healthy')::BIGINT as healthy_count,
        COUNT(*) FILTER (WHERE health_status = 'Warning')::BIGINT as warning_count,
        COUNT(*) FILTER (WHERE health_status = 'Critical')::BIGINT as critical_count,
        MAX(created_at) as latest_analysis_date
    FROM image_analyses
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get health trends for a hive
CREATE OR REPLACE FUNCTION get_hive_health_trends(
    p_hive_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    analysis_date DATE,
    health_score INTEGER,
    bee_count INTEGER,
    health_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(created_at) as analysis_date,
        ia.health_score,
        ia.bee_count,
        ia.health_status
    FROM image_analyses ia
    WHERE ia.hive_id = p_hive_id
        AND ia.created_at >= NOW() - (p_days || ' days')::INTERVAL
    ORDER BY ia.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STORAGE BUCKET (Run via Supabase Dashboard)
-- ============================================
-- Note: Create the storage bucket manually in Supabase Dashboard:
-- Bucket Name: beeyield-images
-- Public: false (private bucket)
-- File Size Limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/heic

-- Storage policies (to be created in Supabase Dashboard):
-- 1. Allow authenticated users to upload to their folder
-- 2. Allow authenticated users to read their own files
-- 3. Allow authenticated users to delete their own files

-- ============================================
-- PERMISSIONS
-- ============================================
GRANT ALL ON image_analyses TO authenticated;
GRANT ALL ON image_analyses TO service_role;
GRANT EXECUTE ON FUNCTION get_user_analysis_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_hive_health_trends TO authenticated;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment below to insert sample data for testing

/*
INSERT INTO image_analyses (
    user_id,
    apiary_id,
    hive_id,
    original_image_path,
    bee_count,
    health_score,
    health_status,
    overall_confidence,
    detections,
    disease_indicators,
    recommendations,
    processing_time_ms
) VALUES (
    'YOUR_USER_ID_HERE',  -- Replace with actual user ID
    NULL,
    NULL,
    'https://example.com/sample.jpg',
    42,
    95,
    'Healthy',
    0.89,
    '[{"id": 1, "label": "Bee", "confidence": 0.95, "health": "Healthy", "bbox": {"x": 100, "y": 100, "width": 50, "height": 55}}]'::jsonb,
    '[]'::jsonb,
    '["Colony appears healthy with normal activity levels.", "Continue regular monitoring schedule."]'::jsonb,
    3250
);
*/

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
