-- ==========================================
-- BEE YIELD HIVES: TASK RECURRENCE & ENHANCEMENTS
-- Aligning with PRD: My Tasks & Scheduler
-- ==========================================

-- 1. Create Enums for Type and Priority
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_type') THEN
        CREATE TYPE task_type AS ENUM ('Inspection', 'Feeding', 'Harvest', 'Treatment', 'Other');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High');
    END IF;
END$$;

-- 2. Enhance Tasks Table
-- Add 'type' and 'completed_at' columns if they don't exist
ALTER TABLE public.tasks 
    ADD COLUMN IF NOT EXISTS type task_type DEFAULT 'Other',
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Convert existing columns to use the new Enums
-- Drop default first to avoid casting error
ALTER TABLE public.tasks ALTER COLUMN priority DROP DEFAULT;

-- Handle existing text values by mapping them to Enum labels
ALTER TABLE public.tasks 
    ALTER COLUMN priority TYPE task_priority USING (
        CASE 
            WHEN priority::text ILIKE 'high' THEN 'High'::task_priority
            WHEN priority::text ILIKE 'low' THEN 'Low'::task_priority
            ELSE 'Medium'::task_priority
        END
    );

-- Re-apply default with the new Enum type
ALTER TABLE public.tasks ALTER COLUMN priority SET DEFAULT 'Medium'::task_priority;

ALTER TABLE public.tasks 
    ALTER COLUMN due_date TYPE TIMESTAMP WITH TIME ZONE USING (due_date::TIMESTAMP WITH TIME ZONE);

-- 3. Recurring Task Logic: Postgres Function
-- This function handles the automatic creation of next tasks when a recurring task is completed.
CREATE OR REPLACE FUNCTION handle_recurring_tasks_v2()
RETURNS TRIGGER AS $$
DECLARE
    next_due_date TIMESTAMP WITH TIME ZONE;
    recurrence_days INTEGER;
    recurrence_json JSONB;
BEGIN
    -- Only trigger logic when is_completed changes from FALSE to TRUE
    IF (NEW.is_completed = TRUE AND (OLD.is_completed = FALSE OR OLD.is_completed IS NULL)) THEN
        NEW.completed_at = NOW();
        NEW.status = 'completed';

        -- Check if it's a recurring task
        -- Expecting recurrence to be a JSON string like '{"days": 7}' or a number string
        IF NEW.recurrence IS NOT NULL AND NEW.recurrence != 'None' AND NEW.recurrence != '' THEN
            BEGIN
                -- Attempt to parse as JSON
                recurrence_json := NEW.recurrence::jsonb;
                recurrence_days := (recurrence_json->>'days')::integer;
            EXCEPTION WHEN OTHERS THEN
                -- Fallback: Check if it's just a number
                IF NEW.recurrence ~ '^[0-9]+$' THEN
                    recurrence_days := NEW.recurrence::integer;
                ELSE
                    -- Unknown format, just log and continue
                    RETURN NEW;
                END IF;
            END;

            -- If we have a valid day count, schedule the next occurrence
            IF recurrence_days IS NOT NULL AND recurrence_days > 0 THEN
                -- Calculate next due date relative to the current due date (to maintain cycle)
                next_due_date := NEW.due_date + (recurrence_days || ' days')::interval;

                -- Insert the new task entry
                INSERT INTO public.tasks (
                    user_id,
                    apiary_id,
                    hive_id,
                    type,
                    title,
                    description,
                    due_date,
                    priority,
                    recurrence,
                    status,
                    is_completed
                ) VALUES (
                    NEW.user_id,
                    NEW.apiary_id,
                    NEW.hive_id,
                    NEW.type,
                    NEW.title,
                    NEW.description,
                    next_due_date,
                    NEW.priority,
                    NEW.recurrence,
                    'pending',
                    FALSE
                );
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Trigger
-- Trigger runs BEFORE update to allow modifying NEW record (completed_at, status)
DROP TRIGGER IF EXISTS trigger_handle_recurring_tasks_v2 ON public.tasks;
CREATE TRIGGER trigger_handle_recurring_tasks_v2
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION handle_recurring_tasks_v2();

-- 5. Enable RLS (Ensure security is active)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users see own tasks
DROP POLICY IF EXISTS "Users view own tasks" ON public.tasks;
CREATE POLICY "Users view own tasks" ON public.tasks
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users create own tasks
DROP POLICY IF EXISTS "Users insert own tasks" ON public.tasks;
CREATE POLICY "Users insert own tasks" ON public.tasks
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users update own tasks
DROP POLICY IF EXISTS "Users update own tasks" ON public.tasks;
CREATE POLICY "Users update own tasks" ON public.tasks
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);
