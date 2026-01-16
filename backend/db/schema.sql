-- BeeYield E-commerce Schema for Supabase

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'honey', 'merch', 'education', 'sensors'
    badge TEXT, -- 'Bestseller', 'New', 'Premium'
    rating FLOAT DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Product Variants (Sizes/Types)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL, -- '500g', '1kg', 'L', 'XL', 'PDF', 'Standard'
    price_kes DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 100,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID, -- Optional, for logged in users
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'shipped', 'completed', 'cancelled'
    payment_method TEXT, -- 'mpesa', 'card'
    payment_status TEXT DEFAULT 'pending',
    total_kes DECIMAL(10, 2) NOT NULL,
    shipping_address JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    product_name TEXT,
    variant_size TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 5. Profiles (for Users/Admins) - mirrors auth.users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- Linked to auth.users
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'user', -- 'admin', 'user'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 6. Farmers
CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    county TEXT,
    region TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 7. Honey Batches (Traceability)
CREATE TABLE IF NOT EXISTS honey_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_code TEXT NOT NULL UNIQUE,
    honey_type TEXT NOT NULL,
    harvest_date DATE,
    packaged_date DATE,
    quantity_kg NUMERIC NOT NULL,
    processing_method TEXT,
    farmer_name TEXT,
    location_county TEXT,
    location_region TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    quality_grade TEXT,
    certifications TEXT[],
    moisture_content NUMERIC,
    color_grade TEXT,
    status TEXT DEFAULT 'verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 8. Apiaries
CREATE TABLE IF NOT EXISTS apiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location_name TEXT,
    county TEXT,
    region TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    farmer_id UUID REFERENCES farmers(id),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 9. Hives
CREATE TABLE IF NOT EXISTS hives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_code TEXT NOT NULL,
    apiary_id UUID REFERENCES apiaries(id) ON DELETE CASCADE,
    type TEXT,
    status TEXT DEFAULT 'active',
    installation_date DATE,
    last_inspection_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 10. Pollination Requests
CREATE TABLE IF NOT EXISTS pollination_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    crop_type TEXT,
    acres NUMERIC,
    preferred_date DATE,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 11. Contact Submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 12. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'subscribed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 13. Stock Movements
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
    quantity INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- RLS Policies (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE honey_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE apiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hives ENABLE ROW LEVEL SECURITY;
ALTER TABLE pollination_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON products;
CREATE POLICY "Public products are viewable by everyone" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public variants are viewable by everyone" ON product_variants;
CREATE POLICY "Public variants are viewable by everyone" ON product_variants FOR SELECT USING (true);

-- Allow public read access to other entities for this demo (dashboard needs to read them)
-- In production, these should be restricted to admin only
DROP POLICY IF EXISTS "Enable read access for all users" ON farmers;
CREATE POLICY "Enable read access for all users" ON farmers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON honey_batches;
CREATE POLICY "Enable read access for all users" ON honey_batches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON apiaries;
CREATE POLICY "Enable read access for all users" ON apiaries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON hives;
CREATE POLICY "Enable read access for all users" ON hives FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON pollination_requests;
CREATE POLICY "Enable read access for all users" ON pollination_requests FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON contact_submissions;
CREATE POLICY "Enable read access for all users" ON contact_submissions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON newsletter_subscribers;
CREATE POLICY "Enable read access for all users" ON newsletter_subscribers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON stock_movements;
CREATE POLICY "Enable read access for all users" ON stock_movements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
CREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (true);

-- Allow insert/update/delete for everyone (DEMO MODE - UNSECURE)
-- This allows the admin seeding functions to work without strict auth roles
DROP POLICY IF EXISTS "Enable insert for all users" ON products;
CREATE POLICY "Enable insert for all users" ON products FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for all users" ON products;
CREATE POLICY "Enable update for all users" ON products FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable insert for all users" ON product_variants;
CREATE POLICY "Enable insert for all users" ON product_variants FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable all for all users" ON orders;
CREATE POLICY "Enable all for all users" ON orders FOR ALL USING (true);
DROP POLICY IF EXISTS "Enable all for all users" ON order_items;
CREATE POLICY "Enable all for all users" ON order_items FOR ALL USING (true);
DROP POLICY IF EXISTS "Enable all for all users" ON farmers;
CREATE POLICY "Enable all for all users" ON farmers FOR ALL USING (true);
DROP POLICY IF EXISTS "Enable all for all users" ON honey_batches;
CREATE POLICY "Enable all for all users" ON honey_batches FOR ALL USING (true);
DROP POLICY IF EXISTS "Enable all for all users" ON apiaries;
CREATE POLICY "Enable all for all users" ON apiaries FOR ALL USING (true);
DROP POLICY IF EXISTS "Enable all for all users" ON hives;
CREATE POLICY "Enable all for all users" ON hives FOR ALL USING (true);
DROP POLICY IF EXISTS "Enable all for all users" ON pollination_requests;
CREATE POLICY "Enable all for all users" ON pollination_requests FOR ALL USING (true);
DROP POLICY IF EXISTS "Enable all for all users" ON contact_submissions;
CREATE POLICY "Enable all for all users" ON contact_submissions FOR ALL USING (true);
DROP POLICY IF EXISTS "Enable all for all users" ON newsletter_subscribers;
CREATE POLICY "Enable all for all users" ON newsletter_subscribers FOR ALL USING (true);
DROP POLICY IF EXISTS "Enable all for all users" ON stock_movements;
CREATE POLICY "Enable all for all users" ON stock_movements FOR ALL USING (true);
