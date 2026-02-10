-- ==========================================
-- BEE YIELD HIVES: CORE SCHEMA (DOCKER INIT)
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

-- 6. TASKS TABLE
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

-- 7. HARVESTS TABLE
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
