-- ==========================================
-- BEE YIELD SETTINGS TABLES
-- User Preferences and Notification Configs
-- ==========================================

-- 1. USER SETTINGS
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'en',
    unit_system VARCHAR(20) DEFAULT 'Metric', -- 'Metric' or 'Imperial'
    theme VARCHAR(20) DEFAULT 'System', -- 'Light', 'Dark', or 'System'
    timezone VARCHAR(100) DEFAULT 'UTC',
    temp_threshold_high DECIMAL DEFAULT 38.0,
    temp_threshold_low DECIMAL DEFAULT 32.0,
    weight_drop_threshold DECIMAL DEFAULT 2.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. NOTIFICATION CONFIGS
CREATE TABLE IF NOT EXISTS public.notification_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'swarm_alert', 'low_battery', 'weight_loss', 'temp_surge'
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_type)
);

-- ==========================================
-- SECURITY: ENABLE RLS
-- ==========================================
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_configs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- SECURITY: POLICIES
-- ==========================================

DO $$
BEGIN
    -- User Settings Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own settings') THEN
        CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own settings') THEN
        CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own settings') THEN
        CREATE POLICY "Users can insert their own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Notification Configs Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own notification configs') THEN
        CREATE POLICY "Users can view their own notification configs" ON public.notification_configs FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own notification configs') THEN
        CREATE POLICY "Users can update their own notification configs" ON public.notification_configs FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own notification configs') THEN
        CREATE POLICY "Users can insert their own notification configs" ON public.notification_configs FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_configs_updated_at
    BEFORE UPDATE ON public.notification_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
