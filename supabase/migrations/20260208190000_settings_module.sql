-- Enable Extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums
DO $$ BEGIN
    CREATE TYPE unit_system_enum AS ENUM ('metric', 'imperial');
    CREATE TYPE theme_enum AS ENUM ('light', 'dark', 'auto');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles Extension
-- Assuming 'profiles' table exists (common in Supabase), we add columns if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en-GB';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS unit_system unit_system_enum DEFAULT 'metric';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme theme_enum DEFAULT 'auto';

-- 3. UserPreferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_device_alerts BOOLEAN DEFAULT TRUE,
  email_ai_tips BOOLEAN DEFAULT TRUE,
  email_marketing BOOLEAN DEFAULT FALSE,
  app_tips_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for UserPreferences
DO $$ BEGIN
  CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


-- 4. AlertThresholds Table
CREATE TABLE IF NOT EXISTS alert_thresholds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hive_id UUID REFERENCES hives(id) ON DELETE CASCADE, -- Nullable/None for Global
  temp_high FLOAT,
  temp_low FLOAT,
  weight_drop FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique Indices to enforce logic
-- One global default per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_global_thresholds ON alert_thresholds (user_id) WHERE hive_id IS NULL;
-- One override per hive per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_hive_thresholds ON alert_thresholds (user_id, hive_id) WHERE hive_id IS NOT NULL;

ALTER TABLE alert_thresholds ENABLE ROW LEVEL SECURITY;

-- Policies for AlertThresholds
DO $$ BEGIN
  CREATE POLICY "Users can view own thresholds" ON alert_thresholds
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own thresholds" ON alert_thresholds
    FOR ALL USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


-- 5. Hive Alert Settings View (The "Join View")
-- Validates: Returns list of hives with effective settings (merged global + override)
CREATE OR REPLACE VIEW hive_alert_settings_view AS
SELECT
  h.id as hive_id,
  h.name as hive_name,
  h.hive_code,
  h.user_id,
  t.id as threshold_id,
  t.temp_high as override_temp_high,
  t.temp_low as override_temp_low,
  t.weight_drop as override_weight_drop,
  g.temp_high as global_temp_high,
  g.temp_low as global_temp_low,
  g.weight_drop as global_weight_drop,
  COALESCE(t.temp_high, g.temp_high) as effective_temp_high,
  COALESCE(t.temp_low, g.temp_low) as effective_temp_low,
  COALESCE(t.weight_drop, g.weight_drop) as effective_weight_drop
FROM hives h
LEFT JOIN alert_thresholds t ON h.id = t.hive_id
LEFT JOIN alert_thresholds g ON h.user_id = g.user_id AND g.hive_id IS NULL;

-- Permissions
GRANT SELECT ON hive_alert_settings_view TO authenticated;
