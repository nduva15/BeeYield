CREATE TABLE IF NOT EXISTS public.florage_plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    name TEXT NOT NULL,
    latin TEXT NOT NULL,
    bloom TEXT NOT NULL,
    nectar INTEGER NOT NULL DEFAULT 5,
    pollen INTEGER NOT NULL DEFAULT 5,
    radius INTEGER NOT NULL DEFAULT 800,
    notes TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.florage_plants ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'florage_plants'
          AND policyname = 'florage_plants_public_access'
    ) THEN
        CREATE POLICY florage_plants_public_access
        ON public.florage_plants FOR ALL TO public
        USING (true) WITH CHECK (true);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_florage_plants_device ON public.florage_plants(device_id);

CREATE TABLE IF NOT EXISTS public.alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    hive_label TEXT NOT NULL,
    metric TEXT NOT NULL,
    comparator TEXT NOT NULL,
    threshold NUMERIC NOT NULL,
    window_hours INTEGER NOT NULL DEFAULT 48,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'alert_rules'
          AND policyname = 'alert_rules_public_access'
    ) THEN
        CREATE POLICY alert_rules_public_access
        ON public.alert_rules FOR ALL TO public
        USING (true) WITH CHECK (true);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_alert_rules_device ON public.alert_rules(device_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.alert_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    rule_id UUID REFERENCES public.alert_rules(id) ON DELETE SET NULL,
    hive_label TEXT NOT NULL,
    metric TEXT NOT NULL,
    value NUMERIC,
    message TEXT NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    snapshot_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'alert_events'
          AND policyname = 'alert_events_public_access'
    ) THEN
        CREATE POLICY alert_events_public_access
        ON public.alert_events FOR ALL TO public
        USING (true) WITH CHECK (true);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_alert_events_device ON public.alert_events(device_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.forecast_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    hive_label TEXT NOT NULL,
    forecast_for_date DATE NOT NULL,
    predicted_bees_per_min NUMERIC NOT NULL,
    temp_c NUMERIC,
    wind_kmh NUMERIC,
    precip_mm NUMERIC,
    band TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.forecast_snapshots ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'forecast_snapshots'
          AND policyname = 'forecast_snapshots_public_access'
    ) THEN
        CREATE POLICY forecast_snapshots_public_access
        ON public.forecast_snapshots FOR ALL TO public
        USING (true) WITH CHECK (true);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_forecast_snapshots_device ON public.forecast_snapshots(device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forecast_snapshots_snapshot_date ON public.forecast_snapshots(device_id, forecast_for_date DESC);
