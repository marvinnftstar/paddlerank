alter table public.clubs
add column if not exists discord_invite_url text;

drop policy if exists "Approved club owners can update their club"
on public.clubs;

create policy "Approved club owners can update their club"
on public.clubs
for update
to authenticated
using (
  status = 'approved'
  and submitted_by = (select auth.uid())
)
with check (
  status = 'approved'
  and submitted_by = (select auth.uid())
);

-- RLS protects the row. Column privileges also prevent owners from changing
-- status, submitted_by, timestamps, IDs, or future admin-only fields.
revoke update on table public.clubs from authenticated;

grant update (
  club_name,
  city,
  contact_person,
  contact_email,
  contact_number,
  description,
  home_court,
  playing_schedule,
  logo_url,
  discord_invite_url
) on table public.clubs to authenticated;
