
-- Dataset imports for re-indexing
CREATE TABLE public.dataset_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  dataset_kind TEXT NOT NULL DEFAULT 'bees',
  row_count INTEGER NOT NULL DEFAULT 0,
  schema_valid BOOLEAN NOT NULL DEFAULT false,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  sample_rows JSONB DEFAULT '[]'::jsonb,
  reindex_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dataset_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to dataset_imports" ON public.dataset_imports FOR ALL USING (true) WITH CHECK (true);

-- Feeding schedules
CREATE TABLE public.feeding_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  hive_label TEXT NOT NULL DEFAULT 'Hive 1',
  plan_label TEXT NOT NULL DEFAULT 'Season plan',
  plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feeding_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to feeding_schedules" ON public.feeding_schedules FOR ALL USING (true) WITH CHECK (true);

-- Knowledge facts (citations + confidence)
CREATE TABLE public.knowledge_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL DEFAULT 'global',
  topic TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  fact TEXT NOT NULL,
  citation TEXT,
  source_url TEXT,
  confidence NUMERIC NOT NULL DEFAULT 0.8,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to knowledge_facts" ON public.knowledge_facts FOR ALL USING (true) WITH CHECK (true);

-- Yield projections runs
CREATE TABLE public.yield_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Projection',
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.yield_projections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to yield_projections" ON public.yield_projections FOR ALL USING (true) WITH CHECK (true);

-- Apiary sizing runs
CREATE TABLE public.apiary_sizing_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Sizing run',
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.apiary_sizing_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to apiary_sizing_runs" ON public.apiary_sizing_runs FOR ALL USING (true) WITH CHECK (true);

-- Seed knowledge facts
INSERT INTO public.knowledge_facts (topic, category, fact, citation, source_url, confidence, tags, is_default) VALUES
('Varroa destructor','disease','Varroa mites parasitize honey bee brood and adults, vectoring deformed wing virus (DWV); economic threshold ~3 mites per 100 bees in summer.','Rosenkranz et al. 2010, J. Invertebr. Pathol.','https://doi.org/10.1016/j.jip.2009.07.016',0.95,ARRAY['varroa','dwv','threshold'],true),
('American foulbrood','disease','AFB is caused by Paenibacillus larvae spores; spores remain viable >40 years; burning is the standard control in many jurisdictions.','Genersch 2010, J. Invertebr. Pathol.','https://doi.org/10.1016/j.jip.2009.06.015',0.93,ARRAY['afb','spore','burn'],true),
('Nosema ceranae','disease','Nosema ceranae is a microsporidian gut pathogen; fumagillin reduces spore loads but resistance is increasing.','Higes et al. 2013','',0.88,ARRAY['nosema','gut'],true),
('Apis mellifera scutellata','species','African honey bee subspecies common in Kibwezi/Makueni; defensive, swarm- and abscond-prone, productive in semi-arid acacia bloom.','Hepburn & Radloff 1998','',0.9,ARRAY['scutellata','africa','kibwezi'],true),
('Acacia mellifera','florage','Major dryland nectar source in eastern Kenya; bloom Mar–May and Oct–Dec; nectar score 9/10, pollen 7/10.','Kasina 2007','',0.85,ARRAY['acacia','kenya','nectar'],true),
('Manuka honey MGO','honey','Methylglyoxal (MGO) gives manuka its non-peroxide antibacterial activity; UMF 10+ ≈ MGO 263 mg/kg.','Mavric et al. 2008','',0.92,ARRAY['manuka','mgo','umf'],true),
('Honey moisture','honey','Extraction safe ≤18.6% moisture; above this, fermentation risk by osmotolerant yeasts increases sharply.','White 1975','',0.95,ARRAY['moisture','extraction'],true),
('Colony Collapse Disorder','disease','CCD is multifactorial: pesticides (neonicotinoids), pathogens (Nosema, viruses), nutrition, and stress combine.','vanEngelsdorp 2009','',0.85,ARRAY['ccd','multifactorial'],true),
('Foraging radius','behavior','Honey bees typically forage within 2–3 km but can fly up to 10–13 km if necessary.','Beekman & Ratnieks 2000','',0.9,ARRAY['forage','radius'],true),
('Waggle dance','behavior','Direction encoded by angle relative to vertical; distance encoded by waggle-run duration (~1 s ≈ 1 km).','von Frisch 1967','',0.97,ARRAY['waggle','communication'],true),
('Winter cluster','management','Cluster forms below ~14°C; core stays ~32–35°C when brood present; consumes ~0.7–1.2 kg honey/week in cold.','Seeley 2010','',0.9,ARRAY['winter','cluster'],true),
('Almond pollination','crop','Almond pollination requires ~5 colonies/ha (2/acre) at 10–25% bloom for optimum nut set.','Klein et al. 2007','',0.93,ARRAY['almond','crop'],true),
('Tropilaelaps','disease','Tropilaelaps mercedesae is emerging in Asia; faster reproduction than Varroa; OIE-listed.','Anderson & Roberts 2013','',0.88,ARRAY['tropilaelaps','mite'],true),
('Sacbrood virus','disease','SBV affects larvae forming a fluid-filled "sac"; usually self-limiting if colony is strong.','Bailey 1969','',0.85,ARRAY['sbv','virus'],true);
