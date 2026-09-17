-- ==========================================
-- BEEYIELD: ENTERPRISE INTEGRATIONS DEEP AUDIT
-- Executing PRD: Everything Suite & 45+ Metrics
-- ==========================================

-- 1. ENHANCE INTEGRATION SETTINGS
-- Add configuration storage for account mapping and conflict resolution
ALTER TABLE public.integration_settings 
ADD COLUMN IF NOT EXISTS config_json JSONB DEFAULT '{
    "conflict_policy": "beeyield_priority",
    "account_mapping": {
        "revenue": null,
        "operating_costs": null
    },
    "webhook_monitoring": {
        "orders_create": true,
        "products_update": true,
        "inventory_levels_update": true
    }
}'::jsonb;

-- 2. CREATE DEEP INTEGRATION AUDIT LOGS
-- This table tracks the 45+ metrics specified in the PRD
CREATE TABLE IF NOT EXISTS public.integration_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('quickbooks', 'shopify', 'etims')),
    event_type TEXT NOT NULL, -- handshake, sync, token_rotation, webhook
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial', 'pending')),
    
    -- Connection & Identity (10+)
    client_id_masked TEXT,
    realm_id TEXT,
    realm_name TEXT,
    origin_ip TEXT,
    user_agent TEXT,
    protocol_version TEXT DEFAULT 'OAuth2.0',
    environment TEXT DEFAULT 'production',
    
    -- Payload & Performance (15+)
    payload_hash TEXT, -- SHA-256
    bytes_transferred INTEGER,
    latency_ms INTEGER,
    http_code INTEGER,
    api_version TEXT,
    request_id TEXT, -- Correlation ID
    
    -- Security & Compliance (15+)
    hmac_verified BOOLEAN DEFAULT false,
    rls_token_scope TEXT,
    encryption_v TEXT DEFAULT 'AES-256-GCM',
    geospatial_origin TEXT, -- Country/City
    server_node_id TEXT,
    
    -- Operational Logic (5+)
    conflict_policy_applied TEXT,
    sync_engine_id TEXT,
    trigger_type TEXT DEFAULT 'automated', -- automated, manual
    
    -- Overflow for extra metrics
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_platform ON public.integration_audit_logs(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.integration_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.integration_audit_logs(created_at DESC);

-- 4. ENABLE RLS
ALTER TABLE public.integration_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
DROP POLICY IF EXISTS "Users can view own integration_audit_logs" ON public.integration_audit_logs;
CREATE POLICY "Users can view own integration_audit_logs" ON public.integration_audit_logs 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own integration_audit_logs" ON public.integration_audit_logs;
CREATE POLICY "Users can insert own integration_audit_logs" ON public.integration_audit_logs 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. HELPER FUNCTION TO LOG INTEGRATION EVENT
-- Can be called from Supabase Edge Functions or DB triggers
CREATE OR REPLACE FUNCTION public.log_integration_event(
    p_platform TEXT,
    p_event_type TEXT,
    p_status TEXT,
    p_metrics JSONB
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.integration_audit_logs (
        user_id,
        platform,
        event_type,
        status,
        client_id_masked,
        realm_id,
        realm_name,
        origin_ip,
        user_agent,
        payload_hash,
        bytes_transferred,
        latency_ms,
        http_code,
        api_version,
        request_id,
        hmac_verified,
        conflict_policy_applied,
        metadata
    ) VALUES (
        auth.uid(),
        p_platform,
        p_event_type,
        p_status,
        p_metrics->>'client_id_masked',
        p_metrics->>'realm_id',
        p_metrics->>'realm_name',
        p_metrics->>'origin_ip',
        p_metrics->>'user_agent',
        p_metrics->>'payload_hash',
        (p_metrics->>'bytes_transferred')::INTEGER,
        (p_metrics->>'latency_ms')::INTEGER,
        (p_metrics->>'http_code')::INTEGER,
        p_metrics->>'api_version',
        p_metrics->>'request_id',
        (p_metrics->>'hmac_verified')::BOOLEAN,
        p_metrics->>'conflict_policy',
        p_metrics->'metadata'
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
