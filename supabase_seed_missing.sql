-- SQL Script to seed Timothy Nduva and the 3 demonstration batches
-- Run this in the Supabase SQL Editor

-- 1. Ensure Farmers Table Exists (Backup creation)
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

-- 2. Ensure Honey Batches Table Exists
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

-- 3. Seed Timothy Nduva as a Farmer
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
on conflict (id) do nothing; -- Using id is tricky without knowing it, name would be better if we had unique constraint

-- Alternative insert with name check (Manual check recommended)
-- insert into public.farmers (name, phone, email, experience_years, story, region, county, location_name, certification_status, farmer_id)
-- select 'Timothy Nduva', '+254712345678', 'timothy@beeyield.com', 15, '...', 'Kibwezi', 'Makueni', 'Kibwezi East', 'CERTIFIED', 'BY-F-001'
-- where not exists (select 1 from public.farmers where name = 'Timothy Nduva');

-- 4. Seed the 3 Traceability Batches
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

-- 5. Set RLS Policies (Ensure everyone can see these)
alter table public.farmers enable row level security;
alter table public.honey_batches enable row level security;

drop policy if exists "Public read access" on public.farmers;
create policy "Public read access" on public.farmers for select using (true);

drop policy if exists "Public read access" on public.honey_batches;
create policy "Public read access" on public.honey_batches for select using (true);

drop policy if exists "Admin all access" on public.farmers;
create policy "Admin all access" on public.farmers for all using (auth.role() = 'authenticated');

drop policy if exists "Admin all access" on public.honey_batches;
create policy "Admin all access" on public.honey_batches for all using (auth.role() = 'authenticated');
