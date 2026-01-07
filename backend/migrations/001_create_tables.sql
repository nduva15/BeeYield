-- ============================================================
-- BEEYIELD DATABASE SCHEMA - SUPABASE TABLES
-- Run this in Supabase SQL Editor (Dashboard > SQL)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS & PROFILES
-- ============================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'beekeeper', 'admin', 'staff')),
    avatar_url TEXT,
    company_name TEXT,
    address JSONB,
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- 2. COMPANY CONTENT (About, Story, Team, etc.)
-- ============================================================

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT,
    bio TEXT,
    image_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    email TEXT,
    display_order INT DEFAULT 0,
    is_leadership BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Story / Timeline
CREATE TABLE IF NOT EXISTS company_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    milestone_type TEXT DEFAULT 'general',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Statistics (for Impact page)
CREATE TABLE IF NOT EXISTS company_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stat_key TEXT UNIQUE NOT NULL,
    stat_value TEXT NOT NULL,
    stat_label TEXT NOT NULL,
    stat_description TEXT,
    icon TEXT,
    display_order INT DEFAULT 0,
    category TEXT DEFAULT 'impact',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. BLOG / CMS
-- ============================================================

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    author_id UUID REFERENCES profiles(id),
    author_name TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    read_time_minutes INT DEFAULT 5,
    views_count INT DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);

-- ============================================================
-- 4. MEDIA / PRESS
-- ============================================================

CREATE TABLE IF NOT EXISTS media_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    media_type TEXT CHECK (media_type IN ('press_release', 'news', 'video', 'image', 'document')),
    url TEXT,
    thumbnail_url TEXT,
    source_name TEXT,
    source_url TEXT,
    published_date DATE,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. CAREERS / JOBS
-- ============================================================

CREATE TABLE IF NOT EXISTS job_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    department TEXT,
    location TEXT,
    job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
    experience_level TEXT,
    description TEXT,
    requirements TEXT[],
    benefits TEXT[],
    salary_range TEXT,
    is_remote BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    applications_count INT DEFAULT 0,
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    closes_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES job_positions(id),
    job_title TEXT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    resume_url TEXT,
    cover_letter_url TEXT,
    linkedin_url TEXT,
    years_experience INT,
    availability_date DATE,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interviewed', 'offered', 'hired', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. CONTACT SUBMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_type TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    topic TEXT,
    message TEXT,
    form_specific_data JSONB,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
    assigned_to UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pollination_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    farm_name TEXT,
    farm_location TEXT,
    crop_type TEXT,
    acres INT,
    preferred_start_date DATE,
    additional_info TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'quoted', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. NEWSLETTER
-- ============================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    source TEXT DEFAULT 'website',
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- ============================================================
-- 8. DONATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_name TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    amount_usd DECIMAL(10,2) NOT NULL,
    donation_type TEXT CHECK (donation_type IN ('onetime', 'monthly')),
    tier TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_reference TEXT,
    subscribe_to_updates BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. TRACEABILITY (Blockchain records)
-- ============================================================

CREATE TABLE IF NOT EXISTS hives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hive_code TEXT UNIQUE NOT NULL,
    apiary_name TEXT NOT NULL,
    location_name TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    environment_type TEXT,
    hive_type TEXT,
    installation_date DATE,
    beekeeper_id UUID REFERENCES profiles(id),
    beekeeper_name TEXT,
    blockchain_hash TEXT,
    blockchain_index INT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS harvests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    harvest_code TEXT UNIQUE NOT NULL,
    hive_id UUID REFERENCES hives(id),
    harvest_date DATE NOT NULL,
    harvester_name TEXT,
    quantity_harvested_kg DECIMAL(10,2),
    quantity_left_for_bees_kg DECIMAL(10,2),
    extraction_method TEXT,
    quality_grade TEXT,
    notes TEXT,
    blockchain_hash TEXT,
    blockchain_index INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_code TEXT UNIQUE NOT NULL,
    harvest_ids UUID[],
    processing_date DATE,
    processing_facility TEXT,
    processing_notes TEXT,
    total_quantity_kg DECIMAL(10,2),
    honey_type TEXT,
    floral_source TEXT,
    quality_certifications TEXT[],
    lab_results JSONB,
    blockchain_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. SHOP / E-COMMERCE
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    category TEXT,
    badge TEXT,
    images TEXT[] DEFAULT '{}',
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    traceability_batch_id UUID REFERENCES batches(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    size TEXT NOT NULL,
    price_kes DECIMAL(10,2) NOT NULL,
    price_usd DECIMAL(10,2),
    stock_quantity INT DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id),
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    shipping_address JSONB,
    billing_address JSONB,
    subtotal_kes DECIMAL(10,2),
    shipping_kes DECIMAL(10,2) DEFAULT 0,
    tax_kes DECIMAL(10,2) DEFAULT 0,
    total_kes DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_reference TEXT,
    order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    product_name TEXT,
    variant_size TEXT,
    quantity INT NOT NULL,
    unit_price_kes DECIMAL(10,2) NOT NULL,
    total_price_kes DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    reviewer_name TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. SERVICES (Pollination solutions)
