-- Create Farmers table
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
  farmer_id text, -- Custom ID like F-001
  status text default 'active'
);

-- Enable RLS
alter table public.farmers enable row level security;

-- Policies
create policy "Enable read access for all users" on public.farmers for select using (true);
create policy "Enable all access for authenticated users" on public.farmers for all using (auth.role() = 'authenticated');
