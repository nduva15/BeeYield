-- BeeYield E-commerce Schema for Supabase

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'honey', 'merch', 'education'
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
    size TEXT NOT NULL, -- '500g', '1kg', 'L', 'XL', 'PDF'
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

-- 5. RLS Policies (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Public products are viewable by everyone" 
ON products FOR SELECT USING (true);

CREATE POLICY "Public variants are viewable by everyone" 
ON product_variants FOR SELECT USING (true);

-- Allow users to create orders
CREATE POLICY "Everyone can create orders" 
ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Everyone can create order items" 
ON order_items FOR INSERT WITH CHECK (true);

-- Allow users to view their own orders (if we implement auth later)
-- For now, just basic policies.
