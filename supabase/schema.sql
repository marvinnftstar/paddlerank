create table if not exists waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  city_province text,
  skill_level text,
  preferred_play_type text,
  message text,
  created_at timestamp with time zone default now()
);

alter table waitlist_signups enable row level security;

create policy "Allow public waitlist signups"
on waitlist_signups
for insert
to anon
with check (true);
