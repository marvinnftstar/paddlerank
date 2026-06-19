alter table public.match_records
add column if not exists confirmation_token uuid;

update public.match_records
set confirmation_token = gen_random_uuid()
where confirmation_token is null;

alter table public.match_records
alter column confirmation_token set default gen_random_uuid();

alter table public.match_records
alter column confirmation_token set not null;

create unique index if not exists match_records_confirmation_token_idx
on public.match_records (confirmation_token);

alter table public.match_records
drop constraint if exists match_records_verification_status_check;

alter table public.match_records
add constraint match_records_verification_status_check
check (
  verification_status in (
    'pending',
    'confirmed',
    'disputed',
    'admin_verified',
    'rejected'
  )
);
