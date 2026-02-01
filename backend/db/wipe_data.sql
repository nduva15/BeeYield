-- Wipe all BeeYield dashboard data
-- Order matters due to foreign keys

TRUNCATE TABLE inspections CASCADE;
TRUNCATE TABLE tasks CASCADE;
TRUNCATE TABLE processing_records CASCADE;
TRUNCATE TABLE harvests CASCADE;
TRUNCATE TABLE honey_batches CASCADE;
TRUNCATE TABLE packaged_batches CASCADE;
TRUNCATE TABLE batches CASCADE;
TRUNCATE TABLE hives CASCADE;
TRUNCATE TABLE apiaries CASCADE;
TRUNCATE TABLE farmers CASCADE;

-- Also clear company stats to reset them
UPDATE company_stats SET stat_value = '0' WHERE stat_key IN ('active_colonies', 'acres_pollinated', 'apiary_size');
