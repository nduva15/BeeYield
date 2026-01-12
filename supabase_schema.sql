-- Create tables for the Honey platform

-- 1. Honey Batches (Traceability)
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

-- 2. Products
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  category text,
  images text[],
  badge text,
  is_active boolean default true
);

-- 3. Product Variants
create table if not exists public.product_variants (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid references public.products(id) on delete cascade,
  size text,
  price_kes numeric,
  stock_quantity integer,
  is_available boolean default true
);

-- 4. Stock Movements
create table if not exists public.stock_movements (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid references public.products(id) on delete set null,
  type text check (type in ('addition', 'removal', 'adjustment')),
  quantity integer,
  reason text,
  performed_by uuid references auth.users(id)
);

-- 5. Pollination Requests
create table if not exists public.pollination_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  crop_type text,
  crop text,
  farm_size numeric,
  acres numeric,
  location text,
  county text,
  status text default 'pending'
);

-- 6. Contact Submissions
create table if not exists public.contact_submissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  first_name text,
  last_name text,
  email text not null,
  phone text,
  city text,
  state text,
  country text,
  inquiry_type text, -- grower, beekeeper, general
  topic text,
  subject text,
  message text,
  company text,
  -- Grower-specific fields
  farm_name text,
  crop_type text,
  acres numeric,
  -- Beekeeper-specific fields
  apiary_name text,
  hive_count integer,
  experience_years text,
  -- Catch-all for additional data
  form_specific_data jsonb,
  status text default 'new'
);

-- 7. Newsletter Subscribers
create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text unique not null,
  first_name text,
  is_active boolean default true
);

-- 8. Orders (Simplified)
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  order_number text,
  customer_email text,
  shipping_address jsonb,
  items jsonb,
  total_amount numeric,
  status text default 'pending'
);

-- Enable RLS (Row Level Security) - Optional but recommended
alter table public.honey_batches enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.stock_movements enable row level security;
alter table public.pollination_requests enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.orders enable row level security;

-- Create simple policies for public read (for shop/traceability) and admin write
-- Note: These are very permissive for demonstration. Tweak as needed.

-- Public Read Policies
create policy "Enable read access for all users" on public.products for select using (true);
create policy "Enable read access for all users" on public.product_variants for select using (true);
create policy "Enable read access for all users" on public.honey_batches for select using (true);

-- Authenticated/Admin Policies (Simplified - allow all authenticated to read/write for now to fix access)
create policy "Enable all access for authenticated users" on public.products for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.product_variants for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.honey_batches for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.stock_movements for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.pollination_requests for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.contact_submissions for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.newsletter_subscribers for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.orders for all using (auth.role() = 'authenticated');

-- Insert public insert policies for forms (contact, newsletter, pollination)
create policy "Enable insert for all users" on public.contact_submissions for insert with check (true);
create policy "Enable insert for all users" on public.newsletter_subscribers for insert with check (true);
create policy "Enable insert for all users" on public.pollination_requests for insert with check (true);
create policy "Enable insert for all users" on public.orders for insert with check (true);

-- 9. Farmers
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

-- 10. Profiles (User Data)
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

-- Enable RLS for new tables
alter table public.farmers enable row level security;
alter table public.profiles enable row level security;

-- Policies for Farmers
create policy "Enable read access for all users" on public.farmers for select using (true);
create policy "Enable all access for authenticated users" on public.farmers for all using (auth.role() = 'authenticated');

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);
create policy "Admins can update all profiles." on public.profiles for update using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  )
);

