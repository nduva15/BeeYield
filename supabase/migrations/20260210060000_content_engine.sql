-- ============================================================
-- BeeYield Content Engine — Database Migration
-- Creates: blog_posts, seo_metadata, blog_chapters
-- Supports: The "Big 45" content roadmap with AI chapter builder
-- ============================================================

-- 1. Create blog category enum (IF NOT EXISTS pattern for safety)
DO $$ BEGIN
    CREATE TYPE blog_category AS ENUM ('bees', 'honey', 'apiary', 'diseases');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create blog post status enum
DO $$ BEGIN
    CREATE TYPE blog_status AS ENUM ('idea', 'writing', 'seo_review', 'published');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create content pillar enum
DO $$ BEGIN
    CREATE TYPE content_pillar AS ENUM (
        'bee_biology_behavior',
        'honey_hive_products',
        'apiary_management_tech',
        'diseases_pests'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- BLOG_POSTS — The Core Content Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    content_html TEXT DEFAULT '',
    content_markdown TEXT DEFAULT '',
    excerpt TEXT DEFAULT '',
    category blog_category NOT NULL DEFAULT 'bees',
    pillar content_pillar,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT DEFAULT 'BeeYield Team',
    status blog_status DEFAULT 'idea',
    featured_image TEXT,
    word_count INTEGER DEFAULT 0,
    target_word_count INTEGER DEFAULT 6000,
    read_time_minutes INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    views_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BLOG_CHAPTERS — The Modular AI Writer sections
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blog_chapters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL DEFAULT 0,
    heading TEXT NOT NULL,
    content_html TEXT DEFAULT '',
    content_markdown TEXT DEFAULT '',
    word_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, generating, complete
    ai_prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, chapter_number)
);

