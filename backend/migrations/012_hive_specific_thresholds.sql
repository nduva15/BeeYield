-- ==========================================
-- BEE YIELD HIVE-SPECIFIC THRESHOLDS
-- ==========================================

ALTER TABLE public.hives 
ADD COLUMN IF NOT EXISTS temp_threshold_high DECIMAL,
ADD COLUMN IF NOT EXISTS temp_threshold_low DECIMAL,
ADD COLUMN IF NOT EXISTS weight_drop_threshold DECIMAL;

-- Note: These can be NULL, which means "use global default" 
-- from user_settings table.
