-- Add threshold columns to hives table for per-hive overrides
ALTER TABLE hives
ADD COLUMN IF NOT EXISTS temp_threshold_high numeric,
ADD COLUMN IF NOT EXISTS temp_threshold_low numeric,
ADD COLUMN IF NOT EXISTS weight_drop_threshold numeric;
