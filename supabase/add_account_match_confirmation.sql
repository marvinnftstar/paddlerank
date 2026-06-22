alter table public.match_records
add column if not exists confirmed_by_user_id uuid
references auth.users(id) on delete set null;

alter table public.match_records
add column if not exists account_confirmed_at timestamp with time zone;

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
