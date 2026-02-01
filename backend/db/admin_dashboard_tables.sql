-- ============================================
-- BeeYield Admin Dashboard Enhancement Tables
-- Activity Logging, Document Registry, Tracing History, Payments
-- ============================================

-- 1. ACTIVITY LOG (Master Audit Trail)
-- Tracks all activities across the platform
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type TEXT NOT NULL, -- 'trace', 'invoice', 'pdf', 'excel', 'payment', 'order', 'export', 'account', 'batch'
    action TEXT NOT NULL, -- 'created', 'viewed', 'downloaded', 'generated', 'updated', 'deleted'
    entity_type TEXT NOT NULL, -- 'batch', 'order', 'product', 'farmer', 'invoice', 'pdf', 'user' etc.
    entity_id UUID,
    entity_reference TEXT, -- batch_code, order_number, invoice_number, etc.
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    metadata JSONB DEFAULT '{}', -- Additional context data
    ip_address TEXT,
    user_agent TEXT,
    page_source TEXT, -- Which page triggered this activity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- 2. GENERATED DOCUMENTS REGISTRY
-- Tracks all PDFs, Excel files, and exports
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type TEXT NOT NULL, -- 'invoice', 'traceability_certificate', 'esg_report', 'impact_report', 'meter_report', 'export'
    document_name TEXT NOT NULL,
    file_format TEXT NOT NULL, -- 'pdf', 'xlsx', 'xls', 'csv'
    file_size_bytes INTEGER,
    file_url TEXT, -- If stored in Supabase Storage
    category TEXT, -- 'invoices', 'certificates', 'reports', 'exports'
    subcategory TEXT, -- 'traceability', 'meters', 'billing', 'orders'
    related_entity_type TEXT,
    related_entity_id UUID,
    related_entity_reference TEXT, -- batch_code, order_number, etc.
    generated_by_user_id UUID,
    generated_by_email TEXT,
    generated_by_name TEXT,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_documents_type ON generated_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_format ON generated_documents(file_format);
CREATE INDEX IF NOT EXISTS idx_documents_category ON generated_documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_created ON generated_documents(created_at DESC);

-- 3. TRACING HISTORY
-- Tracks all QR code scans and manual batch traces
CREATE TABLE IF NOT EXISTS tracing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_code TEXT NOT NULL,
    batch_id UUID,
    honey_type TEXT,
    farmer_name TEXT,
    apiary_name TEXT,
    traced_by_user_id UUID,
    traced_by_email TEXT,
    traced_by_name TEXT,
    is_authenticated BOOLEAN DEFAULT false, -- Was user logged in?
    traced_from_ip TEXT,
    trace_source TEXT NOT NULL, -- 'qr_scan', 'manual_entry', 'website_search', 'api'
    device_type TEXT, -- 'mobile', 'desktop', 'tablet'
    device_info TEXT, -- Browser/OS info
    location_country TEXT,
    location_city TEXT,
    location_data JSONB, -- Optional geolocation coordinates
    referrer_url TEXT, -- Where did they come from?
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_tracing_batch ON tracing_history(batch_code);
CREATE INDEX IF NOT EXISTS idx_tracing_source ON tracing_history(trace_source);
CREATE INDEX IF NOT EXISTS idx_tracing_created ON tracing_history(created_at DESC);

-- 4. PAYMENT TRANSACTIONS
-- Complete payment history for all orders
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID,
    order_number TEXT,
    customer_user_id UUID,
    customer_email TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    payment_method TEXT NOT NULL, -- 'mpesa', 'card', 'bank_transfer', 'cash'
    payment_provider TEXT, -- 'safaricom', 'stripe', 'paystack', 'flutterwave'
    transaction_id TEXT UNIQUE, -- External payment provider transaction ID
    amount_kes DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
    -- M-Pesa specific
    mpesa_receipt_number TEXT,
    mpesa_phone_number TEXT,
    mpesa_checkout_request_id TEXT,
    -- Card specific  
    card_brand TEXT, -- 'visa', 'mastercard', 'amex'
    card_last_four TEXT,
    card_country TEXT,
    -- General
    failure_reason TEXT,
    refund_reason TEXT,
    refund_amount DECIMAL(10, 2),
    metadata JSONB DEFAULT '{}',
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_payments_order ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payment_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payment_transactions(transaction_id);

