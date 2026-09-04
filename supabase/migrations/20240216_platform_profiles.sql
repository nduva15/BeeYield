-- Create platform-specific profile tables for strict separation
-- This allows one email to have separate identities/data per platform

-- 1. Shop Profiles (Customers)
CREATE TABLE IF NOT EXISTS public.shop_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    shipping_address JSONB,
    billing_address JSONB,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BeeYield Profiles (Farmers/Hobbyists)
CREATE TABLE IF NOT EXISTS public.beeyield_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    organization_name TEXT,
    farm_location TEXT,
    total_hives INTEGER DEFAULT 0,
    technical_role TEXT DEFAULT 'farmer',
    is_professional BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CEBA Profiles (Admin/Content Management)
CREATE TABLE IF NOT EXISTS public.ceba_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    admin_role TEXT DEFAULT 'content_editor', -- content_editor, manager, super_admin
    permissions TEXT[] DEFAULT '{}',
    access_logs JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.shop_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beeyield_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ceba_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Shop: Users can only see their own shop profile
CREATE POLICY "Users can view own shop profile" ON public.shop_profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own shop profile" ON public.shop_profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own shop profile" ON public.shop_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- BeeYield: Users can only see their own beeyield profile
CREATE POLICY "Users can view own beeyield profile" ON public.beeyield_profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own beeyield profile" ON public.beeyield_profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own beeyield profile" ON public.beeyield_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- CEBA: Only admins can see CEBA profiles
CREATE POLICY "Users can view own ceba profile" ON public.ceba_profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all ceba profiles" ON public.ceba_profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.ceba_profiles WHERE id = auth.uid() AND admin_role = 'super_admin')
    );

-- Functions for auto-updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_shop_updated_at ON public.shop_profiles;
DROP TRIGGER IF EXISTS set_beeyield_updated_at ON public.beeyield_profiles;
DROP TRIGGER IF EXISTS set_ceba_updated_at ON public.ceba_profiles;

CREATE TRIGGER set_shop_updated_at BEFORE UPDATE ON public.shop_profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER set_beeyield_updated_at BEFORE UPDATE ON public.beeyield_profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER set_ceba_updated_at BEFORE UPDATE ON public.ceba_profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
