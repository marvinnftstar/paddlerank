# AGENTS.md

## Project Overview

- **Project:** PaddleRank - a pickleball match tracking and ranking platform.
- **App name:** PaddleRank
- **Tagline:** Track. Compete. Rank Up.
- **Target market:** Pickleball players in the Philippines first, then global expansion later.
- **Tone:** Modern, competitive, friendly, and community-driven.
- **My skill level:** Beginner. Explain steps clearly and avoid unnecessary technical language.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

## Development Rules

- Use Next.js, TypeScript, Tailwind CSS, Supabase, and Vercel.
- Keep code clean, simple, and beginner-friendly.
- Add comments when logic may be confusing for a non-developer.
- Prioritize mobile-first responsive design.
- Use reusable components.
- Do not overcomplicate the app.
- Always check for TypeScript and build errors after code changes.
- Always update `README.md` when setup steps change.
- Keep future expansion in mind for player profiles, match history, rankings, subscriptions, tournaments, and brackets.

## Product Goals

- Track pickleball matches.
- Support player rankings and competition history.
- Make the app easy for players and organizers to use on mobile.
- Build a strong foundation for future player profiles, match history, rankings, subscriptions, tournaments, and brackets.
- Keep the MVP simple unless the user asks for a larger version.

## Important Workflow Rules

- Read `README.md` and existing source files before changing project behavior.
- Ask before changing the selected stack, database, hosting, or app architecture.
- Ask before installing new dependencies.
- Ask before adding cloud services beyond Supabase or Vercel.
- Ask before adding authentication, payments, subscriptions, tournaments, or bracket systems unless the user requests them.
- Prefer small, focused changes that are easy for a beginner to review.

## Do

- Read existing files before modifying anything.
- Match existing patterns, naming, and style.
- Keep explanations beginner-friendly.
- Explain what each setup step means when commands are involved.
- Tell the user exactly where to run commands.
- Recommend the simplest path first.
- Handle errors clearly; do not hide failures.
- Keep changes small and scoped to what was asked.
- Run available TypeScript, build, test, or lint commands after changes when appropriate.
- Protect Supabase keys and other private values.
- Keep the app usable on desktop and mobile.
- Use reusable components where they make the app easier to maintain.

## Don't

- Do not install new dependencies without asking.
- Do not delete or overwrite files without confirming.
- Do not hardcode Supabase keys, API keys, passwords, or credentials.
- Do not expose private environment variables in client-side code.
- Do not push, deploy, or force-push without permission.
- Do not make changes outside the scope of the request.
- Do not add complex frameworks unless the user approves them.
- Do not replace Supabase or Vercel unless asked.
- Do not overbuild features before the MVP needs them.

## When Stuck

- If a task is large, break it into steps and confirm the plan first.
- If an error cannot be fixed in 2 attempts, stop and explain the issue clearly.
- Include the exact error message and the file or command involved.

## Testing

- Run existing tests after any change when tests exist.
- Add at least one focused test for new features when a test framework exists.
- Check TypeScript errors after code changes.
- Run the build command after code changes when available.
- Manually verify important app screens after dashboard or UI changes.
- Never skip or delete tests just to make checks pass.

## Manual Verification Checklist

- App loads locally.
- Mobile layout is usable.
- Main pages render without browser errors.
- Match tracking views work as expected when implemented.
- Ranking views work as expected when implemented.
- Supabase reads and writes work when database features are involved.
- Data remains after refreshing the app when persistence is expected.

## Git

- Use small, focused commits with descriptive messages if asked to commit.
- Never force push.
- Do not revert user changes unless explicitly asked.

## Response Style

- Always respond with clear and concise messages.
- Use plain English when explaining setup or errors.
- Avoid long sentences, complex words, and long paragraphs.
- Include file paths when describing changes.
