-- =============================================================================
-- "My Requests" Service Desk Schema (Supabase)
-- =============================================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE request_category AS ENUM ('Hardware', 'Software', 'Traceability', 'General', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('Open', 'In Progress', 'Resolved', 'Closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create "requests" table
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(), -- Links to auth.users
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category request_category DEFAULT 'General',
    status request_status DEFAULT 'Open',
    priority request_priority DEFAULT 'Medium',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraint: Foreign Key to auth.users (optional, strict data integrity)
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- 3. Create "request_comments" table
CREATE TABLE IF NOT EXISTS public.request_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    author_id UUID NOT NULL DEFAULT auth.uid(),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_comments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for "requests"

-- Policy: Users can only see their own requests.
DROP POLICY IF EXISTS "Users can view their own requests" ON public.requests;
CREATE POLICY "Users can view their own requests"
ON public.requests
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own requests.
DROP POLICY IF EXISTS "Users can insert their own requests" ON public.requests;
CREATE POLICY "Users can insert their own requests"
ON public.requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own requests (e.g. to close them).
DROP POLICY IF EXISTS "Users can update their own requests" ON public.requests;
CREATE POLICY "Users can update their own requests"
ON public.requests
FOR UPDATE
USING (auth.uid() = user_id);

-- 6. RLS Policies for "request_comments"

-- Policy: Users can view comments on requests they own.
DROP POLICY IF EXISTS "Users can view comments on their requests" ON public.request_comments;
CREATE POLICY "Users can view comments on their requests"
ON public.request_comments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.requests r
        WHERE r.id = request_comments.request_id
        AND r.user_id = auth.uid()
    )
);

-- Policy: Users can add comments to requests they own.
DROP POLICY IF EXISTS "Users can add comments to their requests" ON public.request_comments;
CREATE POLICY "Users can add comments to their requests"
ON public.request_comments
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.requests r
        WHERE r.id = request_comments.request_id
        AND r.user_id = auth.uid()
    )
);

-- 7. Realtime Replication
-- Add tables to the realtime publication so frontend receives updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.request_comments;

-- 8. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_request_comments_request_id ON public.request_comments(request_id);
