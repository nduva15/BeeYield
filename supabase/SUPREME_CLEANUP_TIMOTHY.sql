-- =================================================================
-- SUPREME CLEANUP: Timothy Nduva Data Consolidation
-- 1. Identify Timothy Nduva (timothynduva349@gmail.com)
-- 2. Consolidate ALL data into 'Kibwezi Main Apiary'
-- 3. Delete 'MARKEMPAI' and ALL other apiaries/hives
-- 4. Ensure privacy (only Timothy sees this)
-- =================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_correct_apiary_id UUID;
    v_apiary_count INTEGER;
BEGIN
    -- 1. Get Timothy's User ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'timothynduva349@gmail.com' LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User timothynduva349@gmail.com not found. Cleanup aborted.';
    END IF;

    RAISE NOTICE 'Found user ID for Timothy: %', v_user_id;

    -- 2. Identify the ONE AND ONLY Apiary to keep
    -- We look for 'Kibwezi Main Apiary' specifically.
    SELECT id INTO v_correct_apiary_id 
    FROM public.apiaries 
    WHERE user_id = v_user_id 
    AND (name ILIKE 'Kibwezi Main Apiary' OR name ILIKE 'Kibwezi%')
    ORDER BY (name ILIKE 'Kibwezi Main Apiary') DESC, created_at ASC
    LIMIT 1;

    -- If not found by name, just take the first one ever created but we REALLY want Kibwezi
    IF v_correct_apiary_id IS NULL THEN
        RAISE EXCEPTION 'Could not find "Kibwezi Main Apiary" for Timothy. Cleanup aborted to prevent data loss.';
    END IF;

    RAISE NOTICE 'Keeping Apiary: %, ID: %', 'Kibwezi Main Apiary', v_correct_apiary_id;

    -- 3. Cleanup related data that might be linked to WRONG apiaries
    -- Before deleting apiaries, let's see if we need to move anything or just wipe it.
    -- The user says "DELETE ANY OTHER APIARY AND HIVES COMPLETELY", so we wipe.
    
    -- Cleanup Note Attachments linked via Notes
    DELETE FROM public.note_attachments 
    WHERE note_id IN (
        SELECT id FROM public.notes 
        WHERE user_id = v_user_id 
        AND apiary_id != v_correct_apiary_id
    );

    -- Cleanup Notes
    DELETE FROM public.notes 
    WHERE user_id = v_user_id 
    AND apiary_id != v_correct_apiary_id;

    -- Cleanup Tasks
    DELETE FROM public.tasks 
    WHERE user_id = v_user_id 
    AND apiary_id != v_correct_apiary_id;

    -- Cleanup Harvests (If they aren't on Kibwezi, wipe them per request)
    DELETE FROM public.harvests 
    WHERE user_id = v_user_id 
    AND apiary_id != v_correct_apiary_id;

    -- Cleanup Hives (If they aren't on Kibwezi, wipe them)
    DELETE FROM public.hives 
    WHERE user_id = v_user_id 
    AND apiary_id != v_correct_apiary_id;

    -- 4. Delete all OTHER apiaries (including 'MARKEMPAI')
    DELETE FROM public.apiaries 
    WHERE user_id = v_user_id 
    AND id != v_correct_apiary_id;

    GET DIAGNOSTICS v_apiary_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % other apiaries (including MARKEMPAI if it existed)', v_apiary_count;

    -- 5. Ensure Privacy Verification
    -- (The RLS policies already handle this, but let's confirm them)
    -- We don't need to change RLS here, just acknowledging the requirement.

    -- Final Check: How many apiaries left?
    SELECT count(*) INTO v_apiary_count FROM public.apiaries WHERE user_id = v_user_id;
    RAISE NOTICE 'Done. Timothy now has % apiary: Kibwezi Main Apiary', v_apiary_count;

END $$;

-- Reload schema cache just in case
NOTIFY pgrst, 'reload schema';
