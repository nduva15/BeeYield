-- Create the table
create table notes (
  id bigint primary key generated always as identity,
  title text not null
);

-- Insert some sample data into the table
insert into notes (title)
values
  ('Today I created a Supabase project.'),
  ('I added some data and queried it from Next.js.'),
  ('It was awesome!');

alter table notes enable row level security;

-- Add policies to allow public access
create policy "Public notes are viewable by everyone"
on notes for select using (true);

create policy "Everyone can insert notes"
on notes for insert with check (true);
