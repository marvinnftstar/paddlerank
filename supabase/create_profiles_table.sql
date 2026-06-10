create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  display_name text,
  city text,
  province text,
  region text,
  pickleball_club text,
  skill_level text,
  preferred_play_type text,
  profile_completed boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique(user_id)
);

alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can read own profile'
  ) then
    create policy "Users can read own profile"
    on public.profiles
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
      and tablename = 'profiles'
      and policyname = 'Users can insert own profile'
  ) then
    create policy "Users can insert own profile"
    on public.profiles
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
      and tablename = 'profiles'
      and policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile"
    on public.profiles
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end $$;
