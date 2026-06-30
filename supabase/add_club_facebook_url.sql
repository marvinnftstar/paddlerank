alter table public.clubs
add column if not exists facebook_url text;

-- The existing approved-owner RLS policy protects the row. This column grant
-- adds only the Facebook field to the owner's editable profile fields.
grant update (facebook_url)
on table public.clubs
to authenticated;
