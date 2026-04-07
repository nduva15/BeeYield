-- ==========================================
-- Production-ready M-PESA C2B intake hardening
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILE + WALLET NORMALIZATION
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS phone_normalized TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_phone_normalized
    ON public.profiles(phone_normalized);

ALTER TABLE public.wallets
    ADD COLUMN IF NOT EXISTS account_reference TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_account_reference
    ON public.wallets(account_reference)
    WHERE account_reference IS NOT NULL;

ALTER TABLE public.wallet_transactions
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS external_reference TEXT,
    ADD COLUMN IF NOT EXISTS source_channel TEXT DEFAULT 'manual';

-- 2. BILLING LEDGER C2B COLUMNS
ALTER TABLE public.billing_ledger
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.billing_ledger
    ADD COLUMN IF NOT EXISTS transaction_type TEXT,
    ADD COLUMN IF NOT EXISTS module_type TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
    ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS trans_id TEXT,
    ADD COLUMN IF NOT EXISTS bill_ref_number TEXT,
    ADD COLUMN IF NOT EXISTS msisdn_normalized TEXT,
    ADD COLUMN IF NOT EXISTS mpesa_type TEXT,
    ADD COLUMN IF NOT EXISTS routing_target_type TEXT,
    ADD COLUMN IF NOT EXISTS routing_target_id TEXT,
    ADD COLUMN IF NOT EXISTS reconciliation_status TEXT DEFAULT 'received';

CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_ledger_trans_id
    ON public.billing_ledger(trans_id)
    WHERE trans_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_billing_ledger_reconciliation_status
    ON public.billing_ledger(reconciliation_status);

CREATE INDEX IF NOT EXISTS idx_billing_ledger_mpesa_type
    ON public.billing_ledger(mpesa_type);

CREATE INDEX IF NOT EXISTS idx_billing_ledger_bill_ref_number
    ON public.billing_ledger(bill_ref_number);

-- 3. AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.mpesa_c2b_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ledger_id UUID REFERENCES public.billing_ledger(id) ON DELETE SET NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('validation', 'confirmation')),
    trans_id TEXT,
    bill_ref_number TEXT,
    normalized_msisdn TEXT,
    amount DECIMAL(15, 2),
    shortcode TEXT,
    transaction_type TEXT,
    source_ip TEXT,
    immediate_ip TEXT,
    disposition TEXT NOT NULL CHECK (disposition IN ('received', 'rejected', 'duplicate', 'processed', 'needs_reconciliation')),
    failure_reason TEXT,
    matched_entity_type TEXT,
    matched_entity_id TEXT,
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mpesa_c2b_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'mpesa_c2b_audit_logs'
          AND policyname = 'service_role_all'
    ) THEN
        CREATE POLICY "service_role_all"
        ON public.mpesa_c2b_audit_logs
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

