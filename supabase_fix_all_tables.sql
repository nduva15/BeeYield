-- Comprehensive Database Fix Script for BeeYield Dashboard
-- Run this in the Supabase Dashboard SQL Editor (SQL Tools -> New Query)

-- 1. Farmers Table
create table if not exists public.farmers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  phone text,
  email text,
  id_number text,
  experience_years integer,
  story text,
  latitude numeric,
  longitude numeric,
  location_name text,
  region text,
  county text,
  ward text,
  certification_status text default 'PENDING',
  farmer_id text,
  status text default 'active'
);

-- 2. Stock Movements Table
create table if not exists public.stock_movements (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid references public.products(id) on delete set null,
  type text check (type in ('addition', 'removal', 'adjustment')),
  quantity integer,
  reason text,
  performed_by uuid references auth.users(id)
);

-- 3. Honey Batches (Traceability)
create table if not exists public.honey_batches (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  batch_code text not null unique,
  honey_type text not null,
  harvest_date date,
  packaged_date date,
  quantity_kg numeric,
  processing_method text,
  block_hash text,
  farmer_name text,
  farmer_phone text,
  beekeeper_name text,
  beekeeper_id text,
  apiary_name text,
  location_county text,
  location_region text,
  latitude numeric,
  longitude numeric,
  quality_grade text,
  certifications text[],
  moisture_content numeric,
  color_grade text,
  status text default 'verified'
);

-- Ensure all columns are present (in case table existed but was old)
alter table public.honey_batches 
add column if not exists farmer_phone text,
add column if not exists location_county text,
add column if not exists apiary_name text,
add column if not exists beekeeper_name text,
add column if not exists beekeeper_id text,
add column if not exists location_region text,
add column if not exists latitude numeric,
add column if not exists longitude numeric,
add column if not exists quality_grade text,
add column if not exists color_grade text,
add column if not exists packaged_date date,
add column if not exists processing_method text;


-- 4. Update Products (Add missing frontend fields)
alter table public.products 
add column if not exists price_kes numeric default 0,
add column if not exists badge text,
add column if not exists is_active boolean default true;

-- 5. Update Product Variants (Add missing frontend fields)
alter table public.product_variants
add column if not exists size text,
add column if not exists price_kes numeric default 0,
add column if not exists is_available boolean default true;

-- 6. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  updated_at timestamp with time zone,
  username text unique,
  first_name text,
  last_name text,
  avatar_url text,
  website text,
  email text,
  role text default 'user' check (role in ('user', 'admin', 'super_admin'))
);

-- 7. RLS Setup and Policies
do $$
declare
    t text;
begin
    for t in select tablename from pg_tables where schemaname = 'public' loop
        execute format('alter table public.%I enable row level security', t);
        execute format('drop policy if exists "Admin all access" on public.%I', t);
        execute format('create policy "Admin all access" on public.%I for all using (auth.role() = ''authenticated'')', t);
        execute format('drop policy if exists "Public read access" on public.%I', t);
        execute format('create policy "Public read access" on public.%I for select using (true)', t);
    end loop;
end $$;

-- 8. Public Insert Permissions for Forms
create policy "Public insert contact" on public.contact_submissions for insert with check (true);
create policy "Public insert pollination" on public.pollination_requests for insert with check (true);
create policy "Public insert newsletter" on public.newsletter_subscribers for insert with check (true);
create policy "Public insert orders" on public.orders for insert with check (true);

-- 9. Seed Timothy Nduva and Demo Batches
-- Seed Timothy Nduva
insert into public.farmers (name, phone, email, experience_years, story, region, county, location_name, certification_status, farmer_id)
values (
  'Timothy Nduva', 
  '+254712345678', 
  'timothy@beeyield.com', 
  15, 
  'Third-generation beekeeper from Kibwezi. Timothy manages our HoneyChain network and hive health, ensuring the highest standards of purity.',
  'Kibwezi',
  'Makueni',
  'Kibwezi East',
  'CERTIFIED',
  'BY-F-001'
)
on conflict do nothing;

-- Seed 3 Traceability Batches
insert into public.honey_batches (
    batch_code, 
    honey_type, 
    harvest_date, 
    quantity_kg, 
    farmer_name, 
    location_region, 
    location_county, 
    quality_grade, 
    moisture_content, 
    color_grade, 
    processing_method,
    block_hash
)
values 
(
    'DEMO-001', 
    'Acacia Gold', 
    '2024-01-15', 
    120.5, 
    'Timothy Nduva', 
    'Kibwezi', 
    'Makueni', 
    'A+', 
    17.2, 
    'Golden', 
    'Cold Pressed',
    '0x7ae568e3f4b4e5d8a9b2c1d0e9f8a7b6c5d4e3f2'
),
(
    'KIB-ACACIA-24', 
    'Pure Acacia', 
    '2024-03-10', 
    250.0, 
    'Timothy Nduva', 
    'Kibwezi', 
    'Makueni', 
    'A', 
    18.1, 
    'Light Amber', 
    'Centrifuged',
    '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t'
),
(
    'KIB-GOLD-24', 
    'High Grade Gold', 
    '2024-05-22', 
    85.0, 
    'Timothy Nduva', 
    'Kibwezi', 
    'Makueni', 
    'Premium', 
    16.5, 
    'Dark Golden', 
    'Raw Unfiltered',
    '0xabcdef1234567890abcdef1234567890abcdef12'
)
on conflict (batch_code) do update set
    honey_type = excluded.honey_type,
    farmer_name = excluded.farmer_name,
    location_region = excluded.location_region,
    location_county = excluded.location_county;

