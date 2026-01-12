-- Migration: Add missing columns to contact_submissions table
-- This updates the table to match the Contact form fields

-- Add phone column
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS phone text;

-- Add location columns
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS city text;

ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS state text;

ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS country text;

-- Add inquiry type
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS inquiry_type text;

-- Add topic (replaces subject)
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS topic text;

-- Add company field
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS company text;

-- Add grower-specific fields
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS farm_name text;

ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS crop_type text;

ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS acres numeric;

-- Add beekeeper-specific fields
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS apiary_name text;

ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS hive_count integer;

ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS experience_years text;

-- Add form_specific_data for any additional fields (JSON)
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS form_specific_data jsonb;

-- Ensure RLS policy for public insert exists
-- (Only run if policy doesn't exist - Supabase will error if duplicate)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contact_submissions' 
        AND policyname = 'Enable insert for all users'
    ) THEN
        CREATE POLICY "Enable insert for all users" ON public.contact_submissions
        FOR INSERT WITH CHECK (true);
    END IF;
END
$$;

-- Add policy for public select (for admin to read)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contact_submissions' 
        AND policyname = 'Enable read for authenticated'
    ) THEN
        CREATE POLICY "Enable read for authenticated" ON public.contact_submissions
        FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END
$$;
