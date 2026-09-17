-- ==========================================
-- BEEYIELD: PRECISION POLLINATION ENGINES
-- ==========================================

-- 1. POLLINATION DEPLOYMENTS (The "Bee Math" Persistence)
CREATE TABLE IF NOT EXISTS public.pollination_deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    field_name TEXT NOT NULL,
    crop_type TEXT,
    total_acres DECIMAL(10, 2) DEFAULT 0,
    target_fpa DECIMAL(10, 2) DEFAULT 0, -- Frames Per Acre
    actual_fpa DECIMAL(10, 2) DEFAULT 0,
    bloom_intensity DECIMAL(3, 2) DEFAULT 0, -- 0.0 to 1.0
    forage_condition DECIMAL(3, 2) DEFAULT 0, -- 0.0 to 1.0
    deployment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    retrieval_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
    metrics_json JSONB DEFAULT '{}'::jsonb, -- Store calculated metrics like effectiveFrames, efficacyIndex
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE RLS
ALTER TABLE public.pollination_deployments ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES
DROP POLICY IF EXISTS "Users can view own pollination_deployments" ON public.pollination_deployments;
CREATE POLICY "Users can view own pollination_deployments" ON public.pollination_deployments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own pollination_deployments" ON public.pollination_deployments;
CREATE POLICY "Users can insert own pollination_deployments" ON public.pollination_deployments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pollination_deployments" ON public.pollination_deployments;
CREATE POLICY "Users can update own pollination_deployments" ON public.pollination_deployments FOR UPDATE USING (auth.uid() = user_id);

-- 4. TRIGGER FOR updated_at
DROP TRIGGER IF EXISTS update_pollination_deployments_updated_at ON public.pollination_deployments;
CREATE TRIGGER update_pollination_deployments_updated_at BEFORE UPDATE ON public.pollination_deployments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
