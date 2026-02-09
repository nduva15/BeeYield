-- Migration to create missing tables required by Backend API

-- 1. APIARY SHARES
-- Manages sharing of apiaries between users
CREATE TABLE IF NOT EXISTS public.apiary_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE NOT NULL,
    shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    permission VARCHAR(50) DEFAULT 'view', -- 'view', 'edit'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(apiary_id, shared_with_user_id)
);

-- Enable RLS for apiary_shares
ALTER TABLE public.apiary_shares ENABLE ROW LEVEL SECURITY;

-- Policies for apiary_shares
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Apiary owners can manage shares') THEN
        CREATE POLICY "Apiary owners can manage shares" ON public.apiary_shares
            USING (EXISTS (
                SELECT 1 FROM public.apiaries 
                WHERE id = apiary_shares.apiary_id 
                AND user_id = auth.uid()
            ));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view shares aimed at them') THEN
        CREATE POLICY "Users can view shares aimed at them" ON public.apiary_shares
            FOR SELECT USING (auth.uid() = shared_with_user_id);
    END IF;
END
$$;

-- 2. USER SETTINGS
-- Dedicated table for user preferences (splitting from profiles JSONB for better typing/indexing)
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    language VARCHAR(10) DEFAULT 'en',
    unit_system VARCHAR(20) DEFAULT 'Metric', -- 'Metric', 'Imperial'
    theme VARCHAR(20) DEFAULT 'System',       -- 'System', 'Light', 'Dark'
    timezone VARCHAR(50) DEFAULT 'UTC',
    temp_threshold_high DECIMAL(5, 2) DEFAULT 38.0,
    temp_threshold_low DECIMAL(5, 2) DEFAULT 32.0,
    weight_drop_threshold DECIMAL(5, 2) DEFAULT 2.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policies for user_settings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own settings') THEN
        CREATE POLICY "Users can manage their own settings" ON public.user_settings
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;


-- 3. NOTIFICATION CONFIGS
-- granular control over notification types per user
CREATE TABLE IF NOT EXISTS public.notification_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'swarm_alert', 'low_battery', etc.
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, event_type)
);

-- Enable RLS for notification_configs
ALTER TABLE public.notification_configs ENABLE ROW LEVEL SECURITY;

-- Policies for notification_configs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own notifications') THEN
        CREATE POLICY "Users can manage their own notifications" ON public.notification_configs
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- 4. ADD TRIGGERS FOR UPDATED_AT
-- Re-use existing update_updated_at_column function if it exists, otherwise create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name IN ('apiary_shares', 'user_settings', 'notification_configs')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()', t, t);
    END LOOP;
END;
$$;


-- 5. HUB DEVICES (Hardware Bridge)
-- Links physical hardware to digital apiaries
CREATE TABLE IF NOT EXISTS public.hub_devices (
    serial_number TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    nickname TEXT,
    assigned_apiary_id UUID REFERENCES public.apiaries(id),
    assigned_pollination_id UUID,
    firmware_version TEXT DEFAULT '1.0.0',
    battery_level INTEGER,
    last_connected_at TIMESTAMP WITH TIME ZONE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    config_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for hub_devices
ALTER TABLE public.hub_devices ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users view own hubs') THEN
        CREATE POLICY "Users view own hubs" ON public.hub_devices 
        FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

-- 6. SYNC SESSIONS (Audit Trail)
-- Tracks USB data sync events
CREATE TABLE IF NOT EXISTS public.sync_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hub_sn TEXT REFERENCES public.hub_devices(serial_number),
    user_id UUID REFERENCES auth.users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    records_processed INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    duration_sec INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for sync_sessions
ALTER TABLE public.sync_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users view own sync logs') THEN
        CREATE POLICY "Users view own sync logs" ON public.sync_sessions 
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
END
$$;
