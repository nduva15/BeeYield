-- Ensure user_id column exists on all public tables before creating user-scoped RLS policies
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('farmers', 'apiaries', 'hives', 'inspections', 'tasks', 'harvests')
    LOOP
        -- 1. Safely add user_id column if it doesn't already exist on this table
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = tbl 
              AND column_name = 'user_id'
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE', tbl);
        END IF;

        -- 2. Ensure RLS is active
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

        -- 3. Drop existing user policies to prevent duplication
        EXECUTE format('DROP POLICY IF EXISTS "Users can view own %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can update own %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %I" ON public.%I', tbl, tbl);

        -- 4. Create user-scoped RLS policies (handles user_id or legacy rows where user_id IS NULL)
        EXECUTE format('CREATE POLICY "Users can view own %I" ON public.%I FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL)', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can insert own %I" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL)', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can update own %I" ON public.%I FOR UPDATE USING (auth.uid() = user_id)', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can delete own %I" ON public.%I FOR DELETE USING (auth.uid() = user_id)', tbl, tbl);
    END LOOP;
END;
$$;
