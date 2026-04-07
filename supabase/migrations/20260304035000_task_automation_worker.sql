-- ==========================================
-- BEE YIELD HIVES: TASK AUTOMATION & RECURRENCE WORKER
-- Aligning with PRD: Task Automation & Recurrence Worker
-- ==========================================

-- 1. Create Enums for Recurrence Status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recurrence_status_type') THEN
        CREATE TYPE recurrence_status_type AS ENUM ('active', 'paused', 'stopped');
    END IF;
END$$;

-- 2. Enhance Tasks Table for the Worker
ALTER TABLE public.tasks 
    ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS recurrence_days INTEGER,
    ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS has_spawned_next BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS recurrence_status recurrence_status_type DEFAULT 'active';

-- Support migration from old 'recurrence' string column to new fields
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='recurrence') THEN
        EXECUTE 'UPDATE public.tasks 
        SET 
            is_recurring = TRUE, 
            recurrence_days = CASE 
                WHEN recurrence ~ ''^[0-9]+$'' THEN recurrence::integer 
                WHEN recurrence ILIKE ''%{"days":%'' THEN (recurrence::jsonb->>''days'')::integer
                ELSE NULL 
            END
        WHERE recurrence IS NOT NULL AND recurrence != ''None'' AND recurrence != '''' AND recurrence_days IS NULL';
    END IF;
END $$;

-- 3. Create Automation Logs Table
CREATE TABLE IF NOT EXISTS public.automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own automation logs" ON public.automation_logs;
CREATE POLICY "Users view own automation logs" ON public.automation_logs
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.tasks t 
        WHERE t.id = automation_logs.task_id AND t.user_id = auth.uid()
    )
);

-- Note: Since the PRD requests a backend Chrono-Worker (Python/Edge function)
-- to handle recurrence calculation, we will drop the old DB trigger to avoid duplication.
DROP TRIGGER IF EXISTS trigger_handle_recurring_tasks_v2 ON public.tasks;
DROP FUNCTION IF EXISTS handle_recurring_tasks_v2();
