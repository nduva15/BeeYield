-- Align mapping-related backend tables with the forage API contract.

create extension if not exists "uuid-ossp";

-- =========================
-- FORAGE ZONES
-- =========================

create table if not exists public.forage_zones (
    id uuid primary key default gen_random_uuid(),
    apiary_id uuid references public.apiaries(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    zone_name text,
    flora_type text,
    latitude double precision,
    longitude double precision,
    radius_km double precision default 1.5,
    density_score double precision,
    season text,
    geojson jsonb,
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.forage_zones
    add column if not exists latitude double precision,
    add column if not exists longitude double precision,
    add column if not exists updated_at timestamptz default now();

alter table public.forage_zones
    alter column radius_km set default 1.5;

alter table public.forage_zones
    enable row level security;

drop policy if exists "forage_zones_manage_own" on public.forage_zones;
drop policy if exists "Users manage own forage zones" on public.forage_zones;
create policy "Users manage own forage zones"
on public.forage_zones for all
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists idx_forage_zones_user_id on public.forage_zones(user_id);
create index if not exists idx_forage_zones_apiary_id on public.forage_zones(apiary_id);

drop trigger if exists update_forage_zones_updated_at on public.forage_zones;
create trigger update_forage_zones_updated_at
before update on public.forage_zones
for each row execute procedure update_updated_at_column();

-- =========================
-- ORCHARDS
-- =========================

alter table public.orchards
    add column if not exists apiary_id uuid references public.apiaries(id) on delete set null,
    add column if not exists location_name text,
    add column if not exists boundary_geojson jsonb,
    add column if not exists acreage numeric(10, 2),
    add column if not exists crop_type text,
    add column if not exists notes text,
    add column if not exists updated_at timestamptz default now();

alter table public.orchards
    enable row level security;

drop policy if exists "Growers manage own orchards" on public.orchards;
drop policy if exists "Beekeepers see relevant orchards" on public.orchards;
drop policy if exists "Beekeepers see contracted orchards" on public.orchards;
create policy "Growers manage own orchards"
on public.orchards for all
using ((select auth.uid()) = grower_id)
with check ((select auth.uid()) = grower_id);

create index if not exists idx_orchards_grower_id on public.orchards(grower_id);
create index if not exists idx_orchards_apiary_id on public.orchards(apiary_id);

drop trigger if exists update_orchards_updated_at on public.orchards;
create trigger update_orchards_updated_at
before update on public.orchards
for each row execute procedure update_updated_at_column();

-- =========================
-- GEOFENCES
-- =========================

alter table public.geofences
    add column if not exists center_latitude double precision,
    add column if not exists center_longitude double precision,
    add column if not exists radius_meters double precision,
    add column if not exists boundary_geojson jsonb,
    add column if not exists notes text,
    add column if not exists updated_at timestamptz default now();

alter table public.geofences
    enable row level security;

drop policy if exists "Users can view own geofences" on public.geofences;
drop policy if exists "Users can insert own geofences" on public.geofences;
drop policy if exists "Users can update own geofences" on public.geofences;
drop policy if exists "Users manage own geofences" on public.geofences;
create policy "Users manage own geofences"
on public.geofences for all
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists idx_geofences_user_id on public.geofences(user_id);
create index if not exists idx_geofences_apiary_id on public.geofences(apiary_id);

drop trigger if exists update_geofences_updated_at on public.geofences;
create trigger update_geofences_updated_at
before update on public.geofences
for each row execute procedure update_updated_at_column();

-- =========================
-- MAP VIEWS
-- =========================

create table if not exists public.map_views (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    apiary_id uuid references public.apiaries(id) on delete cascade,
    name text not null,
    description text,
    view_type text not null default 'general',
    center_latitude double precision,
    center_longitude double precision,
    zoom_level integer,
    active_layers jsonb not null default '[]'::jsonb,
    filters jsonb not null default '{}'::jsonb,
    viewport_state jsonb not null default '{}'::jsonb,
    is_default boolean not null default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.map_views
    enable row level security;

drop policy if exists "Users manage own map views" on public.map_views;
create policy "Users manage own map views"
on public.map_views for all
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists idx_map_views_user_id on public.map_views(user_id);
create index if not exists idx_map_views_apiary_id on public.map_views(apiary_id);
create index if not exists idx_map_views_view_type on public.map_views(view_type);

drop trigger if exists update_map_views_updated_at on public.map_views;
create trigger update_map_views_updated_at
before update on public.map_views
for each row execute procedure update_updated_at_column();

notify pgrst, 'reload schema';
