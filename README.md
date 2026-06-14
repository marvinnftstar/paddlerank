# PaddleRank

**Track. Compete. Rank Up.**

PaddleRank is a one-page waitlist landing page for an upcoming pickleball match tracking and ranking platform for players across the Philippines.

## Tech Stack

* Next.js
* TypeScript
* Tailwind CSS
* Supabase
* Vercel

## Current Version

Version 1 focuses only on waitlist signups.

The page includes:

* PaddleRank logo
* App name and tagline
* Short waitlist description
* Supabase-powered waitlist form
* Small feature highlights
* Footer

## Logo

The logo is stored at:

```text
public/PaddleRank.png
```

It is loaded in the app as:

```text
/PaddleRank.png
```

## Supabase Setup

Create a Supabase table named `waitlist_signups`.

Run this SQL in the Supabase SQL Editor:

```sql
create table if not exists waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  city_province text,
  skill_level text,
  preferred_play_type text,
  message text,
  access_status text not null default 'pending',
  created_at timestamp with time zone default now()
);

alter table waitlist_signups
add constraint waitlist_signups_access_status_check
check (access_status in ('pending', 'approved', 'blocked'));

alter table waitlist_signups enable row level security;

create policy "Allow public waitlist signups"
on waitlist_signups
for insert
to anon
with check (true);

create policy "Allow authenticated users to read own waitlist status"
on waitlist_signups
for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'));
```

Existing projects can use the local SQL file below to add the early access
status column. Apply it manually in Supabase only after reviewing it:

```text
supabase/add_waitlist_access_status.sql
```

Only users with `access_status = 'approved'` can open `/dashboard` and
`/profile` or `/matches`. New waitlist signups are `pending` by default.

## Player Profile Setup

PaddleRank uses a `profiles` table for basic player profile details.

Run this SQL in the Supabase SQL Editor after the waitlist table is ready:

```text
supabase/create_profiles_table.sql
```

The profile table stores:

* full name
* display name
* city
* province
* region
* pickleball club
* skill level
* preferred play type
* profile completion status

Each signed-in user can only read and update their own profile. A profile is
marked complete after full name, display name, city, province, skill level, and
preferred play type are saved.

## Match Tracking Setup

PaddleRank stores each player's private match history in `match_records`.

Run this SQL in the Supabase SQL Editor:

```text
supabase/create_match_records_table.sql
```

The match tracking MVP supports singles and doubles, manual opponent and
partner names, score, result, match date, and optional notes. Row Level
Security limits each player to their own match records.

## Environment Variables

Create a `.env.local` file in the root folder:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use `.env.example` as the safe template. Do not put real keys in documentation.

## Google Login Setup

PaddleRank uses Supabase Auth for Google Login.

In Supabase:

1. Go to **Authentication**.
2. Go to **Providers**.
3. Turn on **Google**.
4. Add your Google OAuth client ID and client secret in Supabase.
5. Add these redirect URLs:

```text
http://localhost:3000/auth/callback
https://www.paddlerank.xyz/auth/callback
```

In Vercel, keep these existing environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not add a Supabase service role key to frontend code.

## Run Locally

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the localhost URL shown in the terminal. It is usually:

```text
http://localhost:3000
```

If port `3000` is already being used, Next.js may use `3001`.

## Check Errors

Run TypeScript checking:

```bash
npm run type-check
```

Run a production build:

```bash
npm run build
```

## Deploy to Vercel

1. Push the project to GitHub.
2. Import the GitHub repository in Vercel.
3. Add these Vercel environment variables:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.
