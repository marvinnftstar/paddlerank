create table if not exists waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  city_province text,
  skill_level text,
  preferred_play_type text,
  message text,
  access_status text not null default 'pending',
  created_at timestamp with time zone default now()
);

alter table waitlist_signups
add constraint waitlist_signups_access_status_check
check (access_status in ('pending', 'approved', 'blocked'));

alter table waitlist_signups enable row level security;

create policy "Allow public waitlist signups"
on waitlist_signups
for insert
to anon
with check (true);

create policy "Allow authenticated users to read own waitlist status"
on waitlist_signups
for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'));
