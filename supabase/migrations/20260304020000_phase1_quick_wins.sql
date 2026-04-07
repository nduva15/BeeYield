-- F5: Real-Time Activity Feed

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'harvest_logged', 'inspection_completed', 'alert_triggered'
    entity_type TEXT, -- 'hive', 'apiary', 'device'
    entity_id UUID,
    title TEXT NOT NULL,
    subtitle TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Note: user_id index using ON activity_logs (user_id, created_at DESC)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_activity_logs_user') THEN
        CREATE INDEX idx_activity_logs_user ON activity_logs (user_id, created_at DESC);
    END IF;
END $$;


-- F6: Chat History Persistence (Smart Assistant)

CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]',
    suggestions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);


-- F7: Sensor Health Diagnostics

CREATE TABLE IF NOT EXISTS sensor_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    hive_id UUID REFERENCES hives(id) ON DELETE CASCADE,
    apiary_id UUID REFERENCES apiaries(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- 'temperature', 'humidity', 'weight', 'acoustic'
    severity TEXT NOT NULL, -- 'info', 'warning', 'critical'
    message TEXT NOT NULL,
    reading_value NUMERIC,
    threshold_value NUMERIC,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- F4: Task Automation & Recurrence
-- Adding missing columns to tasks table

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_days INTEGER DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS series_id UUID DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS next_occurrence DATE DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS has_spawned_next BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_status TEXT DEFAULT 'active'; -- 'active', 'paused', 'stopped'

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_recurring') THEN
        CREATE INDEX idx_tasks_recurring ON tasks (is_recurring, is_completed) WHERE is_recurring = true;
    END IF;
END $$;


-- RLS Policies
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own activity_logs" ON activity_logs;
CREATE POLICY "Users can read own activity_logs" ON activity_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activity_logs" ON activity_logs;
CREATE POLICY "Users can insert own activity_logs" ON activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own chat_sessions" ON chat_sessions;
CREATE POLICY "Users can read own chat_sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can inset own chat_sessions" ON chat_sessions;
CREATE POLICY "Users can inset own chat_sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own chat_sessions" ON chat_sessions;
CREATE POLICY "Users can update own chat_sessions" ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own chat_sessions" ON chat_sessions;
CREATE POLICY "Users can delete own chat_sessions" ON chat_sessions FOR DELETE USING (auth.uid() = user_id);


DROP POLICY IF EXISTS "Users can read own chat_messages" ON chat_messages;
CREATE POLICY "Users can read own chat_messages" ON chat_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = session_id AND chat_sessions.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can insert own chat_messages" ON chat_messages;
CREATE POLICY "Users can insert own chat_messages" ON chat_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = session_id AND chat_sessions.user_id = auth.uid())
);


DROP POLICY IF EXISTS "Users can read own sensor_alerts" ON sensor_alerts;
CREATE POLICY "Users can read own sensor_alerts" ON sensor_alerts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sensor_alerts" ON sensor_alerts;
CREATE POLICY "Users can insert own sensor_alerts" ON sensor_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sensor_alerts" ON sensor_alerts;
CREATE POLICY "Users can update own sensor_alerts" ON sensor_alerts FOR UPDATE USING (auth.uid() = user_id);

