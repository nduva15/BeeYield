-- ============================================================
-- Migration: Advanced Traceability & Batching Engine
-- Purpose: Upgrade harvests table into an Immutable Batch Registry
-- Date: 2026-02-13
-- ============================================================

-- 1. Add new columns to existing harvests table (non-destructive)
--    We use ALTER TABLE to preserve all existing data.

-- The Human-Readable Public Batch ID  (e.g. BEE-2026-02-A14)
ALTER TABLE public.harvests
    ADD COLUMN IF NOT EXISTS batch_id TEXT UNIQUE;

-- Florage / Nectar source for this specific harvest
ALTER TABLE public.harvests
    ADD COLUMN IF NOT EXISTS florage_type TEXT;

-- JSONB Snapshot of IoT sensor data at harvest moment
-- Example: { "temp": 34.2, "humidity": 45, "weight_before": 22.5 }
ALTER TABLE public.harvests
    ADD COLUMN IF NOT EXISTS iot_snapshot JSONB;

-- JSONB Snapshot of health/disease status at harvest moment
-- Example: { "status": "Clean", "last_inspection": "Grade A" }
ALTER TABLE public.harvests
    ADD COLUMN IF NOT EXISTS health_snapshot JSONB;

-- Farmer name captured at time of harvest (denormalized for immutability)
ALTER TABLE public.harvests
    ADD COLUMN IF NOT EXISTS farmer_name TEXT;

-- QR Code URL pointing to the public trace page
ALTER TABLE public.harvests
    ADD COLUMN IF NOT EXISTS qr_code_url TEXT;


-- 2. Create index on batch_id for fast public lookups (QR code scans)
CREATE INDEX IF NOT EXISTS idx_harvests_batch_id ON public.harvests (batch_id);

-- 3. Create index on harvest_date for time-range queries
CREATE INDEX IF NOT EXISTS idx_harvests_harvest_date ON public.harvests (harvest_date);


-- 4. Ensure RLS is enabled (idempotent)
ALTER TABLE public.harvests ENABLE ROW LEVEL SECURITY;

-- 5. Policy: Users manage their own harvests
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'harvests' AND policyname = 'Manage own harvests'
    ) THEN
        CREATE POLICY "Manage own harvests" ON public.harvests
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

-- 6. Policy: Public can read any batch by batch_id (for QR code trace pages)
--    This is intentionally broad SELECT access so the public trace page works.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'harvests' AND policyname = 'Public view specific batch'
    ) THEN
        CREATE POLICY "Public view specific batch" ON public.harvests
            FOR SELECT
            USING (true);
    END IF;
END
$$;

-- 7. Backfill existing harvests with a generated batch_id if they don't have one
UPDATE public.harvests
SET batch_id = 'BEE-' || TO_CHAR(harvest_date, 'YYYY') || '-' || TO_CHAR(harvest_date, 'MM') || '-' || LEFT(id::text, 4)
WHERE batch_id IS NULL AND harvest_date IS NOT NULL;

-- Done. All existing data is preserved. New columns are nullable so old records are unaffected.