-- ============================================================
-- SEO_METADATA — One-to-One optimization layer
-- ============================================================
CREATE TABLE IF NOT EXISTS public.seo_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID UNIQUE NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    meta_title TEXT,
    meta_description TEXT,
    focus_keywords TEXT[] DEFAULT '{}',
    secondary_keywords TEXT[] DEFAULT '{}',
    aeo_answer_snippet TEXT,          -- 40-word concise answer for Voice Search
    geo_citation_sources TEXT[] DEFAULT '{}', -- Links to papers cited
    schema_json JSONB DEFAULT '{}',   -- FAQPage, Article, Breadcrumb structured data
    seo_score INTEGER DEFAULT 0,      -- 0-100
    aeo_score INTEGER DEFAULT 0,      -- 0-100
    geo_score INTEGER DEFAULT 0,      -- 0-100
    overall_score INTEGER DEFAULT 0,  -- 0-100
    last_analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BLOG CTA BLOCKS — Dynamic Call-to-Action placements
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blog_cta_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    cta_type TEXT NOT NULL DEFAULT 'banner', -- banner, inline, sidebar, popup
    title TEXT NOT NULL,
    description TEXT,
    button_text TEXT DEFAULT 'Learn More',
    button_url TEXT DEFAULT '/',
    image_url TEXT,
    style_variant TEXT DEFAULT 'primary', -- primary, pollination, honey
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_pillar ON public.blog_posts(pillar);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_blog_chapters_post ON public.blog_chapters(post_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_seo_metadata_post ON public.seo_metadata(post_id);

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_cta_blocks ENABLE ROW LEVEL SECURITY;

-- Public can view published posts
CREATE POLICY "Public can view published blog posts"
    ON public.blog_posts FOR SELECT
    USING (status = 'published');

-- Authenticated users can manage their own posts
CREATE POLICY "Authors can manage own blog posts"
    ON public.blog_posts FOR ALL
    USING ((SELECT auth.uid()) = author_id)
    WITH CHECK ((SELECT auth.uid()) = author_id);

-- Chapters follow post ownership
CREATE POLICY "Authors can manage own chapters"
    ON public.blog_chapters FOR ALL
    USING (
        post_id IN (
            SELECT id FROM public.blog_posts WHERE author_id = (SELECT auth.uid())
        )
    );

-- Public can view SEO metadata for published posts
CREATE POLICY "Public can view published seo metadata"
    ON public.seo_metadata FOR SELECT
    USING (
        post_id IN (
            SELECT id FROM public.blog_posts WHERE status = 'published'
        )
    );

-- Authors can manage SEO metadata for their posts
CREATE POLICY "Authors can manage own seo metadata"
    ON public.seo_metadata FOR ALL
    USING (
        post_id IN (
            SELECT id FROM public.blog_posts WHERE author_id = (SELECT auth.uid())
        )
    );

-- CTA blocks are public read
CREATE POLICY "Public can view active CTA blocks"
    ON public.blog_cta_blocks FOR SELECT
    USING (is_active = true);

-- ============================================================
-- Auto-update timestamp trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_blog_updated_at();

DROP TRIGGER IF EXISTS blog_chapters_updated_at ON public.blog_chapters;
CREATE TRIGGER blog_chapters_updated_at
    BEFORE UPDATE ON public.blog_chapters
    FOR EACH ROW EXECUTE FUNCTION public.update_blog_updated_at();

DROP TRIGGER IF EXISTS seo_metadata_updated_at ON public.seo_metadata;
CREATE TRIGGER seo_metadata_updated_at
    BEFORE UPDATE ON public.seo_metadata
    FOR EACH ROW EXECUTE FUNCTION public.update_blog_updated_at();

-- ============================================================
-- Seed: Insert the "Big 45" Roadmap as idea posts
-- ============================================================
INSERT INTO public.blog_posts (slug, title, category, pillar, status, tags, target_word_count) VALUES
    -- Pillar A: Bee Biology & Behavior (10)
    ('complete-anatomy-apis-mellifera', 'The Complete Anatomy of Apis mellifera: A 6,000-Word Deep Dive', 'bees', 'bee_biology_behavior', 'idea', ARRAY['anatomy', 'apis mellifera', 'bee biology'], 6000),
    ('waggle-dance-mathematics-hive-communication', 'Understanding the Waggle Dance: The Mathematics of Hive Communication', 'bees', 'bee_biology_behavior', 'idea', ARRAY['waggle dance', 'communication', 'bee behavior'], 6000),
    ('queen-rearing-masterclass', 'Queen Rearing Masterclass: From Grafting to Mating Flights', 'bees', 'bee_biology_behavior', 'idea', ARRAY['queen rearing', 'grafting', 'mating flights'], 6000),
    ('bee-colony-lifecycle-annual-cycle', 'The Complete Bee Colony Lifecycle: An Annual Deep Dive', 'bees', 'bee_biology_behavior', 'idea', ARRAY['colony lifecycle', 'seasonal management'], 6000),
    ('worker-bee-roles-division-labor', 'Worker Bee Roles: Understanding Division of Labor in the Hive', 'bees', 'bee_biology_behavior', 'idea', ARRAY['worker bees', 'division of labor', 'hive roles'], 6000),
    ('bee-genetics-breeding-programs', 'Bee Genetics and Modern Breeding Programs', 'bees', 'bee_biology_behavior', 'idea', ARRAY['genetics', 'breeding', 'bee improvement'], 6000),
    ('pheromone-communication-bees', 'Pheromone Communication in Honey Bees: Chemical Language Decoded', 'bees', 'bee_biology_behavior', 'idea', ARRAY['pheromones', 'chemical communication', 'bee behavior'], 6000),
    ('bee-vision-navigation-systems', 'Bee Vision and Navigation: How Bees See the World', 'bees', 'bee_biology_behavior', 'idea', ARRAY['vision', 'navigation', 'UV spectrum'], 6000),
    ('thermoregulation-hive-temperature', 'Thermoregulation: How Bees Maintain Perfect Hive Temperature', 'bees', 'bee_biology_behavior', 'idea', ARRAY['thermoregulation', 'temperature', 'hive environment'], 6000),
    ('swarming-behavior-prevention', 'Swarming Behavior: Biology, Prevention, and Management Strategies', 'bees', 'bee_biology_behavior', 'idea', ARRAY['swarming', 'swarm prevention', 'colony management'], 6000),

    -- Pillar B: Honey & Hive Products (12)
    ('manuka-vs-acacia-chemical-analysis', 'Manuka vs. Acacia: The Ultimate Chemical Composition Analysis', 'honey', 'honey_hive_products', 'idea', ARRAY['manuka', 'acacia', 'chemical composition'], 6000),
    ('global-honey-market-2026', 'The Global Honey Market 2026: Trends, Pricing, and Export Rules', 'honey', 'honey_hive_products', 'idea', ARRAY['honey market', 'pricing', 'export'], 6000),
    ('propolis-royal-jelly-clinical-studies', 'Propolis and Royal Jelly: Clinical Studies on Medicinal Benefits', 'honey', 'honey_hive_products', 'idea', ARRAY['propolis', 'royal jelly', 'medicinal benefits'], 6000),
    ('honey-authentication-fraud-detection', 'Honey Authentication: Scientific Methods to Detect Fraud', 'honey', 'honey_hive_products', 'idea', ARRAY['authentication', 'fraud detection', 'purity testing'], 6000),
    ('beeswax-products-cosmetics-industry', 'Beeswax in the Cosmetics Industry: From Hive to Beauty Products', 'honey', 'honey_hive_products', 'idea', ARRAY['beeswax', 'cosmetics', 'beauty industry'], 6000),
    ('monofloral-honey-guide', 'The Complete Guide to Monofloral Honeys: Flavor Profiles and Origins', 'honey', 'honey_hive_products', 'idea', ARRAY['monofloral', 'flavor profiles', 'honey types'], 6000),
    ('honey-processing-extraction-guide', 'Honey Processing and Extraction: Industrial vs. Artisanal Methods', 'honey', 'honey_hive_products', 'idea', ARRAY['processing', 'extraction', 'artisanal'], 6000),
    ('bee-venom-therapy-apitherapy', 'Bee Venom Therapy: Science Behind Apitherapy', 'honey', 'honey_hive_products', 'idea', ARRAY['bee venom', 'apitherapy', 'alternative medicine'], 6000),
    ('honey-nutrition-glycemic-index', 'Honey Nutrition Deep Dive: Glycemic Index, Enzymes, and Health Claims', 'honey', 'honey_hive_products', 'idea', ARRAY['nutrition', 'glycemic index', 'health claims'], 6000),
    ('organic-honey-certification', 'Organic Honey Certification: Standards, Process, and Market Value', 'honey', 'honey_hive_products', 'idea', ARRAY['organic', 'certification', 'standards'], 6000),
    ('honey-fermentation-mead', 'From Honey to Mead: The Ancient Art of Honey Fermentation', 'honey', 'honey_hive_products', 'idea', ARRAY['mead', 'fermentation', 'traditional'], 6000),
    ('traceability-blockchain-honey', 'Honey Traceability with Blockchain: From Hive to Table', 'honey', 'honey_hive_products', 'idea', ARRAY['traceability', 'blockchain', 'supply chain'], 6000),

    -- Pillar C: Apiary Management & Tech (13)
    ('iot-beekeeping-sensors-colony-collapse', 'IoT in Beekeeping: How Sensors Reduce Colony Collapse by 40%', 'apiary', 'apiary_management_tech', 'idea', ARRAY['IoT', 'sensors', 'colony collapse'], 6000),
    ('precision-pollination-roi-almond-avocado', 'Precision Pollination: Calculating ROI for Almond and Avocado Farmers', 'apiary', 'apiary_management_tech', 'idea', ARRAY['precision pollination', 'ROI', 'almond', 'avocado'], 6000),
    ('scaling-50-to-5000-hives', 'Scaling from 50 to 5,000 Hives: Logistics, Labor, and Software', 'apiary', 'apiary_management_tech', 'idea', ARRAY['scaling', 'logistics', 'commercial beekeeping'], 6000),
    ('hive-monitoring-data-analytics', 'Hive Monitoring Deep Dive: Data Analytics for Smarter Beekeeping', 'apiary', 'apiary_management_tech', 'idea', ARRAY['monitoring', 'data analytics', 'smart beekeeping'], 6000),
    ('migratory-beekeeping-logistics', 'Migratory Beekeeping: Route Planning and Logistics Optimization', 'apiary', 'apiary_management_tech', 'idea', ARRAY['migratory', 'logistics', 'route planning'], 6000),
    ('urban-beekeeping-regulations-guide', 'Urban Beekeeping 2026: Regulations, Setup, and Best Practices', 'apiary', 'apiary_management_tech', 'idea', ARRAY['urban beekeeping', 'regulations', 'city farming'], 6000),
    ('beekeeping-financial-model', 'The Beekeeping Financial Model: Revenue Streams and Cost Analysis', 'apiary', 'apiary_management_tech', 'idea', ARRAY['financial model', 'revenue', 'cost analysis'], 6000),
    ('climate-smart-beekeeping', 'Climate-Smart Beekeeping: Adapting Practices to a Changing World', 'apiary', 'apiary_management_tech', 'idea', ARRAY['climate change', 'adaptation', 'sustainability'], 6000),
    ('ai-machine-learning-beekeeping', 'AI and Machine Learning in Beekeeping: Current Applications', 'apiary', 'apiary_management_tech', 'idea', ARRAY['AI', 'machine learning', 'technology'], 6000),
    ('drone-technology-apiary-management', 'Drone Technology for Apiary Management and Monitoring', 'apiary', 'apiary_management_tech', 'idea', ARRAY['drones', 'monitoring', 'technology'], 6000),
    ('cooperative-beekeeping-models', 'Cooperative Beekeeping Models: Case Studies from Africa and Asia', 'apiary', 'apiary_management_tech', 'idea', ARRAY['cooperatives', 'Africa', 'Asia', 'case studies'], 6000),
    ('beekeeping-insurance-risk-management', 'Beekeeping Insurance and Risk Management Strategies', 'apiary', 'apiary_management_tech', 'idea', ARRAY['insurance', 'risk management', 'business'], 6000),
    ('solar-powered-apiaries', 'Solar-Powered Apiaries: Energy Independence for Remote Beekeeping', 'apiary', 'apiary_management_tech', 'idea', ARRAY['solar', 'energy', 'remote beekeeping'], 6000),

    -- Pillar D: Diseases & Pests (10)
    ('varroa-destructor-integrated-pest-management', 'Varroa Destructor: The Biology of the Mite and Integrated Pest Management', 'diseases', 'diseases_pests', 'idea', ARRAY['varroa', 'IPM', 'mite control'], 6000),
    ('american-foulbrood-identification-quarantine', 'American Foulbrood (AFB): Identification, Quarantine, and Incineration Protocols', 'diseases', 'diseases_pests', 'idea', ARRAY['AFB', 'foulbrood', 'quarantine'], 6000),
    ('nosema-diagnosis-treatment', 'Nosema ceranae and Nosema apis: Diagnosis, Treatment, and Prevention', 'diseases', 'diseases_pests', 'idea', ARRAY['nosema', 'diagnosis', 'treatment'], 6000),
    ('small-hive-beetle-management', 'Small Hive Beetle: Life Cycle, Detection, and Control Strategies', 'diseases', 'diseases_pests', 'idea', ARRAY['small hive beetle', 'pest control'], 6000),
    ('european-foulbrood-guide', 'European Foulbrood (EFB): Complete Clinical and Field Guide', 'diseases', 'diseases_pests', 'idea', ARRAY['EFB', 'foulbrood', 'clinical guide'], 6000),
    ('pesticide-impact-pollinators', 'Pesticide Impact on Pollinators: Neonicotinoids and Beyond', 'diseases', 'diseases_pests', 'idea', ARRAY['pesticides', 'neonicotinoids', 'pollinator health'], 6000),
    ('chalkbrood-stonebrood-fungal-diseases', 'Chalkbrood and Stonebrood: Fungal Diseases in Honey Bee Colonies', 'diseases', 'diseases_pests', 'idea', ARRAY['chalkbrood', 'stonebrood', 'fungal'], 6000),
    ('wax-moth-prevention-control', 'Wax Moth Prevention and Control: Protecting Stored Combs', 'diseases', 'diseases_pests', 'idea', ARRAY['wax moth', 'comb protection', 'storage'], 6000),
    ('colony-collapse-disorder-research', 'Colony Collapse Disorder: Latest Research and Prevention Strategies', 'diseases', 'diseases_pests', 'idea', ARRAY['CCD', 'colony collapse', 'research'], 6000),
    ('biosecurity-apiary-protocol', 'Biosecurity for Apiaries: Creating a Disease Prevention Protocol', 'diseases', 'diseases_pests', 'idea', ARRAY['biosecurity', 'disease prevention', 'protocols'], 6000)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Seed: Default CTA blocks
-- ============================================================
INSERT INTO public.blog_cta_blocks (name, cta_type, title, description, button_text, button_url, style_variant) VALUES
    ('pollination_banner', 'banner', 'Need Precision Pollination Services?', 'BeeYield connects you with professional hive rental for almond, avocado, and 30+ other crops. Calculate your ROI instantly.', 'Rent Hives Now', '/precision-pollination', 'pollination'),
    ('honey_inline', 'inline', 'Taste the Difference: Traceable Honey', 'Every jar of BeeYield honey comes with a QR code linking directly to the hive it came from. Pure, raw, and fully traceable.', 'Shop Honey', '/shop', 'honey'),
    ('dashboard_sidebar', 'sidebar', 'Manage Your Hives Smarter', 'Join 2,500+ beekeepers using BeeYield IoT to monitor hive health in real-time. Reduce colony loss by up to 40%.', 'Start Free Trial', '/beeyield-login', 'primary')
ON CONFLICT DO NOTHING;
