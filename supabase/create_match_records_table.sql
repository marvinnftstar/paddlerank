create table if not exists public.match_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_type text not null check (match_type in ('singles', 'doubles')),
  opponent_name text not null,
  partner_name text,
  score text not null,
  result text not null check (result in ('win', 'loss')),
  match_date date not null,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists match_records_user_date_idx
on public.match_records (user_id, match_date desc);

alter table public.match_records enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'match_records'
      and policyname = 'Users can read own match records'
  ) then
    create policy "Users can read own match records"
    on public.match_records
    for select
    to authenticated
    using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'match_records'
      and policyname = 'Users can insert own match records'
  ) then
    create policy "Users can insert own match records"
    on public.match_records
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'match_records'
      and policyname = 'Users can update own match records'
  ) then
    create policy "Users can update own match records"
    on public.match_records
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'match_records'
      and policyname = 'Users can delete own match records'
  ) then
    create policy "Users can delete own match records"
    on public.match_records
    for delete
    to authenticated
    using (auth.uid() = user_id);
  end if;
end $$;

create or replace function public.set_match_records_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_match_records_updated_at
on public.match_records;

create trigger set_match_records_updated_at
before update on public.match_records
for each row
execute function public.set_match_records_updated_at();
