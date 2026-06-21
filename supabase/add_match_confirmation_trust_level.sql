alter table public.match_records
add column if not exists confirmation_trust_level text;

update public.match_records
set confirmation_trust_level = 'guest_confirmed'
where verification_status = 'confirmed'
  and confirmation_trust_level is null;

alter table public.match_records
drop constraint if exists match_records_confirmation_trust_level_check;

alter table public.match_records
add constraint match_records_confirmation_trust_level_check
check (
  confirmation_trust_level is null
  or confirmation_trust_level in ('guest_confirmed', 'account_confirmed')
);
