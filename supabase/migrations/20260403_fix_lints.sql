-- Comprehensive linter cleanup (auth initplan, permissive policies, extensions schema, RLS gaps)
-- Safe/idempotent: uses IF EXISTS checks and redefines policies with deterministic names.

-- 0) Move pg_net to dedicated schema (PostGIS must stay in public on Supabase)
do $$
begin
  execute 'create schema if not exists extensions';
  -- recreate pg_net if present
  if exists (select 1 from pg_extension where extname = 'pg_net') then
    execute 'drop extension if exists pg_net';
    execute 'create extension pg_net schema extensions';
  end if;
end $$;

-- 1) Harden function search_path
do $$
begin
  perform 1 from pg_proc where proname = 'update_chat_session_timestamp';
  if found then execute 'alter function public.update_chat_session_timestamp() set search_path = public, auth'; end if;
  perform 1 from pg_proc where proname = 'set_updated_at';
  if found then execute 'alter function public.set_updated_at() set search_path = public, auth'; end if;
  perform 1 from pg_proc where proname = 'set_task_completed_at';
  if found then execute 'alter function public.set_task_completed_at() set search_path = public, auth'; end if;
  perform 1 from pg_proc where proname = 'exec_query';
  if found then execute 'alter function public.exec_query(text) set search_path = public, auth'; end if;
  perform 1 from pg_proc where proname = 'update_updated_at_column';
  if found then execute 'alter function public.update_updated_at_column() set search_path = public, auth'; end if;
  perform 1 from pg_proc where proname = 'handle_new_user';
  if found then execute 'alter function public.handle_new_user() set search_path = public, auth'; end if;
  perform 1 from pg_proc where proname = 'protect_synced_transactions';
  if found then execute 'alter function public.protect_synced_transactions() set search_path = public, auth'; end if;
end $$;

-- 2) Auth RLS initplan + permissive consolidation (apiaries/hives/harvests)
do $$
begin
  -- apiaries
  execute 'drop policy if exists "apiaries_owner_access" on public.apiaries';
  execute $$create policy "apiaries_owner_access" on public.apiaries
    for all to authenticated
    using (user_id = (select auth.uid()) or (select public.is_admin()))
    with check (user_id = (select auth.uid()) or (select public.is_admin()))$$;

  -- hives
  execute 'drop policy if exists "hives_owner_access" on public.hives';
  execute $$create policy "hives_owner_access" on public.hives
    for all to authenticated
    using (user_id = (select auth.uid()) or (select public.is_admin()))
    with check (user_id = (select auth.uid()) or (select public.is_admin()))$$;

  -- harvests
  execute 'drop policy if exists "harvests_owner_access" on public.harvests';
  execute $$create policy "harvests_owner_access" on public.harvests
    for all to authenticated
    using (user_id = (select auth.uid()) or (select public.is_admin()))
    with check (user_id = (select auth.uid()) or (select public.is_admin()))$$;
end $$;

-- 3) Automation logs policy normalization (avoid duplicates)
do $$
begin
  execute 'drop policy if exists "Service role can insert automation logs" on public.automation_logs';
  execute 'drop policy if exists "Service role insert only" on public.automation_logs';
  execute $$create policy "Service role insert only" on public.automation_logs
    for insert to service_role with check (true)$$;

  execute 'drop policy if exists "automation_logs_owner_access" on public.automation_logs';
  execute $$create policy "automation_logs_owner_access" on public.automation_logs
    for select to authenticated
    using (exists (select 1 from public.tasks t where t.id = public.automation_logs.task_id and t.user_id = (select auth.uid()))
           or (select public.is_admin()))$$;
end $$;

-- 4) Chat messages policy resilient to column name differences
do $$
declare col text;
begin
  select column_name into col
  from information_schema.columns
  where table_schema='public' and table_name='chat_messages'
    and column_name in ('session_id','chat_session_id','conversation_id')
  order by case column_name when 'session_id' then 1 when 'chat_session_id' then 2 else 3 end
  limit 1;

  if col is null then
    raise notice 'chat_messages has no recognized FK column; skipping policy reset';
    return;
  end if;

  execute 'drop policy if exists "Chat select public" on public.chat_messages';
  execute 'drop policy if exists "Chat write authenticated" on public.chat_messages';
  execute 'drop policy if exists "Anyone can manage chat messages" on public.chat_messages';
  execute 'drop policy if exists "chat_messages_session_owner" on public.chat_messages';

  execute format($$create policy "chat_messages_session_owner" on public.chat_messages
    for all to authenticated
    using (%I in (select id from public.chat_sessions where user_id = (select auth.uid())))
    with check (%I in (select id from public.chat_sessions where user_id = (select auth.uid())));$$, col, col);
end $$;

-- 5) Public insert tables – single permissive policy
do $$
declare t text;
begin
  foreach t in array ['contact_messages','contact_submissions','pollination_requests','newsletter_subscribers','newsletter_subscriptions','job_applications','donations'] loop
    execute format('drop policy if exists "public_insert_access" on public.%I', t);
    execute format('create policy "public_insert_access" on public.%I for insert to public with check (true)', t);
  end loop;
end $$;

-- 6) Enable RLS on spatial_ref_sys (linter error)
do $$
begin
  alter table if exists public.spatial_ref_sys enable row level security;
  execute 'drop policy if exists "Allow public read access for spatial_ref_sys" on public.spatial_ref_sys';
  execute 'create policy "Allow public read access for spatial_ref_sys" on public.spatial_ref_sys for select using (true)';
exception
  when insufficient_privilege then
    raise notice 'Skipping spatial_ref_sys RLS: insufficient privilege';
end $$;

-- 7) Leaked password protection (if supported)
alter system set supabase.gotrue.enable_secure_passwords = on;
select pg_reload_conf();

notify pgrst, 'reload schema';
