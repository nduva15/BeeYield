-- 1. Create Devices Table
CREATE TABLE IF NOT EXISTS public.devices (
    serial_number TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT DEFAULT 'My Device',
    model TEXT DEFAULT 'Standard Hub',
    status TEXT DEFAULT 'offline',
    firmware_ver TEXT DEFAULT '1.0.0',
    battery_level INTEGER DEFAULT 100,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    linked_apiary_id UUID REFERENCES public.apiaries(id) -- Links to your existing Apiaries
);

-- 2. Create Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    device_sn TEXT REFERENCES public.devices(serial_number), -- Optional link to hardware
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    status TEXT DEFAULT 'open', -- open, in_progress, resolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Ticket Comments (For back-and-forth chat)
CREATE TABLE IF NOT EXISTS public.ticket_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id), -- If NULL, it's a Support Admin reply
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Security (RLS)
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Users see/edit ONLY their own devices
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own devices') THEN
        CREATE POLICY "Users manage own devices" ON devices 
        FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Policy: Users see/create ONLY their own tickets
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own tickets') THEN
        CREATE POLICY "Users manage own tickets" ON support_tickets 
        FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Policy: Users see comments for their tickets
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users view comments for their tickets') THEN
        CREATE POLICY "Users view comments for their tickets" ON ticket_comments 
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM support_tickets 
                WHERE support_tickets.id = ticket_comments.ticket_id 
                AND support_tickets.user_id = auth.uid()
            )
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users add comments to their tickets') THEN
        CREATE POLICY "Users add comments to their tickets" ON ticket_comments 
        FOR INSERT WITH CHECK (
            user_id = auth.uid() AND
            EXISTS (
                SELECT 1 FROM support_tickets 
                WHERE support_tickets.id = ticket_comments.ticket_id 
                AND support_tickets.user_id = auth.uid()
            )
        );
    END IF;
END
$$;
