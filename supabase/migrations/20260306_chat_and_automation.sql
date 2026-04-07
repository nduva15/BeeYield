-- =============================================================================
-- BeeYield: Chat History Persistence + Automation Logs
-- Migration: 2026-03-06
-- =============================================================================

-- ========== CHAT SESSIONS ==========
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

-- RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat sessions"
    ON chat_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions"
    ON chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
    ON chat_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_chat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_sessions SET updated_at = now() WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========== CHAT MESSAGES ==========
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]'::jsonb,
    suggestions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(session_id, created_at ASC);

-- RLS (messages inherit access from session ownership)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own sessions"
    ON chat_messages FOR SELECT
    USING (
        session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert messages in own sessions"
    ON chat_messages FOR INSERT
    WITH CHECK (
        session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete messages in own sessions"
    ON chat_messages FOR DELETE
    USING (
        session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
    );

-- Trigger: update session timestamp when new message is inserted
CREATE TRIGGER trg_update_session_on_message
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_session_timestamp();


-- ========== AUTOMATION LOGS (Task Recurrence Worker) ==========
CREATE TABLE IF NOT EXISTS automation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_logs_task_id ON automation_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created_at ON automation_logs(created_at DESC);

-- RLS: automation logs are system-level, backend uses service role
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read automation logs related to their tasks
CREATE POLICY "Users can view own automation logs"
    ON automation_logs FOR SELECT
    USING (
        task_id IN (SELECT id FROM tasks WHERE user_id = auth.uid())
    );

-- Service role can insert (backend worker)
CREATE POLICY "Service role can insert automation logs"
    ON automation_logs FOR INSERT
    WITH CHECK (true);


-- ========== TASK RECURRENCE COLUMNS ==========
-- Ensure the tasks table has the columns needed by the Chrono Worker
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'is_recurring') THEN
        ALTER TABLE tasks ADD COLUMN is_recurring BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'recurrence_days') THEN
        ALTER TABLE tasks ADD COLUMN recurrence_days INTEGER DEFAULT 7;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'has_spawned_next') THEN
        ALTER TABLE tasks ADD COLUMN has_spawned_next BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'recurrence_status') THEN
        ALTER TABLE tasks ADD COLUMN recurrence_status TEXT DEFAULT 'inactive';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'parent_task_id') THEN
        ALTER TABLE tasks ADD COLUMN parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completed_at') THEN
        ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMPTZ;
    END IF;
END $$;

-- Index for the worker's query pattern
CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_query
    ON tasks(status, is_recurring, has_spawned_next, recurrence_status)
    WHERE is_recurring = true AND has_spawned_next = false;

-- Trigger: auto-set completed_at when status changes to 'completed'
CREATE OR REPLACE FUNCTION set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        NEW.completed_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_completed_at ON tasks;
CREATE TRIGGER trg_set_completed_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_task_completed_at();
