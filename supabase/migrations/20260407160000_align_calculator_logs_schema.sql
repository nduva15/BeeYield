-- Align calculator_logs with the API contract used by the Bee Calculator suite.
-- Keep legacy columns for backwards compatibility while adding the current shape.

ALTER TABLE public.calculator_logs
    ADD COLUMN IF NOT EXISTS calculation_type TEXT,
    ADD COLUMN IF NOT EXISTS sub_type TEXT,
    ADD COLUMN IF NOT EXISTS inputs JSONB,
    ADD COLUMN IF NOT EXISTS results JSONB;

UPDATE public.calculator_logs
SET
    calculation_type = COALESCE(calculation_type, module_type, 'health'),
    sub_type = COALESCE(
        sub_type,
        CASE
            WHEN jsonb_typeof(input_json) = 'object' THEN input_json->>'sub_type'
            ELSE NULL
        END,
        module_type,
        'snapshot'
    ),
    inputs = COALESCE(
        inputs,
        CASE
            WHEN jsonb_typeof(input_json) = 'object' AND input_json ? 'inputs' THEN input_json->'inputs'
            ELSE input_json
        END,
        '{}'::jsonb
    ),
    results = COALESCE(results, output_json, '{}'::jsonb)
WHERE
    calculation_type IS NULL
    OR sub_type IS NULL
    OR inputs IS NULL
    OR results IS NULL;

ALTER TABLE public.calculator_logs
    ALTER COLUMN calculation_type SET DEFAULT 'health',
    ALTER COLUMN sub_type SET DEFAULT 'snapshot',
    ALTER COLUMN inputs SET DEFAULT '{}'::jsonb,
    ALTER COLUMN results SET DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_calculator_logs_user_created_at
    ON public.calculator_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_calculator_logs_user_calculation_type
    ON public.calculator_logs (user_id, calculation_type);
