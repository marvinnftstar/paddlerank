create table if not exists public.match_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_type text not null check (match_type in ('singles', 'doubles')),
  opponent_name text not null,
  partner_name text,
  score text not null,
  result text not null check (result in ('win', 'loss')),
  verification_status text not null default 'pending' check (
    verification_status in (
      'pending',
      'confirmed',
      'disputed',
      'admin_verified',
      'rejected'
    )
  ),
  confirmation_trust_level text check (
    confirmation_trust_level in ('guest_confirmed', 'account_confirmed')
  ),
  confirmed_by_user_id uuid references auth.users(id) on delete set null,
  account_confirmed_at timestamp with time zone,
  confirmation_token uuid not null default gen_random_uuid() unique,
  match_date date not null,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.match_records
drop constraint if exists match_records_no_self_account_confirmation_check;

alter table public.match_records
add constraint match_records_no_self_account_confirmation_check
check (
  confirmed_by_user_id is null
  or confirmed_by_user_id <> user_id
);

alter table public.match_records
drop constraint if exists match_records_account_confirmation_fields_check;

alter table public.match_records
add constraint match_records_account_confirmation_fields_check
check (
  (
    confirmation_trust_level = 'account_confirmed'
    and verification_status = 'confirmed'
    and account_confirmed_at is not null
  )
  or
  (
    confirmation_trust_level is distinct from 'account_confirmed'
    and confirmed_by_user_id is null
    and account_confirmed_at is null
  )
);

create schema if not exists private;

create or replace function private.enforce_match_account_confirmation_attribution()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.confirmation_trust_level = 'account_confirmed' then
    if new.verification_status <> 'confirmed' then
      raise exception using
        errcode = '23514',
        message = 'Account-confirmed matches must have confirmed verification status.';
    end if;

    if new.account_confirmed_at is null then
      raise exception using
        errcode = '23514',
        message = 'Account-confirmed matches must have an account confirmation timestamp.';
    end if;

    if new.confirmed_by_user_id is null then
      if tg_op = 'UPDATE' then
        if old.confirmed_by_user_id is not null
          and not exists (
            select 1
            from auth.users
            where id = old.confirmed_by_user_id
          )
        then
          return new;
        end if;
      end if;

      raise exception using
        errcode = '23514',
        message = 'Account-confirmed matches must identify the confirming account.';
    end if;

    if new.confirmed_by_user_id = new.user_id then
      raise exception using
        errcode = '23514',
        message = 'Match owners cannot account-confirm their own matches.';
    end if;
  elsif new.confirmed_by_user_id is not null
    or new.account_confirmed_at is not null
  then
    raise exception using
      errcode = '23514',
      message = 'Only account-confirmed matches may retain account attribution.';
  end if;

  return new;
end;
$$;

revoke execute
on function private.enforce_match_account_confirmation_attribution()
from public, anon, authenticated;

drop trigger if exists enforce_match_account_confirmation_attribution
on public.match_records;

create trigger enforce_match_account_confirmation_attribution
before insert or update on public.match_records
for each row
execute function private.enforce_match_account_confirmation_attribution();

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
