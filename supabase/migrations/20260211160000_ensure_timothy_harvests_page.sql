
-- Migration to ensure Timothy Nduva's data is fully populated and visible on all pages (including harvests)
-- Targets: timothynduva349@gmail.com

BEGIN;

DO $$
DECLARE
    v_user_id UUID;
    v_farmer_id UUID;
    v_apiary_id UUID;
    v_email TEXT := 'timothynduva349@gmail.com';
    v_total_harvest NUMERIC;
    v_adjustment NUMERIC;
BEGIN
    -- 1. Get User ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User % not found. Skipping.', v_email;
        RETURN;
    END IF;

    -- 2. Ensure Farmer Profile exists
    SELECT id INTO v_farmer_id FROM public.farmers WHERE user_id = v_user_id LIMIT 1;
    
    IF v_farmer_id IS NULL THEN
        INSERT INTO public.farmers (user_id, name, experience_years, story, location_name, certification_status, total_hives, registration_date)
        VALUES (v_user_id, 'Timothy Nduva', 8, 'A dedicated bee-keeper from Kibwezi, focusing on premium acacia honey.', 'Kibwezi', 'Certified Organic', 184, '2020-01-01')
        RETURNING id INTO v_farmer_id;
        RAISE NOTICE 'Created farmer record for Timothy.';
    END IF;

    -- 3. Update Profile metadata
    UPDATE public.profiles 
    SET 
        full_name = 'Timothy Nduva',
        first_name = 'Timothy',
        last_name = 'Nduva',
        email = v_email,
        role = 'farmer'
    WHERE id = v_user_id;

    -- 4. Link Apiaries to Farmer
    UPDATE public.apiaries SET farmer_id = v_farmer_id WHERE user_id = v_user_id;

    -- 5. Link Harvests to Farmer
    UPDATE public.harvests SET farmer_id = v_farmer_id WHERE user_id = v_user_id;

    -- 6. Adjust Harvest Total to exactly 943.0 kg
    SELECT SUM(quantity_kg) INTO v_total_harvest FROM public.harvests WHERE user_id = v_user_id;
    
    IF v_total_harvest IS NOT NULL AND v_total_harvest != 943.0 THEN
        v_adjustment := 943.0 - v_total_harvest;
        -- Add adjustment to the latest harvest
        UPDATE public.harvests 
        SET quantity_kg = quantity_kg + v_adjustment
        WHERE id = (SELECT id FROM public.harvests WHERE user_id = v_user_id ORDER BY harvest_date DESC LIMIT 1);
        RAISE NOTICE 'Adjusted Timothy harvest to exactly 943.0kg (Adjustment: %)', v_adjustment;
    END IF;

END $$;

COMMIT;
