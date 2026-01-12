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

-- 3. Update Honey Batches (Add missing frontend fields)
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
