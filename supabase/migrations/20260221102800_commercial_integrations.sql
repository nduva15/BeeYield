-- ==========================================
-- BEEYIELD: COMMERCIAL INTEGRATIONS (Sync Recovery)
-- ==========================================

-- 1. INTEGRATION SETTINGS & TOKENS
CREATE TABLE IF NOT EXISTS public.integration_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('etims', 'quickbooks', 'shopify')),
    is_active BOOLEAN DEFAULT false,
    access_token TEXT,
    refresh_token TEXT,
    store_url TEXT, -- For Shopify
    kra_pin TEXT,   -- For eTIMS
    branch_code TEXT DEFAULT '00',
    device_serial TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- 2. EXTENDING BILLING_LEDGER FOR eTIMS & QUICKBOOKS
-- We use DO block to safely add columns if they are missing
DO $$
BEGIN
    -- Check if table exists before altering
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'billing_ledger') THEN
        
        -- QuickBooks Fields
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='billing_ledger' AND column_name='qb_invoice_id') THEN
            ALTER TABLE public.billing_ledger ADD COLUMN qb_invoice_id TEXT UNIQUE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='billing_ledger' AND column_name='qb_sync_status') THEN
            ALTER TABLE public.billing_ledger ADD COLUMN qb_sync_status TEXT DEFAULT 'pending' CHECK (qb_sync_status IN ('pending', 'synced', 'failed'));
        END IF;

        -- eTIMS Compliance Fields
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='billing_ledger' AND column_name='etims_receipt_number') THEN
            ALTER TABLE public.billing_ledger ADD COLUMN etims_receipt_number TEXT UNIQUE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='billing_ledger' AND column_name='etims_control_code') THEN
            ALTER TABLE public.billing_ledger ADD COLUMN etims_control_code TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='billing_ledger' AND column_name='etims_qr_url') THEN
            ALTER TABLE public.billing_ledger ADD COLUMN etims_qr_url TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='billing_ledger' AND column_name='invoice_status') THEN
            ALTER TABLE public.billing_ledger ADD COLUMN invoice_status TEXT DEFAULT 'draft' CHECK (invoice_status IN ('draft', 'issued', 'paid', 'cancelled'));
        END IF;
    END IF;
END $$;

-- 3. EXTENDING HARVESTS FOR SHOPIFY
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'harvests') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='harvests' AND column_name='shopify_product_id') THEN
            ALTER TABLE public.harvests ADD COLUMN shopify_product_id TEXT;
            ALTER TABLE public.harvests ADD COLUMN shopify_inventory_item_id TEXT;
            ALTER TABLE public.harvests ADD COLUMN is_listed_online BOOLEAN DEFAULT false;
        END IF;
    END IF;
END $$;

-- 4. ENABLE RLS
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
DROP POLICY IF EXISTS "Users can view own integration_settings" ON public.integration_settings;
CREATE POLICY "Users can view own integration_settings" ON public.integration_settings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own integration_settings" ON public.integration_settings;
CREATE POLICY "Users can insert own integration_settings" ON public.integration_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own integration_settings" ON public.integration_settings;
CREATE POLICY "Users can update own integration_settings" ON public.integration_settings FOR UPDATE USING (auth.uid() = user_id);

-- 6. TRIGGER FOR updated_at
DROP TRIGGER IF EXISTS update_integration_settings_updated_at ON public.integration_settings;
CREATE TRIGGER update_integration_settings_updated_at BEFORE UPDATE ON public.integration_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
