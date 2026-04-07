-- =============================================================
-- Queens & Queen Rearing Batches
-- =============================================================
-- Creates the missing tables that the backend API (beeyield.py)
-- and frontend (beeyieldService.ts) already reference.
-- =============================================================

-- ========================
-- 1. QUEENS TABLE
-- ========================
CREATE TABLE IF NOT EXISTS public.queens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hive_id         UUID REFERENCES public.hives(id) ON DELETE SET NULL,
    name            TEXT,
    breed           TEXT,
    origin          TEXT,          -- purchased, raised, swarm-caught
    marking_color   TEXT,          -- white, yellow, red, green, blue
    year_introduced INTEGER,
    status          TEXT DEFAULT 'active',  -- active, failed, superseded, lost
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_queens_user_id ON public.queens(user_id);
CREATE INDEX IF NOT EXISTS idx_queens_hive_id ON public.queens(hive_id);

-- RLS
ALTER TABLE public.queens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "queens_select_own" ON public.queens;
CREATE POLICY "queens_select_own" ON public.queens
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "queens_insert_own" ON public.queens;
CREATE POLICY "queens_insert_own" ON public.queens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "queens_update_own" ON public.queens;
CREATE POLICY "queens_update_own" ON public.queens
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "queens_delete_own" ON public.queens;
CREATE POLICY "queens_delete_own" ON public.queens
    FOR DELETE USING (auth.uid() = user_id);

-- Service-role bypass (for backend API calls with service key)
DROP POLICY IF EXISTS "queens_service_role" ON public.queens;
CREATE POLICY "queens_service_role" ON public.queens
    USING (auth.role() = 'service_role');


-- ========================
-- 2. QUEEN REARING BATCHES TABLE
-- ========================
CREATE TABLE IF NOT EXISTS public.queen_rearing_batches (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hive_id             UUID NOT NULL REFERENCES public.hives(id) ON DELETE CASCADE,
    batch_name          TEXT NOT NULL,
    method              TEXT DEFAULT 'Grafting',  -- Grafting, Walk-away, Miller, Jenter, OTS
    start_date          DATE NOT NULL,
    planned_units       INTEGER DEFAULT 20,
    notebook            TEXT,
    generate_calendar   BOOLEAN DEFAULT true,
    generate_units      BOOLEAN DEFAULT true,
    generate_reminders  BOOLEAN DEFAULT true,
    status              TEXT DEFAULT 'active',  -- active, completed, failed
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_queen_rearing_batches_user_id ON public.queen_rearing_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_queen_rearing_batches_hive_id ON public.queen_rearing_batches(hive_id);

-- RLS
ALTER TABLE public.queen_rearing_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "qrb_select_own" ON public.queen_rearing_batches;
CREATE POLICY "qrb_select_own" ON public.queen_rearing_batches
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "qrb_insert_own" ON public.queen_rearing_batches;
CREATE POLICY "qrb_insert_own" ON public.queen_rearing_batches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "qrb_update_own" ON public.queen_rearing_batches;
CREATE POLICY "qrb_update_own" ON public.queen_rearing_batches
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "qrb_delete_own" ON public.queen_rearing_batches;
CREATE POLICY "qrb_delete_own" ON public.queen_rearing_batches
    FOR DELETE USING (auth.uid() = user_id);

-- Service-role bypass
DROP POLICY IF EXISTS "qrb_service_role" ON public.queen_rearing_batches;
CREATE POLICY "qrb_service_role" ON public.queen_rearing_batches
    USING (auth.role() = 'service_role');


-- ========================
-- 3. AUTO-UPDATE updated_at TRIGGER
-- ========================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_queens_updated_at ON public.queens;
CREATE TRIGGER trg_queens_updated_at
    BEFORE UPDATE ON public.queens
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_qrb_updated_at ON public.queen_rearing_batches;
CREATE TRIGGER trg_qrb_updated_at
    BEFORE UPDATE ON public.queen_rearing_batches
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ========================
-- 4. GRANT ACCESS
-- ========================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.queens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.queens TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.queen_rearing_batches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.queen_rearing_batches TO service_role;