DROP TRIGGER IF EXISTS update_mpesa_c2b_audit_logs_updated_at ON public.mpesa_c2b_audit_logs;
CREATE TRIGGER update_mpesa_c2b_audit_logs_updated_at
BEFORE UPDATE ON public.mpesa_c2b_audit_logs
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- 4. SHARED NORMALIZATION HELPERS
CREATE OR REPLACE FUNCTION public.normalize_kenyan_msisdn(input_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    digits TEXT;
BEGIN
    IF input_phone IS NULL THEN
        RETURN NULL;
    END IF;

    digits := regexp_replace(input_phone, '[^0-9]', '', 'g');

    IF digits = '' THEN
        RETURN NULL;
    END IF;

    IF digits ~ '^254[71][0-9]{8}$' THEN
        RETURN digits;
    ELSIF digits ~ '^0[71][0-9]{8}$' THEN
        RETURN '254' || substring(digits FROM 2);
    ELSIF digits ~ '^[71][0-9]{8}$' THEN
        RETURN '254' || digits;
    END IF;

    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_wallet_account_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.account_reference IS NULL OR btrim(NEW.account_reference) = '' THEN
        NEW.account_reference := 'BYW' || upper(substring(md5(NEW.user_id::text), 1, 10));
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_wallet_account_reference ON public.wallets;
CREATE TRIGGER set_wallet_account_reference
BEFORE INSERT OR UPDATE OF user_id, account_reference ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.ensure_wallet_account_reference();

CREATE OR REPLACE FUNCTION public.sync_profile_phone_normalized()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.phone_normalized := public.normalize_kenyan_msisdn(NEW.phone);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_phone_normalized ON public.profiles;
CREATE TRIGGER sync_profile_phone_normalized
BEFORE INSERT OR UPDATE OF phone ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_phone_normalized();

UPDATE public.profiles
SET phone_normalized = public.normalize_kenyan_msisdn(phone)
WHERE phone IS NOT NULL
  AND (
      phone_normalized IS NULL
      OR phone_normalized <> public.normalize_kenyan_msisdn(phone)
  );

UPDATE public.wallets
SET account_reference = 'BYW' || upper(substring(md5(user_id::text), 1, 10))
WHERE account_reference IS NULL
   OR btrim(account_reference) = '';

-- 5. C2B ATOMIC APPLY RPC
CREATE OR REPLACE FUNCTION public.apply_mpesa_c2b_confirmation(
    p_trans_id TEXT,
    p_amount NUMERIC,
    p_currency TEXT,
    p_bill_ref_number TEXT,
    p_msisdn_normalized TEXT,
    p_msisdn_raw TEXT,
    p_business_shortcode TEXT,
    p_transaction_type TEXT,
    p_trans_time TEXT,
    p_raw_payload JSONB,
    p_routing_target_type TEXT,
    p_routing_target_id TEXT,
    p_routing_user_id UUID,
    p_failure_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_existing RECORD;
    v_ledger_id UUID;
    v_reconciliation_status TEXT;
    v_status TEXT;
    v_payment_status TEXT;
    v_description TEXT;
    v_wallet_balance NUMERIC;
    v_wallet_user_id UUID;
    v_updated_order_id UUID;
BEGIN
    SELECT id, reconciliation_status
    INTO v_existing
    FROM public.billing_ledger
    WHERE trans_id = p_trans_id
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'status', 'duplicate',
            'ledger_id', v_existing.id,
            'failure_reason', 'duplicate_trans_id'
        );
    END IF;

    v_reconciliation_status := CASE
        WHEN p_routing_target_type IN ('wallet', 'order') THEN 'processed'
        ELSE 'needs_reconciliation'
    END;
    v_status := CASE
        WHEN v_reconciliation_status = 'processed' THEN 'completed'
        ELSE 'processing'
    END;
    v_payment_status := CASE
        WHEN v_reconciliation_status = 'processed' THEN 'completed'
        ELSE 'pending'
    END;
    v_description := CASE
        WHEN p_routing_target_type = 'wallet' THEN 'M-PESA C2B wallet top-up'
        WHEN p_routing_target_type = 'order' THEN 'M-PESA C2B order settlement'
        ELSE 'M-PESA C2B payment awaiting reconciliation'
    END;

    INSERT INTO public.billing_ledger (
        user_id,
        transaction_type,
        module_type,
        description,
        amount,
        currency,
        date,
        status,
        payment_status,
        idempotency_key,
        metadata,
        trans_id,
        bill_ref_number,
        msisdn_normalized,
        mpesa_type,
        routing_target_type,
        routing_target_id,
        reconciliation_status
    )
    VALUES (
        p_routing_user_id,
        'income',
        CASE
            WHEN p_routing_target_type = 'wallet' THEN 'wallet'
            WHEN p_routing_target_type = 'order' THEN 'shop'
            ELSE 'mpesa'
        END,
        v_description,
        p_amount,
        COALESCE(NULLIF(p_currency, ''), 'KES'),
        COALESCE(to_timestamp(NULLIF(p_trans_time, ''), 'YYYYMMDDHH24MISS'), NOW()),
        v_status,
        v_payment_status,
        'c2b:' || p_trans_id,
        jsonb_build_object(
            'raw_payload', COALESCE(p_raw_payload, '{}'::jsonb),
            'msisdn_raw', p_msisdn_raw,
            'business_shortcode', p_business_shortcode,
            'transaction_type', p_transaction_type,
            'failure_reason', p_failure_reason
        ),
        p_trans_id,
        p_bill_ref_number,
        p_msisdn_normalized,
        'c2b',
        p_routing_target_type,
        p_routing_target_id,
        v_reconciliation_status
    )
    RETURNING id INTO v_ledger_id;

    IF p_routing_target_type = 'wallet' THEN
        UPDATE public.wallets
        SET balance = COALESCE(balance, 0) + p_amount,
            updated_at = NOW()
        WHERE id = p_routing_target_id::uuid
        RETURNING user_id, balance INTO v_wallet_user_id, v_wallet_balance;

        IF FOUND THEN
            INSERT INTO public.wallet_transactions (
                user_id,
                amount,
                type,
                reference,
                balance_after,
                description,
                external_reference,
                source_channel
            )
            VALUES (
                v_wallet_user_id,
                p_amount,
                'credit',
                p_bill_ref_number,
                v_wallet_balance,
                'M-PESA C2B wallet top-up',
                p_trans_id,
                'mpesa_c2b'
            );
        ELSE
            UPDATE public.billing_ledger
            SET reconciliation_status = 'needs_reconciliation',
                status = 'processing',
                payment_status = 'pending',
                metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('failure_reason', 'wallet_missing_at_apply')
            WHERE id = v_ledger_id;
            RETURN jsonb_build_object(
                'status', 'needs_reconciliation',
                'ledger_id', v_ledger_id,
                'failure_reason', 'wallet_missing_at_apply'
            );
        END IF;
    ELSIF p_routing_target_type = 'order' THEN
        UPDATE public.orders
        SET payment_status = 'paid',
            status = CASE WHEN status = 'pending' THEN 'processing' ELSE status END,
            updated_at = NOW()
        WHERE id = p_routing_target_id::uuid
        RETURNING id INTO v_updated_order_id;

        IF NOT FOUND THEN
            UPDATE public.billing_ledger
            SET reconciliation_status = 'needs_reconciliation',
                status = 'processing',
                payment_status = 'pending',
                metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('failure_reason', 'order_missing_at_apply')
            WHERE id = v_ledger_id;
            RETURN jsonb_build_object(
                'status', 'needs_reconciliation',
                'ledger_id', v_ledger_id,
                'failure_reason', 'order_missing_at_apply'
            );
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'status', CASE
            WHEN v_reconciliation_status = 'processed' THEN 'processed'
            ELSE 'needs_reconciliation'
        END,
        'ledger_id', v_ledger_id,
        'routing_target_type', p_routing_target_type,
        'routing_target_id', p_routing_target_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_mpesa_c2b_confirmation(
    TEXT, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, UUID, TEXT
) TO service_role;
