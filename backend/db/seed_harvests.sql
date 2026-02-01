-- Seed harvests data for BeeYield dashboard
-- This script adds missing columns and creates realistic harvest records

-- Ensure schema is correct first
DO $$ 
BEGIN 
    -- Add missing columns to harvests table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='user_id') THEN
        ALTER TABLE harvests ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='batch_code') THEN
        ALTER TABLE harvests ADD COLUMN batch_code TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='honey_type') THEN
        ALTER TABLE harvests ADD COLUMN honey_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='color_grade') THEN
        ALTER TABLE harvests ADD COLUMN color_grade TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='harvests' AND column_name='is_verified') THEN
        ALTER TABLE harvests ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
END $$;

DO $$
DECLARE
    v_hive RECORD;
    v_harvest_date DATE;
    v_quantity DECIMAL;
    v_left_for_bees DECIMAL;
    v_honey_types TEXT[] := ARRAY['Multifloral', 'Acacia', 'Sunflower', 'Lavender', 'Wildflower', 'Clover'];
    v_extraction_methods TEXT[] := ARRAY['Cold extraction', 'Centrifugal', 'Crush and strain'];
    v_color_grades TEXT[] := ARRAY['Extra Light Amber', 'Light Amber', 'Amber', 'Dark Amber'];
    v_batch_counter INT := 1;
BEGIN
    -- Check if harvests already exist
    IF EXISTS (SELECT 1 FROM harvests LIMIT 1) THEN
        RAISE NOTICE 'Harvests already exist. Skipping seeding.';
        RETURN;
    END IF;

    RAISE NOTICE 'Seeding harvests data...';

    -- Loop through hives and create 1-3 harvests per hive
    FOR v_hive IN 
        SELECT id, farmer_id, user_id, apiary_id 
        FROM hives 
        LIMIT 50
    LOOP
        -- Create 1-3 harvests per hive
        FOR i IN 1..FLOOR(RANDOM() * 3 + 1)::INT LOOP
            -- Random date in the past year
            v_harvest_date := CURRENT_DATE - (RANDOM() * 365)::INT;
            
            -- Random quantities
            v_quantity := ROUND((RANDOM() * 22 + 8)::NUMERIC, 1); -- 8-30 kg
            v_left_for_bees := ROUND((RANDOM() * 2.5 + 1.5)::NUMERIC, 1); -- 1.5-4 kg
            
            INSERT INTO harvests (
                hive_id,
                farmer_id,
                user_id,
                harvest_date,
                quantity_kg,
                quantity_left_for_bees_kg,
                extraction_method,
                nectar_source,
                weather_conditions,
                moisture_content_percent,
                batch_code,
                honey_type,
                color_grade,
                is_verified
            ) VALUES (
                v_hive.id,
                v_hive.farmer_id,
                v_hive.user_id,
                v_harvest_date,
                v_quantity,
                v_left_for_bees,
                v_extraction_methods[FLOOR(RANDOM() * 3 + 1)::INT],
                v_honey_types[FLOOR(RANDOM() * 6 + 1)::INT],
                CASE FLOOR(RANDOM() * 3)::INT
                    WHEN 0 THEN 'Sunny'
                    WHEN 1 THEN 'Partly cloudy'
                    ELSE 'Clear'
                END,
                ROUND((RANDOM() * 3 + 16)::NUMERIC, 1), -- 16-19%
                'BH-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(v_batch_counter::TEXT, 4, '0'),
                v_honey_types[FLOOR(RANDOM() * 6 + 1)::INT],
                v_color_grades[FLOOR(RANDOM() * 4 + 1)::INT],
                RANDOM() > 0.25 -- 75% verified
            );
            
            v_batch_counter := v_batch_counter + 1;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Successfully seeded % harvests!', v_batch_counter - 1;
END $$;

-- Verify the seeding
SELECT COUNT(*) as total_harvests FROM harvests;
SELECT 
    COUNT(*) as count,
    honey_type,
    is_verified
FROM harvests
GROUP BY honey_type, is_verified
ORDER BY honey_type, is_verified;
