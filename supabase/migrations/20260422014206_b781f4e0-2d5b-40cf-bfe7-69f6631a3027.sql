-- Add new optional fields to existing harvest_runs
ALTER TABLE public.harvest_runs
  ADD COLUMN IF NOT EXISTS assumptions JSONB,
  ADD COLUMN IF NOT EXISTS site_layout JSONB;

-- Versions of an AI forecast for a given harvest run
CREATE TABLE IF NOT EXISTS public.harvest_run_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.harvest_runs(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL DEFAULT 'v1',
  ai_forecast TEXT,
  local_estimate_kg NUMERIC,
  assumptions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_harvest_run_versions_run_id
  ON public.harvest_run_versions(run_id, created_at DESC);

ALTER TABLE public.harvest_run_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to harvest run versions" ON public.harvest_run_versions;
CREATE POLICY "Allow all access to harvest run versions"
  ON public.harvest_run_versions FOR ALL
  USING (true) WITH CHECK (true);

-- Partner review comments on a shared harvest run
CREATE TABLE IF NOT EXISTS public.harvest_run_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.harvest_runs(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Partner',
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_harvest_run_comments_run_id
  ON public.harvest_run_comments(run_id, created_at DESC);

ALTER TABLE public.harvest_run_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to harvest run comments" ON public.harvest_run_comments;
CREATE POLICY "Allow all access to harvest run comments"
  ON public.harvest_run_comments FOR ALL
  USING (true) WITH CHECK (true);