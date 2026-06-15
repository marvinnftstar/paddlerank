import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkWaitlistAccess } from "@/lib/waitlistAccess";

export const dynamic = "force-dynamic";

const clubHighlights = [
  {
    title: "Club Profiles",
    body: "Create a home for your club on PaddleRank.",
  },
  {
    title: "Member Tracking",
    body: "Help members track matches and progress over time.",
  },
  {
    title: "Rankings Ready",
    body: "Prepare your community for future verified rankings.",
  },
  {
    title: "Events Coming Later",
    body: "Club calendars and events are planned for a future phase.",
  },
];

const clubInterestLink =
  "mailto:hello@paddlerank.xyz?subject=Club%20Interest%20-%20PaddleRank";

export default async function ClubsPage() {
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

  const access = await checkWaitlistAccess(supabase, user, "clubs");

  if (!access.isApproved) {
    redirect("/early-access");
  }

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
            <Link href="/dashboard" className="flex items-center gap-3">
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
            </Link>

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
              aria-label="Player sections"
              className="flex w-full gap-1 overflow-x-auto rounded-2xl border border-court-teal/15 bg-court-mist p-1 lg:w-auto"
            >
              <Link
                href="/dashboard"
                className="flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-center text-sm font-black text-slate-500 transition hover:text-court-navy lg:flex-none"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-center text-sm font-black text-slate-500 transition hover:text-court-navy lg:flex-none"
              >
                Profile
              </Link>
              <Link
                href="/matches"
                className="flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-center text-sm font-black text-slate-500 transition hover:text-court-navy lg:flex-none"
              >
                Matches
              </Link>
              <span className="flex-1 whitespace-nowrap rounded-xl bg-white px-3 py-2 text-center text-sm font-black text-court-navy shadow-sm lg:flex-none">
                Clubs
              </span>
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
            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-court-ocean">
                  Clubs
                </p>
                <h1 className="mt-3 text-2xl font-black leading-tight text-court-navy sm:text-4xl">
                  Bring PaddleRank to Your Pickleball Club
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                  PaddleRank is preparing tools for clubs to organize players,
                  track match activity, and support fair community rankings. We
                  are currently accepting early club interest while we validate
                  the best features for pickleball communities.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href={clubInterestLink}
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-court-mint px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-court-ocean sm:w-auto"
                  >
                    Register Club Interest
                  </a>
                  <p className="rounded-2xl border border-court-teal/20 bg-court-mist px-4 py-3 text-sm font-semibold text-court-navy">
                    Early clubs can onboard up to 15 members for free during
                    validation.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[linear-gradient(135deg,#155A8A_0%,#0D82A7_55%,#10BFA0_100%)] p-5 text-white">
                <p className="text-sm font-bold text-white/75">
                  Validation phase
                </p>
                <p className="mt-2 text-2xl font-black">
                  Built with clubs, not ahead of them.
                </p>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  Share your interest now so PaddleRank can learn what club
                  organizers and players need most before deeper tools are
                  built.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {clubHighlights.map((highlight) => (
              <article
                key={highlight.title}
                className="rounded-2xl border border-court-teal/15 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-court-mint/50 hover:shadow-glow sm:p-5"
              >
                <h2 className="text-lg font-black text-court-navy">
                  {highlight.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {highlight.body}
                </p>
              </article>
            ))}
          </div>

          <section className="mt-6 rounded-2xl border border-court-teal/15 bg-white p-4 shadow-sm sm:p-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-court-ocean">
              MVP boundary
            </p>
            <h2 className="mt-2 text-2xl font-black text-court-navy">
              Club tools are being validated first.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              This page is for early interest only. Full club management,
              payments, events, calendars, ranking systems, and member limits
              will be considered in future phases after PaddleRank learns from
              early clubs.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
