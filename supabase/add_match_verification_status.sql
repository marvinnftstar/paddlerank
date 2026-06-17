alter table public.match_records
add column if not exists verification_status text;

alter table public.match_records
alter column verification_status set default 'pending';

update public.match_records
set verification_status = 'pending'
where verification_status is null;

alter table public.match_records
alter column verification_status set not null;

alter table public.match_records
drop constraint if exists match_records_verification_status_check;

alter table public.match_records
add constraint match_records_verification_status_check
check (
  verification_status in (
    'pending',
    'confirmed',
    'disputed',
    'admin_verified'
  )
);
