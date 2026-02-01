-- Add size_acres column to apiaries table for accurate coverage calculation
ALTER TABLE apiaries ADD COLUMN IF NOT EXISTS size_acres DECIMAL(10, 2) DEFAULT 0;
