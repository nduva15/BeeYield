-- Bee reference library tables for editable disease/species knowledge bases.

CREATE OR REPLACE FUNCTION public.reference_library_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    jwt_role text;
BEGIN
    jwt_role := COALESCE(
        auth.jwt() -> 'user_metadata' ->> 'role',
        auth.jwt() -> 'app_metadata' ->> 'role',
        ''
    );

    IF jwt_role IN ('admin', 'super_admin', 'superadmin') THEN
        RETURN true;
    END IF;

    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role IN ('admin', 'super_admin', 'superadmin')
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.reference_library_is_admin() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.reference_library_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.bee_disease_references (
    id text PRIMARY KEY,
    name text NOT NULL,
    type text,
    risk_level text,
    causes text,
    effects text,
    symptoms text[] NOT NULL DEFAULT '{}',
    treatment text,
    prevention text,
    detection text,
    transmission text,
    host_species text[] NOT NULL DEFAULT '{}',
    response_steps text[] NOT NULL DEFAULT '{}',
    cure_status text,
    image_url text,
    source_references text[] NOT NULL DEFAULT '{}',
    tags text[] NOT NULL DEFAULT '{}',
    is_published boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bee_species_references (
    id text PRIMARY KEY,
    name text NOT NULL,
    common_name text,
    scientific_name text,
    category text,
    location text,
    description text,
    suitability text,
    health_profile text,
    notes text,
    ideal_use text,
    common_diseases text[] NOT NULL DEFAULT '{}',
    traits text[] NOT NULL DEFAULT '{}',
    conservation_status text,
    is_extinct boolean NOT NULL DEFAULT false,
    image_url text,
    source_references text[] NOT NULL DEFAULT '{}',
    tags text[] NOT NULL DEFAULT '{}',
    is_published boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bee_disease_references_publish_sort
    ON public.bee_disease_references (is_published, sort_order, name);

CREATE INDEX IF NOT EXISTS idx_bee_disease_references_type
    ON public.bee_disease_references (type);

CREATE INDEX IF NOT EXISTS idx_bee_species_references_publish_sort
    ON public.bee_species_references (is_published, sort_order, name);

CREATE INDEX IF NOT EXISTS idx_bee_species_references_category
    ON public.bee_species_references (category);

ALTER TABLE public.bee_disease_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bee_species_references ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published bee disease references" ON public.bee_disease_references;
CREATE POLICY "Public can view published bee disease references"
    ON public.bee_disease_references
    FOR SELECT
    USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage bee disease references" ON public.bee_disease_references;
CREATE POLICY "Admins can manage bee disease references"
    ON public.bee_disease_references
    FOR ALL
    USING (public.reference_library_is_admin())
    WITH CHECK (public.reference_library_is_admin());

DROP POLICY IF EXISTS "Public can view published bee species references" ON public.bee_species_references;
CREATE POLICY "Public can view published bee species references"
    ON public.bee_species_references
    FOR SELECT
    USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage bee species references" ON public.bee_species_references;
CREATE POLICY "Admins can manage bee species references"
    ON public.bee_species_references
    FOR ALL
    USING (public.reference_library_is_admin())
    WITH CHECK (public.reference_library_is_admin());

DROP TRIGGER IF EXISTS bee_disease_references_set_updated_at ON public.bee_disease_references;
CREATE TRIGGER bee_disease_references_set_updated_at
    BEFORE UPDATE ON public.bee_disease_references
    FOR EACH ROW
    EXECUTE FUNCTION public.reference_library_touch_updated_at();

DROP TRIGGER IF EXISTS bee_species_references_set_updated_at ON public.bee_species_references;
CREATE TRIGGER bee_species_references_set_updated_at
    BEFORE UPDATE ON public.bee_species_references
    FOR EACH ROW
    EXECUTE FUNCTION public.reference_library_touch_updated_at();
