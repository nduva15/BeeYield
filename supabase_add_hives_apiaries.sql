-- Migration to add Apiaries and Hives tables
-- 1. Apiaries Table
create table if not exists public.apiaries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  location_name text,
  county text,
  region text,
  latitude numeric,
  longitude numeric,
  farmer_id uuid references public.farmers(id) on delete set null,
  status text default 'active'
);

-- 2. Hives Table
create table if not exists public.hives (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  hive_code text not null unique,
  apiary_id uuid references public.apiaries(id) on delete cascade,
  type text, -- e.g., Langstroth, KTB, Traditional
  installation_date date default current_date,
  last_inspection_date date,
  status text default 'active', -- active, weak, abandoned, harvested
  notes text
);

-- 3. RLS Setup and Policies for Apiaries
alter table public.apiaries enable row level security;
drop policy if exists "Admin all access apiaries" on public.apiaries;
create policy "Admin all access apiaries" on public.apiaries for all using (auth.role() = 'authenticated');
drop policy if exists "Public read access apiaries" on public.apiaries;
create policy "Public read access apiaries" on public.apiaries for select using (true);

-- 4. RLS Setup and Policies for Hives
alter table public.hives enable row level security;
drop policy if exists "Admin all access hives" on public.hives;
create policy "Admin all access hives" on public.hives for all using (auth.role() = 'authenticated');
drop policy if exists "Public read access hives" on public.hives;
create policy "Public read access hives" on public.hives for select using (true);

-- 5. Seeding logic for Timothy Nduva's Apiaries and Hives (Optional, usually done via seed script)
