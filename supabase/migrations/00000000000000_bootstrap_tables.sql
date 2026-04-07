-- Bootstrap core tables for forms if they don't exist
-- This ensures that later migrations adding policies don't fail

CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_type TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    topic TEXT,
    subject TEXT,
    message TEXT,
    company TEXT,
    farm_name TEXT,
    crop_type TEXT,
    acres FLOAT,
    apiary_name TEXT,
    hive_count INTEGER,
    experience_years TEXT,
    status TEXT DEFAULT 'new',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pollination_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    farm_name TEXT,
    farm_location TEXT,
    crop_type TEXT,
    acres FLOAT,
    preferred_start_date DATE,
    additional_info TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    source TEXT DEFAULT 'footer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