-- ============================================================

CREATE TABLE IF NOT EXISTS pollination_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    icon TEXT,
    features TEXT[],
    benefits TEXT[],
    pricing_info TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crops_pollinated (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    icon TEXT,
    pollination_info TEXT,
    season TEXT,
    region TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. LEARNING / BEE LEARN
-- ============================================================

CREATE TABLE IF NOT EXISTS learning_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    category TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    duration_minutes INT,
    is_free BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    duration_minutes INT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. ESG / IMPACT DATA
-- ============================================================

CREATE TABLE IF NOT EXISTS esg_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_key TEXT UNIQUE NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2),
    metric_unit TEXT,
    category TEXT CHECK (category IN ('environmental', 'social', 'governance')),
    description TEXT,
    reporting_period TEXT,
    year INT,
    is_verified BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS impact_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    content TEXT,
    image_url TEXT,
    video_url TEXT,
    impact_type TEXT,
    location TEXT,
    beneficiaries_count INT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. GLOBAL HIVE NETWORK
-- ============================================================

CREATE TABLE IF NOT EXISTS apiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location_name TEXT,
    country TEXT,
    region TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    hive_count INT DEFAULT 0,
    beekeeper_count INT DEFAULT 0,
    established_date DATE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS FOR updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_pollination_requests_status ON pollination_requests(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_hives_code ON hives(hive_code);
CREATE INDEX IF NOT EXISTS idx_batches_code ON batches(batch_code);

-- ============================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================

-- Insert sample team members
INSERT INTO team_members (name, role, department, bio, is_leadership, display_order) VALUES
('Samuel Maina', 'CEO & Co-Founder', 'Leadership', 'Passionate about sustainable beekeeping and empowering African beekeepers.', true, 1),
('Grace Wanjiku', 'COO', 'Leadership', 'Operations expert with 15 years in agricultural supply chains.', true, 2),
('Timothy Nduva', 'Head of Beekeeping', 'Operations', 'Third-generation beekeeper from Kibwezi.', true, 3)
ON CONFLICT DO NOTHING;

-- Insert sample company stats
INSERT INTO company_stats (stat_key, stat_value, stat_label, stat_description, category, display_order) VALUES
('farmers_supported', '500+', 'Farmers Supported', 'Smallholder farmers benefiting from our pollination services', 'impact', 1),
('hives_managed', '10,000+', 'Hives Managed', 'Active beehives across our network in East Africa', 'impact', 2),
('honey_produced', '50,000', 'Liters of Honey', 'Annual honey production from our sustainable operations', 'impact', 3),
('countries', '3', 'Countries', 'Kenya, Tanzania, and Uganda', 'impact', 4)
ON CONFLICT DO NOTHING;

-- Insert sample pollination services
INSERT INTO pollination_services (name, slug, short_description, features, display_order) VALUES
('In-Land Pollination', 'in-land-pollination', 'Precision pollination services for large-scale farms', ARRAY['GPS-tracked hives', '24/7 monitoring', 'Certified beekeepers'], 1),
('Precision Pollination', 'precision-pollination', 'Data-driven pollination optimization', ARRAY['AI-powered placement', 'Yield analytics', 'Weather integration'], 2),
('Contract Pollination', 'contract-pollination', 'Seasonal pollination for specific crops', ARRAY['Flexible contracts', 'Custom hive counts', 'Quality guarantee'], 3)
ON CONFLICT DO NOTHING;

-- Insert sample crops
INSERT INTO crops_pollinated (name, slug, description, display_order) VALUES
('Avocado', 'avocado', 'Premium pollination for avocado orchards', 1),
('Macadamia', 'macadamia', 'Specialized pollination for macadamia nuts', 2),
('Coffee', 'coffee', 'Enhance coffee bean yields with bee pollination', 3),
('Sunflower', 'sunflower', 'Large-scale sunflower pollination services', 4)
ON CONFLICT DO NOTHING;

COMMIT;
