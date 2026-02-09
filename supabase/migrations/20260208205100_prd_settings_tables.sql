-- Migration to create the new Settings tables and update Hives/Apiaries based on PRD
-- 1. USER NOTIFICATION SETTINGS
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email_alerts_enabled BOOLEAN DEFAULT TRUE,  -- Master Switch
    sms_alerts_enabled BOOLEAN DEFAULT FALSE,   -- Premium Feature
    push_notifications_enabled BOOLEAN DEFAULT TRUE,
    
    -- Granular Controls (Event Types)
    notify_on_swarm BOOLEAN DEFAULT TRUE,
    notify_on_low_battery BOOLEAN DEFAULT TRUE,
    notify_on_theft BOOLEAN DEFAULT TRUE,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_notification_settings
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Policies for user_notification_settings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own notification settings') THEN
        CREATE POLICY "Users can manage their own notification settings" ON public.user_notification_settings
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- 2. GLOBAL IOT SETTINGS
CREATE TABLE IF NOT EXISTS public.global_iot_settings (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- Temperature (Celsius)
    temp_min_threshold DECIMAL DEFAULT 15.0,
    temp_max_threshold DECIMAL DEFAULT 38.0,
    
    -- Weight (Kg)
    weight_drop_alert_kg DECIMAL DEFAULT 2.0, -- Sudden drop triggers theft/swarm alert
    
    -- Humidity (%)
    humidity_min_threshold INTEGER DEFAULT 40,
    humidity_max_threshold INTEGER DEFAULT 80,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for global_iot_settings
ALTER TABLE public.global_iot_settings ENABLE ROW LEVEL SECURITY;

-- Policies for global_iot_settings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own global iot settings') THEN
        CREATE POLICY "Users can manage their own global iot settings" ON public.global_iot_settings
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- 3. Extend Apiaries Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apiaries' AND column_name='forage_type') THEN
        ALTER TABLE public.apiaries ADD COLUMN forage_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='apiaries' AND column_name='sun_exposure') THEN
        ALTER TABLE public.apiaries ADD COLUMN sun_exposure TEXT;
    END IF;
END
$$;

-- 4. Extend Hives Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hives' AND column_name='queen_hatched') THEN
        ALTER TABLE public.hives ADD COLUMN queen_hatched DATE DEFAULT CURRENT_DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hives' AND column_name='strength') THEN
        ALTER TABLE public.hives ADD COLUMN strength INTEGER DEFAULT 3;
    END IF;
END
$$;

-- 5. Trigger for updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name IN ('user_notification_settings', 'global_iot_settings')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()', t, t);
    END LOOP;
END;
$$;
