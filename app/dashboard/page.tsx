import Image from "next/image";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const stats = [
  {
    label: "Total Matches",
    value: "0",
    helper: "Matches you have logged in PaddleRank.",
  },
  {
    label: "Wins",
    value: "0",
    helper: "Winning results will appear here.",
  },
  {
    label: "Losses",
    value: "0",
    helper: "Completed match losses will be tracked.",
  },
  {
    label: "Win Rate",
    value: "0%",
    helper: "Calculated once match history exists.",
  },
  {
    label: "Club",
    value: "Not set",
    helper: "Your home club or playing group.",
  },
  {
    label: "Ranking",
    value: "Unranked",
    helper: "Rankings unlock after match tracking.",
  },
];

const navItems = ["Dashboard", "Profile", "Matches", "Clubs"];

const nextSteps = [
  "Complete player profile",
  "Join or create a club",
  "Log your first match",
  "Unlock rankings soon",
];

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Player";

  async function logout() {
    "use server";

    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-court-mist text-slate-950">
      <header className="sticky top-0 z-10 border-b border-court-teal/15 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-court-teal/25 bg-white px-4 py-2 text-sm font-black text-court-navy transition hover:border-court-mint hover:text-court-ocean"
              >
                Logout
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-1 lg:justify-end">
            <nav
              aria-label="Dashboard sections"
              className="flex gap-1 overflow-x-auto rounded-2xl border border-court-teal/15 bg-court-mist p-1"
            >
              {navItems.map((item) => (
                <span
                  key={item}
                  className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-black ${
                    item === "Dashboard"
                      ? "bg-white text-court-navy shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  {item}
                </span>
              ))}
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

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-court-teal/15 bg-white p-5 shadow-glow sm:p-7 lg:p-8">
            <div className="grid gap-7 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-court-ocean">
                  Player dashboard
                </p>
                <h1 className="mt-3 text-3xl font-black leading-tight text-court-navy sm:text-4xl">
                  Welcome, {displayName}.
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Your PaddleRank player dashboard is ready. Start tracking
                  your matches soon.
                </p>
                {user.email ? (
                  <p className="mt-4 inline-flex max-w-full rounded-2xl border border-court-teal/20 bg-court-mist px-4 py-3 text-sm font-semibold text-court-navy">
                    <span className="truncate">Signed in as {user.email}</span>
                  </p>
                ) : null}
              </div>

              <div className="rounded-2xl bg-[linear-gradient(135deg,#155A8A_0%,#0D82A7_55%,#10BFA0_100%)] p-5 text-white">
                <p className="text-sm font-bold text-white/75">
                  MVP status
                </p>
                <p className="mt-2 text-2xl font-black">Ready for setup</p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Profiles, matches, clubs, and rankings are prepared as next
                  steps.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-court-mint px-6 py-3 text-sm font-black text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-75"
              >
                Set Up Profile
              </button>
              <button
                type="button"
                disabled
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-court-teal/25 bg-white px-6 py-3 text-sm font-black text-court-navy shadow-sm transition disabled:cursor-not-allowed disabled:opacity-75"
              >
                Add Match
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-court-teal/15 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-court-mint/50 hover:shadow-glow"
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

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-2xl border border-court-teal/15 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-court-ocean">
                    Recent Match Activity
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-court-navy">
                    No matches logged yet.
                  </h2>
                </div>
                <span className="inline-flex w-fit rounded-full border border-court-green/40 bg-court-green/15 px-3 py-1 text-xs font-black uppercase tracking-wide text-court-navy">
                  Coming soon
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-court-teal/30 bg-court-mist px-5 py-8 text-center">
                <p className="mx-auto max-w-md text-sm leading-6 text-slate-600">
                  Your match history will appear here once you start tracking
                  games.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-court-teal/15 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-court-ocean">
                Next Steps
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
