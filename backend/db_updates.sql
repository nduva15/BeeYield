-- Database Schema Updates for Shop Dashboard

-- 1. User Wallets Table
CREATE TABLE IF NOT EXISTS public.user_wallets (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(12, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'KES',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'credit', 'debit'
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    reference_id VARCHAR(100), -- Order ID or Mpesa Ref
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Wishlist Table
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 4. User Addresses Table (Extended)
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100), -- e.g. "Home", "Office"
    email VARCHAR(255),
    phone VARCHAR(20),
    street TEXT,
    apartment VARCHAR(100),
    building VARCHAR(100),
    floor VARCHAR(50),
    city VARCHAR(100),
    county VARCHAR(100),
    postal_code VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Payment Methods Table
CREATE TABLE IF NOT EXISTS public.user_payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'card', 'mpesa'
    provider VARCHAR(50), -- 'Visa', 'Mastercard', 'Safaricom'
    last4 VARCHAR(4),
    expiry_month INT,
    expiry_year INT,
    card_holder_name VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Order Tracking Events
CREATE TABLE IF NOT EXISTS public.order_tracking_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- 'confirmed', 'shipped', 'out_for_delivery', 'delivered'
    location VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking_events ENABLE ROW LEVEL SECURITY;

-- Idempotent Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own wallet') THEN
        CREATE POLICY "Users can view own wallet" ON public.user_wallets FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own transactions') THEN
        CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own wishlist') THEN
        CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own addresses') THEN
        CREATE POLICY "Users can manage own addresses" ON public.user_addresses FOR ALL USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own payment methods') THEN
        CREATE POLICY "Users can manage own payment methods" ON public.user_payment_methods FOR ALL USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own order tracking') THEN
        CREATE POLICY "Users can view own order tracking" ON public.order_tracking_events FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_tracking_events.order_id AND orders.user_id = auth.uid())
        );
    END IF;

    -- Orders & Items
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own orders') THEN
        CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own order items') THEN
        CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
        );
    END IF;
END
$$;
