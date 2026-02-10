-- ==========================================
-- BEE YIELD HIVES: CORE SCHEMA MIGRATION
-- ==========================================

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE
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

-- 3. FARMERS TABLE
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
    apiary_type TEXT DEFAULT 'Permanent',
    primary_forage TEXT,
    size_acres DECIMAL(10, 2) DEFAULT 0,
    expected_hives INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active',
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. HIVES TABLE
CREATE TABLE IF NOT EXISTS public.hives (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
    hive_code TEXT NOT NULL,
    nickname TEXT, 
    hive_type TEXT DEFAULT 'Langstroth',
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
CREATE TABLE IF NOT EXISTS public.inspections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE NOT NULL,
    inspector_name TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    health_rating INTEGER CHECK (health_rating BETWEEN 1 AND 5),
    health_status TEXT,
    queen_status TEXT,
    queen_seen BOOLEAN DEFAULT FALSE,
    eggs_seen BOOLEAN DEFAULT FALSE,
    queen_cells_seen BOOLEAN DEFAULT FALSE,
    temperament TEXT,
    temperament_rating INTEGER CHECK (temperament_rating BETWEEN 1 AND 5),
    disease_signs TEXT[],
    honey_stores INTEGER,
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
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE NULL,
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    category TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    recurrence TEXT DEFAULT 'None',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. HARVESTS TABLE
CREATE TABLE IF NOT EXISTS public.harvests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    hive_id UUID REFERENCES public.hives(id) ON DELETE CASCADE NOT NULL,
    farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg DECIMAL(10, 2) NOT NULL,
    quantity_left_for_bees_kg DECIMAL(10, 2) DEFAULT 0,
    quality TEXT, 
    moisture_content DECIMAL(5, 2) NULL,
    honey_type TEXT,
    color_grade TEXT,
    floral_source TEXT,
    extraction_method TEXT DEFAULT 'Cold Extraction',
    weather_conditions TEXT,
    batch_code TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    blockchain_hash TEXT,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvests ENABLE ROW LEVEL SECURITY;

-- Consolidate policies only if they don't exist
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT table_name FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name IN ('farmers', 'apiaries', 'hives', 'inspections', 'tasks', 'harvests')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users can view own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can view own %I" ON public.%I FOR SELECT USING (auth.uid() = user_id)', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can insert own %I" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Users can update own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can update own %I" ON public.%I FOR UPDATE USING (auth.uid() = user_id)', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can delete own %I" ON public.%I FOR DELETE USING (auth.uid() = user_id)', tbl, tbl);
    END LOOP;
END;
$$;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- TRIGGERS
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
             AND table_name IN ('profiles', 'farmers', 'apiaries', 'hives', 'inspections', 'tasks', 'harvests')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()', t, t);
    END LOOP;
END;
$$;
