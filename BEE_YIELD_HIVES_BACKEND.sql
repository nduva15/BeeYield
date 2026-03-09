-- ==========================================
-- BEE YIELD HIVES: COMPREHENSIVE BACKEND SCHEMA
-- Implementing PRD with Service-Layer Compatibility
-- ==========================================

-- 1. ENABLE EXTENSIONS
-- PostGIS for geographic/apiary mapping
-- UUID-OSSP for random UUID generation (Standard for Supabase)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE
-- Extended user information beyond standard Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    settings JSONB DEFAULT '{
        "language": "en",
        "unit_system": "Metric",
        "theme": "Dark",
        "timezone": "UTC",
        "temp_threshold_high": 38.0,
        "temp_threshold_low": 10.0,
        "weight_drop_threshold": 2.0
    }'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FARMERS TABLE (If needed by beeyieldService)
CREATE TABLE IF NOT EXISTS public.farmers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    experience_years INTEGER,
    story TEXT,
    location_name TEXT,
    certification_status TEXT,
    total_hives INTEGER DEFAULT 0,
    registration_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. APIARIES TABLE
-- Groups of hives at a specific location
CREATE TABLE IF NOT EXISTS public.apiaries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    location GEOGRAPHY(POINT) NULL,
    location_name TEXT,
    county TEXT,
    region TEXT,
    apiary_code TEXT,
    apiary_type TEXT DEFAULT 'Permanent', -- frontend 'type'
    primary_forage TEXT, -- frontend 'forage_type'
    size_acres DECIMAL(10, 2) DEFAULT 0,
    expected_hives INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active',
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. HIVES TABLE
-- The primary record for each colony
CREATE TABLE IF NOT EXISTS public.hives (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
    hive_code TEXT NOT NULL, -- frontend uses hive_code as primary ID
    nickname TEXT, 
    hive_type TEXT DEFAULT 'Langstroth', -- frontend 'type'
    bee_type TEXT DEFAULT 'African Honey Bee',
    frame_count INTEGER DEFAULT 10,
    material TEXT DEFAULT 'Wood',
    status TEXT DEFAULT 'ACTIVE',
    health_status TEXT DEFAULT 'Good',
    installation_date DATE DEFAULT CURRENT_DATE,
    has_sensors BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INSPECTIONS TABLE
-- Historical records of hive checks
CREATE TABLE IF NOT EXISTS public.inspections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE NOT NULL,
    inspector_name TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    health_rating INTEGER CHECK (health_rating BETWEEN 1 AND 5),
    health_status TEXT,
    queen_status TEXT, -- Seen, Not Seen, Virgin, Mated
    queen_seen BOOLEAN DEFAULT FALSE,
    eggs_seen BOOLEAN DEFAULT FALSE,
    queen_cells_seen BOOLEAN DEFAULT FALSE,
    temperament TEXT, -- Scale or descriptive
    temperament_rating INTEGER CHECK (temperament_rating BETWEEN 1 AND 5),
    disease_signs TEXT[], -- Array of tags: Varroa, AFB, etc.
    honey_stores INTEGER, -- 1-5 scale or percentage
    pollen_stores INTEGER,
    brood_pattern TEXT,
    varroa_mite_count INTEGER,
    small_hive_beetles_seen INTEGER,
    weather_condition TEXT,
    temperature_celsius DECIMAL(5, 2),
    acoustic_signature JSONB NULL,
    notes TEXT,
    findings TEXT,
    actions_taken TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TASKS TABLE
-- To-do items (e.g., "Feed," "Treat," "Harvest")
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE NULL,
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, completed, in_progress
    priority TEXT DEFAULT 'medium', -- low, medium, high
    category TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    recurrence TEXT DEFAULT 'None',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. HARVESTS TABLE
-- Tracking honey yield per hive/apiary
CREATE TABLE IF NOT EXISTS public.harvests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE, -- frontend 'harvest_date'
    weight_kg DECIMAL(10, 2) NOT NULL, -- frontend 'quantity_kg'
    quantity_left_for_bees_kg DECIMAL(10, 2) DEFAULT 0,
    quality TEXT, 
    moisture_content DECIMAL(5, 2) NULL, -- frontend 'moisture_content_percent'
    honey_type TEXT,
    color_grade TEXT,
    floral_source TEXT, -- frontend 'nectar_source'
    extraction_method TEXT DEFAULT 'Cold Extraction',
    weather_conditions TEXT,
    batch_code TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    blockchain_hash TEXT,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. AI CONVERSATIONS TABLE
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Optional link to auth user
    device_id TEXT NOT NULL,
    title TEXT DEFAULT 'New Chat',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. AI CHAT MESSAGES TABLE
CREATE TABLE public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. SENSOR READINGS TABLE (IoT Data)
DROP TABLE IF EXISTS public.sensor_readings CASCADE;

CREATE TABLE public.sensor_readings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE NOT NULL,
    temp_internal DECIMAL(5, 2),
    temp_external DECIMAL(5, 2),
    humidity_internal DECIMAL(5, 2),
    humidity_external DECIMAL(5, 2),
    weight_kg DECIMAL(10, 2),
    battery_voltage DECIMAL(5, 2),
    acoustic_frequency INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for IoT data performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_hive_id ON public.sensor_readings(hive_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_recorded_at ON public.sensor_readings(recorded_at DESC);

-- Index for device_id to speed up history retrieval
CREATE INDEX IF NOT EXISTS idx_conversations_device_id ON public.conversations(device_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- Consolidated RLS Policies Helper Function
-- (Instead of writing individual policies for all 6 tables, we can iterate)

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT table_name FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name IN ('farmers', 'apiaries', 'hives', 'inspections', 'tasks', 'harvests')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users can view own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can view own %I" ON public.%I FOR SELECT USING ((SELECT auth.uid()) = user_id)', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can insert own %I" ON public.%I FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id)', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Users can update own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can update own %I" ON public.%I FOR UPDATE USING ((SELECT auth.uid()) = user_id)', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can delete own %I" ON public.%I FOR DELETE USING ((SELECT auth.uid()) = user_id)', tbl, tbl);
    END LOOP;
END;
$$;

-- AI Conversations & messages (Consolidated permissive)
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can manage conversations" ON public.conversations;
CREATE POLICY "Anyone can manage conversations" ON public.conversations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can manage chat messages" ON public.chat_messages;
CREATE POLICY "Anyone can manage chat messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view sensor readings" ON public.sensor_readings;
CREATE POLICY "Anyone can view sensor readings" ON public.sensor_readings FOR SELECT USING (true);

-- Special policies for profiles (linked via ID, not user_id column)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = id);

-- ==========================================
-- AUTOMATION: PROFILE SYNC
-- ==========================================

-- Trigger to create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- UPDATED_AT TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name IN ('profiles', 'farmers', 'apiaries', 'hives', 'inspections', 'tasks', 'harvests', 'conversations')
        LOOP
            EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t, t);
            EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()', t, t);
        END LOOP;
    END;
    $$;

