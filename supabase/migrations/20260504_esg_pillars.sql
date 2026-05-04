-- Create Table for ESG Pillars
CREATE TABLE IF NOT EXISTS public.esg_pillars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    impact TEXT NOT NULL,
    initiatives_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.esg_pillars ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Public can view esg pillars" ON public.esg_pillars;
CREATE POLICY "Public can view esg pillars" ON public.esg_pillars FOR SELECT USING (true);

-- Insert Data
INSERT INTO public.esg_pillars (title, icon, color, impact, initiatives_json) VALUES
('Hive Health', 'Cpu', 'bg-white border-neutral-200/60', 'Earlier detection of issues and faster response during the season', '["Sound pattern checks to flag early disease risk", "Real-time hive condition snapshots (Temp, Humidity, Mass)", "Swarm-risk indicators to support timely inspections", "Simple health signals that are easy to act on", "Sharing aggregated learnings with local partners"]'::jsonb),
('Traceability', 'ShieldCheck', 'bg-white border-neutral-200/60', 'Clear, checkable records from hive to jar', '["Verification checks for each batch", "Verifiable records for each harvest event", "Hive ID to jar-level tracking where available", "QR access to batch details for customers", "Audit support for retail and export partners"]'::jsonb),
('The 50/50 Anchor', 'Scale', 'bg-white border-neutral-200/60', 'Colonies maintain peak biological vigor through extreme weather cycles', '["Strict adherence to the 50% ethical harvest threshold", "No artificial supplements: Bees sustain on native flora", "Resource-buffer management for dry seasons in Kenya", "Biological-centric harvest cycles prioritized over volume", "High-potency nutrient retention in final honey product"]'::jsonb),
('Women-Led Engineering', 'Code', 'bg-white border-neutral-200/60', 'Diversity-driven innovation accelerating project dev-cycles by 30%', '["Co-Founded by Agatha Nduva (IT Architecture) & Carole Nduva (Growth)", "Diversity-first engineering and strategic leadership teams", "Mentorship programs for women in digital agriculture and advanced intelligence", "Strategic focus on inclusive economic growth in Kibwezi", "Leadership in Africa\'s emerging high-tech ag-ecosystem"]'::jsonb);
