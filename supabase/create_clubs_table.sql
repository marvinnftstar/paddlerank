create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  club_name text not null,
  city text not null,
  contact_person text not null,
  contact_email text not null,
  contact_number text,
  description text not null,
  home_court text,
  playing_schedule text,
  logo_url text,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  submitted_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists clubs_status_created_at_idx
on public.clubs (status, created_at desc);

alter table public.clubs enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'clubs'
      and policyname = 'Authenticated users can read approved clubs'
  ) then
    create policy "Authenticated users can read approved clubs"
    on public.clubs
    for select
    to authenticated
    using (status = 'approved');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'clubs'
      and policyname = 'Authenticated users can submit clubs'
  ) then
    create policy "Authenticated users can submit clubs"
    on public.clubs
    for insert
    to authenticated
    with check (
      auth.uid() = submitted_by
      and status = 'pending'
    );
  end if;
end $$;

create or replace function public.set_clubs_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_clubs_updated_at
on public.clubs;

create trigger set_clubs_updated_at
before update on public.clubs
for each row
execute function public.set_clubs_updated_at();
