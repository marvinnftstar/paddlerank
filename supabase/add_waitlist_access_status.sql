alter table public.waitlist_signups
add column if not exists access_status text not null default 'pending';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'waitlist_signups_access_status_check'
  ) then
    alter table public.waitlist_signups
    add constraint waitlist_signups_access_status_check
    check (access_status in ('pending', 'approved', 'blocked'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'waitlist_signups'
      and policyname = 'Allow authenticated users to read own waitlist status'
  ) then
    create policy "Allow authenticated users to read own waitlist status"
    on public.waitlist_signups
    for select
    to authenticated
    using (lower(email) = lower(auth.jwt() ->> 'email'));
  end if;
end $$;