-- ==========================================
-- 11. SUPABASE LINTER: PERFORMANCE & CLEANUP
-- ==========================================

-- Cleanup Duplicate Indexes
DROP INDEX IF EXISTS public.idx_contact_status;
DROP INDEX IF EXISTS public.idx_pollination_status;

-- Cleanup Redundant Policies (Multiple Permissive Policies fix)
-- Specifically targeting tables mentioned in linter
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    LOOP
        -- If we have both "Users can..." and "authenticated_access", drop "authenticated_access" to avoid redundancy
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = tbl AND policyname LIKE 'Users can %') 
           AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = tbl AND policyname = 'authenticated_access') THEN
            EXECUTE format('DROP POLICY IF EXISTS "authenticated_access" ON public.%I', tbl);
        END IF;
    END LOOP;
END;
$$;

-- Fix auth.uid() performance (auth_rls_initplan fix)
-- This iterates through all policies and wraps auth functions in subqueries (SELECT ...)
DO $$
DECLARE
    r RECORD;
    new_using text;
    new_with_check text;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND (qual LIKE '%auth.uid()%' OR qual LIKE '%auth.email()%' OR with_check LIKE '%auth.uid()%' OR with_check LIKE '%auth.email()%')
        AND (qual NOT LIKE '%(SELECT auth.uid())%' AND with_check NOT LIKE '%(SELECT auth.uid())%')
    ) LOOP
        -- Replace auth.uid() with (SELECT auth.uid()) for USING and WITH CHECK
        new_using := REPLACE(r.qual, 'auth.uid()', '(SELECT auth.uid())');
        new_using := REPLACE(new_using, 'auth.email()', '(SELECT auth.email())');
        
        new_with_check := REPLACE(r.with_check, 'auth.uid()', '(SELECT auth.uid())');
        new_with_check := REPLACE(new_with_check, 'auth.email()', '(SELECT auth.email())');

        -- Drop and Recreate policy with optimized check
        EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
        
        EXECUTE format('CREATE POLICY %I ON %I.%I FOR %s TO %s USING (%s) WITH CHECK (%s)', 
            r.policyname, r.schemaname, r.tablename, r.cmd, array_to_string(r.roles, ','), 
            COALESCE(new_using, 'true'), COALESCE(new_with_check, 'true'));
    END LOOP;
END;
$$;

NOTIFY pgrst, 'reload schema';
