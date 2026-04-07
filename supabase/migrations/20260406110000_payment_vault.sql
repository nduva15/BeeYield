BEGIN;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_stripe_customer_id_key
    ON public.profiles (stripe_customer_id)
    WHERE stripe_customer_id IS NOT NULL;

ALTER TABLE public.payment_methods
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_setup_intent_id TEXT,
ADD COLUMN IF NOT EXISTS billing_email TEXT,
ADD COLUMN IF NOT EXISTS fingerprint TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS detached_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.payment_methods
SET status = 'active'
WHERE status IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payment_methods_stripe_payment_method_id_key
    ON public.payment_methods (stripe_payment_method_id)
    WHERE stripe_payment_method_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS payment_methods_user_id_status_created_at_idx
    ON public.payment_methods (user_id, status, created_at DESC);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'payment_methods_status_check'
    ) THEN
        ALTER TABLE public.payment_methods
            ADD CONSTRAINT payment_methods_status_check
            CHECK (status IN ('active', 'detached', 'archived'));
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_proc
        WHERE proname = 'update_updated_at_column'
    ) THEN
        DROP TRIGGER IF EXISTS update_payment_methods_updated_at
            ON public.payment_methods;

        CREATE TRIGGER update_payment_methods_updated_at
            BEFORE UPDATE ON public.payment_methods
            FOR EACH ROW
            EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;

COMMIT;
