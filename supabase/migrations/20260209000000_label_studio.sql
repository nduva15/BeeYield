-- 1. Create Templates Table
CREATE TABLE IF NOT EXISTS public.label_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    dimensions_json JSONB, -- {"w": 90, "h": 60}
    css_style TEXT, -- CSS string for web preview
    is_premium BOOLEAN DEFAULT FALSE
);

-- 2. Create Saved Designs
CREATE TABLE IF NOT EXISTS public.saved_labels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    harvest_batch_id TEXT, -- Link to Harvest Log
    template_id UUID REFERENCES public.label_templates(id),
    custom_text TEXT,
    include_qr BOOLEAN DEFAULT TRUE,
    design_json JSONB, -- Stores full LabelData state
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Pre-Seed Templates (only if empty)
INSERT INTO public.label_templates (name, dimensions_json, css_style)
SELECT 'Classic Gold', '{"w": 90, "h": 60}', 'background: #FFD700; color: #000; font-family: Serif;'
WHERE NOT EXISTS (SELECT 1 FROM public.label_templates WHERE name = 'Classic Gold');

INSERT INTO public.label_templates (name, dimensions_json, css_style)
SELECT 'Minimalist White', '{"w": 90, "h": 60}', 'background: #FFF; color: #333; font-family: Sans-Serif; border: 2px solid #333;'
WHERE NOT EXISTS (SELECT 1 FROM public.label_templates WHERE name = 'Minimalist White');

-- 4. Enable Security
ALTER TABLE public.saved_labels ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own labels' AND tablename = 'saved_labels') THEN
        CREATE POLICY "Users manage own labels" ON public.saved_labels FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

