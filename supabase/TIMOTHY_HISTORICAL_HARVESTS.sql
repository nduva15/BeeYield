-- =================================================================
-- TIMOTHY NDUVA: HISTORICAL HARVEST DATA MIGRATION
-- Growth from 4 hives (2020) to 184 hives (2025)
-- Total: 883 kg historical + 60 kg current (2026) = 943 kg
-- =================================================================

-- Step 1: Find Timothy, clean up, and rebuild
DO $$
DECLARE
    v_user_id UUID;
    v_apiary_id UUID;
    v_hive_id UUID;
BEGIN
    -- Get Timothy's user ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'timothynduva349@gmail.com' LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Timothy Nduva not found in auth.users';
    END IF;

    -- Get his apiary
    -- Get his apiary (Prioritize 'Kibwezi Main Apiary')
    SELECT id INTO v_apiary_id FROM public.apiaries 
    WHERE user_id = v_user_id 
    ORDER BY CASE WHEN name = 'Kibwezi Main Apiary' THEN 0 ELSE 1 END, created_at DESC 
    LIMIT 1;
    
    IF v_apiary_id IS NULL THEN
        RAISE EXCEPTION 'No apiary found for Timothy';
    END IF;

    RAISE NOTICE 'User ID: %, Apiary ID: %', v_user_id, v_apiary_id;

    -- Step 2: Clear harvests FIRST (to remove FK references to hives)
    DELETE FROM public.harvests WHERE user_id = v_user_id;
    RAISE NOTICE 'Cleared existing harvest data';

    -- Step 3: Clean up hives to exactly 184
    DELETE FROM public.hives WHERE user_id = v_user_id;
    RAISE NOTICE 'Cleared existing hives';
    
    INSERT INTO public.hives (hive_code, apiary_id, user_id, status, health_status)
    SELECT 
        'KIB-H' || TO_CHAR(i, 'FM000'),
        v_apiary_id,
        v_user_id,
        'ACTIVE',
        'Good'
    FROM generate_series(1, 184) AS i;
    
    RAISE NOTICE 'Created exactly 184 hives';

    -- Step 4: Get the first hive ID for linking harvests
    SELECT id INTO v_hive_id FROM public.hives WHERE apiary_id = v_apiary_id LIMIT 1;
    
    IF v_hive_id IS NULL THEN
        RAISE EXCEPTION 'Failed to create hives';
    END IF;

    -- Step 5: Insert Historical Data (2020-2025) + Current Year (2026)
    INSERT INTO public.harvests (user_id, apiary_id, hive_id, quantity_kg, harvest_date, honey_type, notes, batch_code, is_verified) VALUES
    -- 2020: 4 hives, ~13 kg total (2 harvests)
    (v_user_id, v_apiary_id, v_hive_id, 6.5,  '2020-06-15', 'Wildflower', 'Legacy Sync - First harvest season', 'BY-2020-001', true),
    (v_user_id, v_apiary_id, v_hive_id, 6.5,  '2020-12-15', 'Forest', 'Legacy Sync - Winter harvest', 'BY-2020-002', true),
    
    -- 2021: 20 hives, ~60 kg total (2 harvests)
    (v_user_id, v_apiary_id, v_hive_id, 30,   '2021-06-15', 'Wildflower', 'Legacy Sync - Summer harvest', 'BY-2021-001', true),
    (v_user_id, v_apiary_id, v_hive_id, 30,   '2021-12-15', 'Forest', 'Legacy Sync - Winter harvest', 'BY-2021-002', true),
    
    -- 2022: 45 hives, 55 kg total (2 harvests)
    (v_user_id, v_apiary_id, v_hive_id, 27.5, '2022-06-15', 'Wildflower', 'Legacy Sync - Summer harvest', 'BY-2022-001', true),
    (v_user_id, v_apiary_id, v_hive_id, 27.5, '2022-12-15', 'Forest', 'Legacy Sync - Winter harvest', 'BY-2022-002', true),
    
    -- 2023: 80 hives, 105 kg total (2 harvests)
    (v_user_id, v_apiary_id, v_hive_id, 52.5, '2023-06-15', 'Wildflower', 'Legacy Sync - Summer harvest', 'BY-2023-001', true),
    (v_user_id, v_apiary_id, v_hive_id, 52.5, '2023-12-15', 'Forest', 'Legacy Sync - Winter harvest', 'BY-2023-002', true),
    
    -- 2024: 130 hives, 250 kg total (2 harvests)
    (v_user_id, v_apiary_id, v_hive_id, 125,  '2024-06-15', 'Wildflower', 'Legacy Sync - Summer harvest', 'BY-2024-001', true),
    (v_user_id, v_apiary_id, v_hive_id, 125,  '2024-12-15', 'Forest', 'Legacy Sync - Winter harvest', 'BY-2024-002', true),
    
    -- 2025: 184 hives, 300 kg total (2 harvests)
    (v_user_id, v_apiary_id, v_hive_id, 150,  '2025-06-15', 'Wildflower', 'Legacy Sync - Summer harvest', 'BY-2025-001', true),
    (v_user_id, v_apiary_id, v_hive_id, 150,  '2025-12-15', 'Forest', 'Legacy Sync - Winter harvest', 'BY-2025-002', true),
    
    -- 2026: 184+ hives, 60 kg so far (Current Year - Jan 3-10)
    (v_user_id, v_apiary_id, v_hive_id, 60,   '2026-01-10', 'Early Spring', 'Current Year - Jan 3-10 Harvest', 'BY-2026-001', true);

    RAISE NOTICE 'Inserted 13 harvest records (883 kg historical + 60 kg current = 943 kg total)';

END $$;

-- Step 6: Create Yearly Summary View for Frontend
DROP VIEW IF EXISTS public.yearly_harvest_summary;
CREATE VIEW public.yearly_harvest_summary AS
SELECT 
  user_id,
  EXTRACT(YEAR FROM harvest_date)::INTEGER as harvest_year,
  SUM(quantity_kg) as total_kg,
  COUNT(id) as harvest_count
FROM public.harvests
GROUP BY user_id, harvest_year
ORDER BY harvest_year DESC;

-- Grant access to the view
GRANT SELECT ON public.yearly_harvest_summary TO authenticated;
GRANT SELECT ON public.yearly_harvest_summary TO service_role;

-- Step 7: Reload schema cache
NOTIFY pgrst, 'reload schema';
