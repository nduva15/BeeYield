-- Run this in Supabase SQL Editor to create the missing tables

-- 1. Farmers Table (Critical for Dashboard)
CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    id_number TEXT,
    experience_years INTEGER DEFAULT 0,
    story TEXT,
    latitude FLOAT,
    longitude FLOAT,
    location_name TEXT,
    region TEXT,
    county TEXT,
    ward TEXT,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    certification_status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable RLS (Optional, but good practice. For now we leave policies open or basic)
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for dashboard fetch)
CREATE POLICY "Public Read Farmers" ON farmers FOR SELECT USING (true);

-- Allow authenticated insert/update (for admin dashboard/scripts)
CREATE POLICY "Auth Insert Farmers" ON farmers FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Update Farmers" ON farmers FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Delete Farmers" ON farmers FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');


-- 2. Ensure Batches table has necessary columns (if using legacy 'batches' table)
-- Note: 001_create_tables.sql created 'batches'. We might want 'honey_batches' if adminService prefers it.
-- Let's stick to 'batches' for now as it's in the main migration.
-- But if we need 'honey_batches', let's alias or create it.

CREATE TABLE IF NOT EXISTS honey_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_code TEXT UNIQUE NOT NULL,
    honey_type TEXT,
    quantity_kg DECIMAL(10,2),
    processing_method TEXT,
    harvest_date DATE,
    packaged_date DATE,
    farmer_name TEXT,
    farmer_phone TEXT,
    beekeeper_name TEXT,
    beekeeper_id TEXT,
    apiary_name TEXT,
    location_county TEXT,
    location_region TEXT,
    latitude FLOAT,
    longitude FLOAT,
    quality_grade TEXT,
    moisture_content DECIMAL(5,2),
    color_grade TEXT,
    blockchain_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE honey_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Honey Batches" ON honey_batches FOR SELECT USING (true);
CREATE POLICY "Auth All Honey Batches" ON honey_batches FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
