-- Add missing columns to harvests table
ALTER TABLE harvests ADD COLUMN IF NOT EXISTS harvester_name TEXT;
