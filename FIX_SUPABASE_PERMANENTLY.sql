-- 🐝 BeeYield Permanent Database Fix Script
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Select your NEW project (ezfccfypwmuvbpujkqrg)
-- 3. Click on "SQL Editor" in the left sidebar.
-- 4. Click "+ New Query"
-- 5. Paste this entire script and click "Run"

-- 1. Ensure Contact Submissions Table exists with correct columns
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
  inquiry_type text, 
  topic text,
  subject text,
  message text,
  company text,
  farm_name text,
  crop_type text,
  acres numeric,
  apiary_name text,
  hive_count integer,
  experience_years text,
  form_specific_data jsonb,
  status text default 'new'
);

-- 2. Ensure Pollination Requests Table exists
create table if not exists public.pollination_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  email text,
  phone text,
  farm_name text,
  farm_location text,
  crop_type text,
  acres numeric,
  preferred_start_date text,
  additional_info text,
  status text default 'pending'
);

-- 3. Ensure Newsletter Subscribers Table exists
create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text unique not null,
  first_name text,
  source text default 'website',
  is_active boolean default true
);

-- 4. Enable Row Level Security (RLS)
alter table public.contact_submissions enable row level security;
alter table public.pollination_requests enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- 5. PERMANENT FIX: Allow Public Submissions (Fixes "Permission Denied" errors)
drop policy if exists "Enable public insert for contact" on public.contact_submissions;
create policy "Enable public insert for contact" on public.contact_submissions for insert with check (true);

drop policy if exists "Enable public insert for pollination" on public.pollination_requests;
create policy "Enable public insert for pollination" on public.pollination_requests for insert with check (true);

drop policy if exists "Enable public insert for newsletter" on public.newsletter_subscribers;
create policy "Enable public insert for newsletter" on public.newsletter_subscribers for insert with check (true);

-- 6. Allow Admin (Authenticated) to View/Manage
drop policy if exists "Enable all for authenticated users" on public.contact_submissions;
create policy "Enable all for authenticated users" on public.contact_submissions for all using (auth.role() = 'authenticated');

drop policy if exists "Enable all for authenticated users" on public.pollination_requests;
create policy "Enable all for authenticated users" on public.pollination_requests for all using (auth.role() = 'authenticated');

drop policy if exists "Enable all for authenticated users" on public.newsletter_subscribers;
create policy "Enable all for authenticated users" on public.newsletter_subscribers for all using (auth.role() = 'authenticated');

-- SUCCESS! 🚀
COMPLETE_GUIDE.md
