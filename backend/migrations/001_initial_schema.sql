-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 🐝 TRACEABILITY TABLES --

CREATE TABLE IF NOT EXISTS hives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hive_code VARCHAR(50) UNIQUE NOT NULL,
    apiary_name VARCHAR(255) NOT NULL,
    location_name VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    altitude_meters INTEGER,
    environment_type VARCHAR(100),
    hive_type VARCHAR(100),
    installation_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    blockchain_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS colonies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hive_id UUID REFERENCES hives(id),
    colony_code VARCHAR(50) UNIQUE,
    queen_age_months INTEGER,
    queen_origin VARCHAR(255),
    bee_species VARCHAR(100),
    population_estimate INTEGER,
    health_status VARCHAR(50),
    last_inspection_date DATE,
    notes TEXT,
    blockchain_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS flower_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hive_id UUID REFERENCES hives(id),
    flower_type VARCHAR(100) NOT NULL,
    bloom_start_month INTEGER,
    bloom_end_month INTEGER,
    contribution_percentage INTEGER,
    is_pesticide_free BOOLEAN DEFAULT TRUE,
    distance_from_hive_km DECIMAL(5, 2),
    nectar_flow_rating VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS harvests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    harvest_code VARCHAR(50) UNIQUE NOT NULL,
    hive_id UUID REFERENCES hives(id),
    harvest_date DATE NOT NULL,
    harvester_name VARCHAR(255),
    quantity_harvested_kg DECIMAL(10, 2),
    quantity_left_for_bees_kg DECIMAL(10, 2),
    extraction_method VARCHAR(100),
    weather_temperature_c DECIMAL(4, 1),
    weather_humidity_percent INTEGER,
    frames_harvested INTEGER,
    notes TEXT,
    blockchain_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS processing_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    harvest_id UUID REFERENCES harvests(id),
    processing_date DATE NOT NULL,
    processing_location VARCHAR(255),
    filtration_level VARCHAR(50),
    heating_applied VARCHAR(100),
    moisture_content_percent DECIMAL(4, 2),
    hmf_level DECIMAL(6, 2),
    diastase_number DECIMAL(5, 2),
    quality_grade VARCHAR(50),
    lab_test_results JSONB,
    blockchain_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_code VARCHAR(50) UNIQUE NOT NULL,
    processing_id UUID REFERENCES processing_records(id),
    bottle_date DATE,
    total_quantity_kg DECIMAL(10, 2),
    bottle_sizes_available JSONB,
    expiry_date DATE,
    packaging_location VARCHAR(255),
    certifications TEXT[],
    blockchain_hash VARCHAR(255),
    qr_code_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS blockchain_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    block_index INTEGER NOT NULL,
    previous_hash VARCHAR(255) NOT NULL,
    current_hash VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    record_type VARCHAR(50),
    record_id UUID,
    data JSONB,
    digital_signature VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 🛒 SHOP TABLES --

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    category VARCHAR(50),
    badge VARCHAR(50),
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    images TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    size VARCHAR(50),
    price_kes DECIMAL(10, 2),
    stock_quantity INTEGER DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    is_available BOOLEAN DEFAULT TRUE
);

-- Note: 'users' table is usually managed by Supabase Auth (auth.users)
-- We'll create a public profiles table to extend user data if needed, 
-- or we can rely on auth user metadata. For this PRD, let's assume we map 
-- auth.users to a public table for easier relation handling if we want 
-- application-specific logic separate from auth.
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    label VARCHAR(50),
    street_address TEXT,
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE,
    user_id UUID REFERENCES profiles(id),
    status VARCHAR(50) DEFAULT 'pending',
    subtotal_kes DECIMAL(10, 2),
    shipping_fee_kes DECIMAL(10, 2),
    total_kes DECIMAL(10, 2),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    payment_reference VARCHAR(255),
    shipping_address JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    batch_id UUID REFERENCES batches(id),
    quantity INTEGER,
    unit_price_kes DECIMAL(10, 2),
    total_price_kes DECIMAL(10, 2)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    session_id VARCHAR(255),
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    user_id UUID REFERENCES profiles(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    product_id UUID REFERENCES products(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 📝 FORM SUBMISSIONS --

CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_type VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    company VARCHAR(255),
    topic VARCHAR(100),
    message TEXT,
    form_specific_data JSONB,
    status VARCHAR(50) DEFAULT 'new',
    assigned_to UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS pollination_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    farm_name VARCHAR(255),
    farm_location VARCHAR(255),
    crop_type VARCHAR(100),
    acres INTEGER,
    preferred_start_date DATE,
    additional_info TEXT,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_position VARCHAR(255),
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    resume_url VARCHAR(500),
    cover_letter_url VARCHAR(500),
    linkedin_profile VARCHAR(500),
    years_experience INTEGER,
    availability_date DATE,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'received',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    source VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 📰 CONTENT MANAGEMENT --

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    excerpt TEXT,
    content TEXT,
    featured_image VARCHAR(500),
    category VARCHAR(100),
    tags TEXT[],
    author_id UUID REFERENCES profiles(id),
    status VARCHAR(50) DEFAULT 'draft',
    read_time_minutes INTEGER,
    seo_title VARCHAR(255),
    seo_description TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS job_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    location VARCHAR(255),
    employment_type VARCHAR(50),
    department VARCHAR(100),
    description TEXT,
    requirements TEXT[],
    responsibilities TEXT[],
    salary_range VARCHAR(100),
    status VARCHAR(50) DEFAULT 'open',
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    closing_date DATE
);

-- 💰 DONATIONS --

CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_name VARCHAR(255),
    donor_email VARCHAR(255),
    amount_usd DECIMAL(10, 2),
    donation_type VARCHAR(50),
    tier VARCHAR(50),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    payment_reference VARCHAR(255),
    subscribe_to_updates BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create a helper function to automatically update 'updated_at' columns
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables with updated_at
CREATE TRIGGER update_hives_modtime BEFORE UPDATE ON hives FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_blog_posts_modtime BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
