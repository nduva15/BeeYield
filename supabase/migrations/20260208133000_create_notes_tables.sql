-- Drop everything if it exists to ensure type compatibility (uuid vs bigint) and start fresh with correct types
drop table if exists note_attachments cascade;
drop table if exists notes cascade;

-- Create notes table
create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null default auth.uid(),
  apiary_id uuid references apiaries(id),
  hive_id uuid references hives(id),
  title text,
  content text,
  category text,
  priority text default 'medium',
  note_date timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create note_attachments table
create table note_attachments (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references notes(id) on delete cascade not null,
  file_path text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS on notes
alter table notes enable row level security;

-- Enable RLS on note_attachments
alter table note_attachments enable row level security;

-- RLS Policies for notes
-- 1. Select (Read)
create policy "Users can only read their own notes"
on notes for select
to authenticated
using (auth.uid() = user_id);

-- 2. Insert (Create)
create policy "Users can only create their own notes"
on notes for insert
to authenticated
with check (auth.uid() = user_id);

-- 3. Update/Delete
create policy "Users can only modify their own notes"
on notes for all
to authenticated
using (auth.uid() = user_id);


-- RLS Policies for note_attachments
-- Attachments are accessible if the parent note is accessible
create policy "Users can only read own note attachments"
on note_attachments for select
to authenticated
using (
  exists (
    select 1 from notes
    where notes.id = note_attachments.note_id
    and notes.user_id = auth.uid()
  )
);

create policy "Users can create attachments for own notes"
on note_attachments for insert
to authenticated
with check (
  exists (
    select 1 from notes
    where notes.id = note_attachments.note_id
    and notes.user_id = auth.uid()
  )
);

create policy "Users can delete own note attachments"
on note_attachments for delete
to authenticated
using (
  exists (
    select 1 from notes
    where notes.id = note_attachments.note_id
    and notes.user_id = auth.uid()
  )
);
