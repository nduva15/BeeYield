-- Migration to allow Guest Checkout (Public Insert)
-- This allows unauthenticated users to create orders and order items.

-- 1. Orders
CREATE POLICY "public_insert_orders" ON public.orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_select_orders_by_idempotency" ON public.orders FOR SELECT TO public USING (idempotency_key IS NOT NULL);

-- 2. Order Items
CREATE POLICY "public_insert_order_items" ON public.order_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_select_order_items" ON public.order_items FOR SELECT TO public USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id)
);

-- 3. Billing Ledger (for Idempotency)
CREATE POLICY "public_insert_billing_ledger" ON public.billing_ledger FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_select_billing_ledger" ON public.billing_ledger FOR SELECT TO public USING (idempotency_key IS NOT NULL);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
