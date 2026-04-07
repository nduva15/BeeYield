-- Add idempotency support to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON public.orders(idempotency_key);
COMMENT ON COLUMN public.orders.idempotency_key IS 'Stable key used to prevent double order creation.';
