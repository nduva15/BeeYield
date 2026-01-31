-- ============================================================================
-- FIX: Schema Updates (Ensure columns exist for triggers)
-- ============================================================================
-- This script adds the missing 'updated_at' columns to tables that have 
-- the 'update_modified_column' trigger but lack the column.

ALTER TABLE IF EXISTS farmers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());
ALTER TABLE IF EXISTS apiaries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());
ALTER TABLE IF EXISTS hives ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());
ALTER TABLE IF EXISTS harvests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());
ALTER TABLE IF EXISTS processing_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());
ALTER TABLE IF EXISTS honey_batches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());
ALTER TABLE IF EXISTS batches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());

DO $$
BEGIN
    RAISE NOTICE 'Schema fixed: updated_at columns added where missing.';
END $$;
