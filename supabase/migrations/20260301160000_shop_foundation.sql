-- Migration to ensure base shop tables exist
-- Required for Checkout & Oxidized Financial Core

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    total_kes DECIMAL(12, 2) NOT NULL,
    shipping_address JSONB NOT NULL,
    payment_method TEXT, -- mpesa, card
    payment_status TEXT DEFAULT 'pending',
    notes TEXT,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BILLING LEDGER (for Oxidized Idempotency Core)
CREATE TABLE IF NOT EXISTS public.billing_ledger (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    status TEXT DEFAULT 'processing', -- processing, completed, failed
    idempotency_key TEXT UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_ledger ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
    -- Orders
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'service_role_all') THEN
        CREATE POLICY "service_role_all" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users manage own orders') THEN
        CREATE POLICY "Users manage own orders" ON public.orders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Order Items
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'service_role_all') THEN
        CREATE POLICY "service_role_all" ON public.order_items FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Users view own order items') THEN
        CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT TO authenticated USING (
            EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
        );
    END IF;

    -- Billing Ledger
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billing_ledger' AND policyname = 'service_role_all') THEN
        CREATE POLICY "service_role_all" ON public.billing_ledger FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;
