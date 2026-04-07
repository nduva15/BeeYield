-- ==========================================
-- BEEYIELD: eTIMS INTEGRATION & FINANCIAL COMPLIANCE
-- Aligning with PRD: eTIMS Integration & Financial Compliance
-- ==========================================

-- 1. Update billing_ledger with KRA eTIMS fields
ALTER TABLE public.billing_ledger 
    ADD COLUMN IF NOT EXISTS etims_receipt_number TEXT,
    ADD COLUMN IF NOT EXISTS etims_signature TEXT,
    ADD COLUMN IF NOT EXISTS etims_error_log TEXT,
    ADD COLUMN IF NOT EXISTS is_etims_synced BOOLEAN DEFAULT FALSE;

-- 2. Compliance Guard: Prevent deletion of synced transactions
CREATE OR REPLACE FUNCTION protect_synced_transactions()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.is_etims_synced = TRUE OR OLD.etims_status = 'synced') THEN
        RAISE EXCEPTION 'Compliance Guard: Synced transactions cannot be deleted for audit integrity.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_protect_synced_transactions ON public.billing_ledger;
CREATE TRIGGER trigger_protect_synced_transactions
    BEFORE DELETE ON public.billing_ledger
    FOR EACH ROW
    EXECUTE FUNCTION protect_synced_transactions();

-- 3. Update etims_status to be more descriptive if needed
-- (Assuming etims_status already exists from infrastructure_and_billing.sql)
-- etims_status IN ('pending', 'synced', 'failed')
