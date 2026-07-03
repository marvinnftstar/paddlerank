# PaddleRank

**Track. Compete. Rank Up.**

PaddleRank is a live pickleball match tracking and ranking platform for players across the Philippines.

## Tech Stack

* Next.js
* TypeScript
* Tailwind CSS
* Supabase
* Vercel

## Current Version

The current MVP focuses on Google-authenticated player access, match tracking,
player profiles, and lightweight club onboarding.

The page includes:

* PaddleRank logo
* App name and tagline
* Google login for players
* Immediate access to the player dashboard after sign-in
* Logged-in Clubs page with approved club directory
* Supabase-powered club submission form for review
* Small feature highlights
* Footer

Club onboarding starts with simple club profile submissions. New submissions
are saved as `pending` and must be manually changed to `approved` in Supabase
before they appear in the club directory. Approved submitters can manage their
own club profile and publish optional Discord and Facebook community links.
Both remain external links; there is no in-app chat or social authentication.

## Logo

The logo is stored at:

```text
public/PaddleRank.png
```

It is loaded in the app as:

```text
/PaddleRank.png
```

## Legacy Waitlist Data

The live app no longer reads from or writes to `waitlist_signups`. The existing
table, records, access-status migration, and historical schema definitions are
retained for a later reviewed database cleanup. Do not apply
`supabase/add_waitlist_access_status.sql` to new environments.

## Player Profile Setup

PaddleRank uses a `profiles` table for basic player profile details.

Run this SQL in the Supabase SQL Editor:

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
partner names, score, result, match date, optional notes, and match
verification status. New submitted matches are `pending` by default. Row Level
Security limits each player to their own match records.

Existing projects can use the local SQL file below to add match verification
status safely. Apply it manually in Supabase only after reviewing it:

```text
supabase/add_match_verification_status.sql
```

To enable opponent confirmation links, also run this SQL file in the Supabase
SQL Editor:

```text
supabase/add_opponent_match_confirmation.sql
```

Each new match starts as `pending`. The player can open the confirmation page
from match history and share its private link with the opponent. The opponent
can mark the match as `confirmed` or `disputed`. Editing a match returns it to
`pending` so the changed result can be reviewed again.

To distinguish shared-link confirmations from future account confirmations,
also run this SQL file in the Supabase SQL Editor:

```text
supabase/add_match_confirmation_trust_level.sql
```

The migration safely marks existing `confirmed` matches as Guest-confirmed.
Pending, disputed, and admin-verified matches keep an empty trust level.

## Club Setup

PaddleRank stores club profile submissions in a `clubs` table.

Run this SQL in the Supabase SQL Editor:

```text
supabase/create_clubs_table.sql
```

The club table stores:

* club name
* city or location
* contact person
* contact email
* optional contact number
* club description
* optional home court
* optional playing schedule
* optional logo URL
* optional Discord invite URL
* optional Facebook Page or Group URL
* approval status

New club submissions are saved with `status = 'pending'`. Pending clubs are not
shown in the directory. To publish a club, open the `clubs` table in Supabase
and manually change its `status` value from `pending` to `approved`.

Existing projects that already created the `clubs` table should also run this
SQL file so users can see their own pending submission status:

```text
supabase/update_clubs_read_policy_for_submitters.sql
```

Then run this migration to add Discord links and approved-owner profile
management:

```text
supabase/add_club_owner_management_and_discord.sql
```

To add the optional Facebook Page or Group link, also run:

```text
supabase/add_club_facebook_url.sql
```

Club logos remain URL-only. Logo URLs must use HTTPS. The migration allows an
approved owner to update only their own club's editable profile columns; status,
ownership, IDs, and timestamps remain protected.

## Environment Variables

Create a `.env.local` file in the root folder:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Use `.env.example` as the safe template. `SUPABASE_SERVICE_ROLE_KEY` is used
only by the server-side match confirmation page. Never prefix it with
`NEXT_PUBLIC_`, expose it in browser code, or put real keys in documentation.

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

Run focused automated tests:

```bash
npm run test
```

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
   * `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy.

## Vercel Web Analytics

PaddleRank uses `@vercel/analytics` in the root layout. After the app is
deployed on Vercel, website traffic will appear in the Vercel project
Analytics dashboard.
