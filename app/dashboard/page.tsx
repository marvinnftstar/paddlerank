import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkWaitlistAccess } from "@/lib/waitlistAccess";

export const dynamic = "force-dynamic";

type ProfileRow = {
  pickleball_club: string | null;
  profile_completed: boolean | null;
};

const navItems = [
  { label: "Dashboard" },
  { label: "Profile", href: "/profile" },
  { label: "Matches", href: "/matches" },
  { label: "Clubs" },
];

const nextSteps = [
  "Complete your player profile",
  "Log your latest match",
  "Review your match stats",
];

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/early-access");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/early-access");
  }

  const access = await checkWaitlistAccess(supabase, user, "dashboard");

  if (!access.isApproved) {
    redirect("/early-access");
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Player";

  const [profileResult, winsResult, lossesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("pickleball_club, profile_completed")
      .eq("user_id", user.id)
      .maybeSingle<ProfileRow>(),
    supabase
      .from("match_records")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("result", "win"),
    supabase
      .from("match_records")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("result", "loss"),
  ]);

  const profile = profileResult.data;
  const statsAvailable = !winsResult.error && !lossesResult.error;
  const wins = winsResult.count || 0;
  const losses = lossesResult.count || 0;
  const totalMatches = wins + losses;
  const winRate =
    statsAvailable && totalMatches > 0
      ? Math.round((wins / totalMatches) * 100)
      : 0;

  const stats = [
    {
      label: "Total Matches",
      value: statsAvailable ? String(totalMatches) : "Unavailable",
      helper: statsAvailable
        ? "Every result you have logged."
        : "Match stats could not be loaded right now.",
    },
    {
      label: "Wins",
      value: statsAvailable ? String(wins) : "Unavailable",
      helper: statsAvailable
        ? "Matches marked as wins."
        : "Match stats could not be loaded right now.",
    },
    {
      label: "Losses",
      value: statsAvailable ? String(losses) : "Unavailable",
      helper: statsAvailable
        ? "Matches marked as losses."
        : "Match stats could not be loaded right now.",
    },
    {
      label: "Win Rate",
      value: statsAvailable ? `${winRate}%` : "Unavailable",
      helper: statsAvailable
        ? "Your win percentage across logged matches."
        : "Match stats could not be loaded right now.",
    },
    {
      label: "Club",
      value: profile?.pickleball_club || "Not set",
      helper: "Your home club or playing group.",
    },
    {
      label: "Profile Status",
      value: profile?.profile_completed ? "Complete" : "Incomplete",
      helper: "Keep your player details current.",
    },
  ];

  async function logout() {
    "use server";

    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-court-mist text-slate-950">
      <header className="sticky top-0 z-10 border-b border-court-teal/15 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/PaddleRank.png"
                alt="PaddleRank logo"
                width={48}
                height={48}
                priority
                className="h-11 w-11 rounded-xl object-contain"
              />
              <div>
                <p className="text-lg font-black leading-none text-court-navy">
                  PaddleRank
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Track. Compete. Rank Up.
                </p>
              </div>
            </div>

            <form action={logout} className="lg:hidden">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-court-teal/25 bg-white px-4 py-2 text-sm font-black text-court-navy transition hover:border-court-mint hover:text-court-ocean"
              >
                Logout
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-1 lg:justify-end">
            <nav
              aria-label="Dashboard sections"
              className="flex w-full gap-1 overflow-x-auto rounded-2xl border border-court-teal/15 bg-court-mist p-1 lg:w-auto"
            >
              {navItems.map((item) =>
                item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-center text-sm font-black text-slate-500 transition hover:text-court-navy lg:flex-none"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    key={item.label}
                    className={`flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-center text-sm font-black lg:flex-none ${
                      item.label === "Dashboard"
                        ? "bg-white text-court-navy shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    {item.label}
                  </span>
                ),
              )}
            </nav>

            <form action={logout} className="hidden lg:block">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-court-teal/25 bg-white px-5 py-2 text-sm font-black text-court-navy transition hover:border-court-mint hover:text-court-ocean"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-court-teal/15 bg-white p-4 shadow-glow sm:p-7 lg:p-8">
            <div className="grid gap-5 sm:gap-7 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-court-ocean">
                  Player dashboard
                </p>
                <h1 className="mt-3 text-2xl font-black leading-tight text-court-navy sm:text-4xl">
                  Welcome, {displayName}.
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Keep your profile, match record, and key stats together in
                  one simple player hub.
                </p>
                {user.email ? (
                  <p className="mt-4 inline-flex max-w-full rounded-2xl border border-court-teal/20 bg-court-mist px-4 py-3 text-sm font-semibold text-court-navy">
                    <span className="truncate">Signed in as {user.email}</span>
                  </p>
                ) : null}
              </div>

              <div className="rounded-2xl bg-[linear-gradient(135deg,#155A8A_0%,#0D82A7_55%,#10BFA0_100%)] p-4 text-white sm:p-5">
                <p className="text-sm font-bold text-white/75">
                  Player hub
                </p>
                <p className="mt-2 text-2xl font-black">
                  Ready for your next match
                </p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Update your profile, log results, and check your progress
                  anytime.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/profile"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-court-mint px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-court-ocean sm:w-auto"
              >
                Update profile
              </Link>
              <Link
                href="/matches"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-court-teal/25 bg-white px-6 py-3 text-sm font-black text-court-navy shadow-sm transition hover:border-court-mint hover:text-court-ocean sm:w-auto"
              >
                Log a match
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-court-teal/15 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-court-mint/50 hover:shadow-glow sm:p-5"
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-court-ocean">
                  {stat.label}
                </p>
                <p className="mt-4 text-3xl font-black text-court-navy">
                  {stat.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {stat.helper}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-4 rounded-2xl border border-court-teal/15 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-600 shadow-sm">
            Current stats include submitted matches. Official rankings will
            later use verified matches only.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-2xl border border-court-teal/15 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-court-ocean">
                    Match activity
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-court-navy">
                    Your match log is ready.
                  </h2>
                </div>
                <span className="inline-flex w-fit rounded-full border border-court-green/40 bg-court-green/15 px-3 py-1 text-xs font-black uppercase tracking-wide text-court-navy">
                  Live
                </span>
              </div>

              <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-court-teal/30 bg-court-mist px-4 py-6 text-center sm:mt-6 sm:px-5 sm:py-8">
                <p className="mx-auto max-w-md text-sm leading-6 text-slate-600">
                  View, edit, or manage your match history from the Matches
                  page.
                </p>
                <Link
                  href="/matches"
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-court-mint px-5 py-2 text-sm font-black text-white shadow-sm transition hover:bg-court-ocean sm:w-auto"
                >
                  Open Matches
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-court-teal/15 bg-white p-4 shadow-sm sm:p-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-court-ocean">
                Next steps
              </p>
              <div className="mt-5 grid gap-3">
                {nextSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-2xl border border-court-teal/10 bg-court-mist px-4 py-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-court-navy shadow-sm">
                      {index + 1}
                    </span>
                    <p className="text-sm font-bold text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