-- 5. ACCOUNT REGISTRY (Enhanced User Tracking)
-- Complete user account information for admin visibility
CREATE TABLE IF NOT EXISTS account_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    account_type TEXT DEFAULT 'customer', -- 'customer', 'farmer', 'buyer', 'admin', 'super_admin'
    registration_source TEXT DEFAULT 'website', -- 'website', 'mobile_app', 'admin_created', 'api'
    registration_page TEXT, -- Which page did they sign up from?
    verification_status TEXT DEFAULT 'unverified', -- 'unverified', 'email_verified', 'phone_verified', 'fully_verified'
    is_email_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_spent_kes DECIMAL(12, 2) DEFAULT 0,
    favorite_products TEXT[],
    shipping_addresses JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    is_blocked BOOLEAN DEFAULT false,
    block_reason TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_accounts_email ON account_registry(email);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON account_registry(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON account_registry(verification_status);
CREATE INDEX IF NOT EXISTS idx_accounts_created ON account_registry(created_at DESC);

-- 6. INVOICE REGISTRY
-- Dedicated table for invoice tracking
CREATE TABLE IF NOT EXISTS invoice_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    order_id UUID,
    order_number TEXT,
    customer_user_id UUID,
    customer_email TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    billing_address JSONB,
    subtotal_kes DECIMAL(10, 2) NOT NULL,
    tax_kes DECIMAL(10, 2) DEFAULT 0,
    shipping_kes DECIMAL(10, 2) DEFAULT 0,
    discount_kes DECIMAL(10, 2) DEFAULT 0,
    total_kes DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded'
    payment_method TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,
    due_date DATE,
    items JSONB NOT NULL, -- Array of line items
    notes TEXT,
    terms TEXT,
    pdf_url TEXT,
    pdf_generated_at TIMESTAMP WITH TIME ZONE,
    sent_to_customer BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    generated_by_user_id UUID,
    generated_by_email TEXT,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoice_registry(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoice_registry(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoice_registry(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created ON invoice_registry(created_at DESC);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to log an activity
CREATE OR REPLACE FUNCTION log_activity(
    p_activity_type TEXT,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_entity_reference TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_user_email TEXT DEFAULT NULL,
    p_user_name TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::JSONB,
    p_page_source TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO activity_logs (
        activity_type, action, entity_type, entity_id, entity_reference,
        user_id, user_email, user_name, metadata, page_source
    ) VALUES (
        p_activity_type, p_action, p_entity_type, p_entity_id, p_entity_reference,
        p_user_id, p_user_email, p_user_name, p_metadata, p_page_source
    ) RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$;

-- Function to log a document generation
CREATE OR REPLACE FUNCTION log_document(
    p_document_type TEXT,
    p_document_name TEXT,
    p_file_format TEXT,
    p_category TEXT,
    p_subcategory TEXT DEFAULT NULL,
    p_related_entity_type TEXT DEFAULT NULL,
    p_related_entity_id UUID DEFAULT NULL,
    p_related_entity_reference TEXT DEFAULT NULL,
    p_generated_by_user_id UUID DEFAULT NULL,
    p_generated_by_email TEXT DEFAULT NULL,
    p_generated_by_name TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO generated_documents (
        document_type, document_name, file_format, category, subcategory,
        related_entity_type, related_entity_id, related_entity_reference,
        generated_by_user_id, generated_by_email, generated_by_name, metadata
    ) VALUES (
        p_document_type, p_document_name, p_file_format, p_category, p_subcategory,
        p_related_entity_type, p_related_entity_id, p_related_entity_reference,
        p_generated_by_user_id, p_generated_by_email, p_generated_by_name, p_metadata
    ) RETURNING id INTO new_id;
    
    -- Also log as activity
    PERFORM log_activity(
        'document',
        'generated',
        p_document_type,
        new_id,
        p_document_name,
        p_generated_by_user_id,
        p_generated_by_email,
        p_generated_by_name,
        p_metadata
    );
    
    RETURN new_id;
END;
$$;

-- Function to log a trace event
CREATE OR REPLACE FUNCTION log_trace(
    p_batch_code TEXT,
    p_batch_id UUID DEFAULT NULL,
    p_honey_type TEXT DEFAULT NULL,
    p_farmer_name TEXT DEFAULT NULL,
    p_apiary_name TEXT DEFAULT NULL,
    p_traced_by_user_id UUID DEFAULT NULL,
    p_traced_by_email TEXT DEFAULT NULL,
    p_traced_by_name TEXT DEFAULT NULL,
    p_trace_source TEXT DEFAULT 'website_search',
    p_device_type TEXT DEFAULT NULL,
    p_device_info TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO tracing_history (
        batch_code, batch_id, honey_type, farmer_name, apiary_name,
        traced_by_user_id, traced_by_email, traced_by_name,
        is_authenticated, trace_source, device_type, device_info
    ) VALUES (
        p_batch_code, p_batch_id, p_honey_type, p_farmer_name, p_apiary_name,
        p_traced_by_user_id, p_traced_by_email, p_traced_by_name,
        p_traced_by_user_id IS NOT NULL, p_trace_source, p_device_type, p_device_info
    ) RETURNING id INTO new_id;
    
    -- Also log as activity
    PERFORM log_activity(
        'trace',
        'viewed',
        'batch',
        p_batch_id,
        p_batch_code,
        p_traced_by_user_id,
        p_traced_by_email,
        p_traced_by_name,
        jsonb_build_object('honey_type', p_honey_type, 'farmer', p_farmer_name, 'apiary', p_apiary_name)
    );
    
    RETURN new_id;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_registry ENABLE ROW LEVEL SECURITY;

-- Admin-only read access (these are sensitive logs)
-- Note: In production, create specific admin role checks

-- For development: Allow authenticated users to read (will restrict in production)
DROP POLICY IF EXISTS "Admin read activity_logs" ON activity_logs;
CREATE POLICY "Admin read activity_logs" ON activity_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin read generated_documents" ON generated_documents;
CREATE POLICY "Admin read generated_documents" ON generated_documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin read tracing_history" ON tracing_history;
CREATE POLICY "Admin read tracing_history" ON tracing_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin read payment_transactions" ON payment_transactions;
CREATE POLICY "Admin read payment_transactions" ON payment_transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin read account_registry" ON account_registry;
CREATE POLICY "Admin read account_registry" ON account_registry FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin read invoice_registry" ON invoice_registry;
CREATE POLICY "Admin read invoice_registry" ON invoice_registry FOR SELECT USING (true);

-- Insert policies for logging (anyone can log, but not read all)
DROP POLICY IF EXISTS "Public insert activity_logs" ON activity_logs;
CREATE POLICY "Public insert activity_logs" ON activity_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert generated_documents" ON generated_documents;
CREATE POLICY "Public insert generated_documents" ON generated_documents FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert tracing_history" ON tracing_history;
CREATE POLICY "Public insert tracing_history" ON tracing_history FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert payment_transactions" ON payment_transactions;
CREATE POLICY "Public insert payment_transactions" ON payment_transactions FOR INSERT WITH CHECK (true);

-- ============================================
-- AGGREGATE VIEWS FOR DASHBOARD STATS
-- ============================================

-- View for today's activity summary
CREATE OR REPLACE VIEW admin_activity_summary AS
SELECT
    DATE(created_at) as date,
    activity_type,
    action,
    entity_type,
    COUNT(*) as count
FROM activity_logs
WHERE created_at >= CURRENT_DATE
GROUP BY DATE(created_at), activity_type, action, entity_type
ORDER BY count DESC;

-- View for document generation summary
CREATE OR REPLACE VIEW admin_document_summary AS
SELECT
    DATE(created_at) as date,
    document_type,
    file_format,
    category,
    COUNT(*) as count,
    SUM(download_count) as total_downloads
FROM generated_documents
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), document_type, file_format, category
ORDER BY date DESC, count DESC;

-- View for tracing summary
CREATE OR REPLACE VIEW admin_tracing_summary AS
SELECT
    DATE(created_at) as date,
    trace_source,
    device_type,
    COUNT(*) as trace_count,
    COUNT(DISTINCT batch_code) as unique_batches,
    COUNT(DISTINCT traced_by_user_id) FILTER (WHERE is_authenticated) as authenticated_traces
FROM tracing_history
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), trace_source, device_type
ORDER BY date DESC, trace_count DESC;

-- View for payment summary
CREATE OR REPLACE VIEW admin_payment_summary AS
SELECT
    DATE(created_at) as date,
    payment_method,
    status,
    COUNT(*) as transaction_count,
    SUM(amount_kes) as total_amount,
    AVG(amount_kes) as avg_amount
FROM payment_transactions
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), payment_method, status
ORDER BY date DESC, total_amount DESC;

-- ============================================
-- SEED SOME TEST DATA (Optional)
-- ============================================

-- Insert sample activity for testing
INSERT INTO activity_logs (activity_type, action, entity_type, entity_reference, user_email, metadata, page_source)
VALUES 
    ('trace', 'viewed', 'batch', 'KBZ-2024-001', 'test@example.com', '{"honey_type": "Acacia Wildflower", "farmer": "James Mwangi"}', 'traceability'),
    ('document', 'generated', 'invoice', 'INV-2024-001', 'admin@beeyield.com', '{"order_number": "BY-20240131-0001"}', 'buyer_dashboard'),
    ('export', 'downloaded', 'excel', 'meters_list_water.xlsx', 'admin@beeyield.com', '{"category": "meters"}', 'beeyield_dashboard'),
    ('account', 'created', 'user', NULL, 'newuser@test.com', '{"registration_source": "website"}', 'authentication');

-- Insert sample document
INSERT INTO generated_documents (document_type, document_name, file_format, category, subcategory, related_entity_reference)
VALUES 
    ('traceability_certificate', 'BeeYield-Traceability-KBZ-2024-001.pdf', 'pdf', 'certificates', 'traceability', 'KBZ-2024-001'),
    ('invoice', 'Invoice-BY-20240131-0001.pdf', 'pdf', 'invoices', 'orders', 'BY-20240131-0001'),
    ('export', 'meters_list_water.xlsx', 'xlsx', 'exports', 'meters', NULL);

-- Insert sample trace
INSERT INTO tracing_history (batch_code, honey_type, farmer_name, apiary_name, trace_source, device_type)
VALUES 
    ('KBZ-2024-001', 'Acacia Wildflower', 'James Mwangi', 'Kibwezi Apiary Alpha', 'qr_scan', 'mobile'),
    ('KBZ-2024-002', 'Forest Honey', 'Mary Wanjiku', 'Mbuinzau Forest Apiary', 'website_search', 'desktop');

COMMIT;
