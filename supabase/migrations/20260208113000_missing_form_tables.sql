-- Migration to create missing form-related tables
-- These are referenced in later security/RLS fix migrations

-- 1. CONTACT SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. POLLINATION REQUESTS
CREATE TABLE IF NOT EXISTS public.pollination_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    crop_type TEXT,
    acres DECIMAL,
    location_details TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. NEWSLETTER SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    topic TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email, topic)
);

-- 5. TRACING HISTORY
CREATE TABLE IF NOT EXISTS public.tracing_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    batch_id UUID REFERENCES public.harvests(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location_details JSONB,
    device_info JSONB,
    traced_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 6. DONATIONS
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount_usd DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. NEWSLETTER (Wait, already did subscribers/subscriptions)

-- Enable RLS for all
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pollination_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
