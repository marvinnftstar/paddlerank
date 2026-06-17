drop policy if exists "Authenticated users can read approved clubs"
on public.clubs;

create policy "Authenticated users can read approved clubs"
on public.clubs
for select
to authenticated
using (
  status = 'approved'
  or submitted_by = auth.uid()
);
