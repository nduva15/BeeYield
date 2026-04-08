DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'inspections'
          AND column_name = 'date'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'inspections'
          AND column_name = 'inspection_date'
    ) THEN
        ALTER TABLE public.inspections RENAME COLUMN date TO inspection_date;
    END IF;
END $$;

ALTER TABLE public.inspections
    ADD COLUMN IF NOT EXISTS apiary_id UUID REFERENCES public.apiaries(id) ON DELETE SET NULL;

UPDATE public.inspections AS inspections
SET apiary_id = hives.apiary_id
FROM public.hives AS hives
WHERE inspections.hive_id = hives.id
  AND inspections.apiary_id IS NULL;

CREATE TABLE IF NOT EXISTS public.varroa_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID NOT NULL REFERENCES public.hives(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
    method TEXT NOT NULL DEFAULT 'alcohol_wash',
    mite_count INTEGER NOT NULL DEFAULT 0,
    sample_size INTEGER NOT NULL DEFAULT 300,
    infestation_rate NUMERIC(6, 2),
    inspector_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT varroa_readings_method_check CHECK (
        method IN ('alcohol_wash', 'sticky_board', 'sugar_roll', 'visual', 'other')
    ),
    CONSTRAINT varroa_readings_sample_size_check CHECK (sample_size >= 0),
    CONSTRAINT varroa_readings_mite_count_check CHECK (mite_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_varroa_readings_user_id
    ON public.varroa_readings (user_id);

CREATE INDEX IF NOT EXISTS idx_varroa_readings_hive_date
    ON public.varroa_readings (hive_id, reading_date DESC);

ALTER TABLE public.varroa_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "varroa_readings_owner_access" ON public.varroa_readings;
CREATE POLICY "varroa_readings_owner_access" ON public.varroa_readings
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.varroa_treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hive_id UUID NOT NULL REFERENCES public.hives(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    treatment_type TEXT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    dosage TEXT,
    effectiveness_percent NUMERIC(5, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT varroa_treatments_type_check CHECK (
        treatment_type IN ('oxalic_acid', 'formic_acid', 'thymol', 'amitraz', 'fluvalinate', 'biotechnical', 'other')
    ),
    CONSTRAINT varroa_treatments_effectiveness_check CHECK (
        effectiveness_percent IS NULL
        OR (effectiveness_percent >= 0 AND effectiveness_percent <= 100)
    ),
    CONSTRAINT varroa_treatments_date_check CHECK (
        end_date IS NULL OR end_date >= start_date
    )
);

CREATE INDEX IF NOT EXISTS idx_varroa_treatments_user_id
    ON public.varroa_treatments (user_id);

CREATE INDEX IF NOT EXISTS idx_varroa_treatments_hive_start
    ON public.varroa_treatments (hive_id, start_date DESC);

ALTER TABLE public.varroa_treatments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "varroa_treatments_owner_access" ON public.varroa_treatments;
CREATE POLICY "varroa_treatments_owner_access" ON public.varroa_treatments
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
