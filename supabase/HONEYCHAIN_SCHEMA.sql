-- HoneyChain Traceability Schema Update
ALTER TABLE public.hives ADD COLUMN IF NOT EXISTS has_colony BOOLEAN DEFAULT FALSE;
ALTER TABLE public.harvests ADD COLUMN IF NOT EXISTS batch_id TEXT;
ALTER TABLE public.harvests ADD COLUMN IF NOT EXISTS trace_link TEXT;

CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    apiary_id UUID REFERENCES public.apiaries(id) ON DELETE CASCADE,
    harvest_date DATE,
    honey_type TEXT,
    notes TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    blockchain_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reset columns if needed (optional)
UPDATE public.hives SET has_colony = FALSE WHERE has_colony IS NULL;
