import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MatchForm } from "@/components/matches/MatchForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkWaitlistAccess } from "@/lib/waitlistAccess";

export const dynamic = "force-dynamic";

type MatchesPageProps = {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

type MatchRecord = {
  id: string;
  match_type: "singles" | "doubles";
  opponent_name: string;
  partner_name: string | null;
  score: string;
  result: "win" | "loss";
  match_date: string;
  notes: string | null;
  created_at: string;
};

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function formatMatchDate(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default async function MatchesPage({ searchParams }: MatchesPageProps) {
  const params = await searchParams;
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

  const access = await checkWaitlistAccess(supabase, user, "matches");

  if (!access.isApproved) {
    redirect("/early-access");
  }

  const { data, error: historyError } = await supabase
    .from("match_records")
    .select(
      "id, match_type, opponent_name, partner_name, score, result, match_date, notes, created_at",
    )
    .eq("user_id", user.id)
    .order("match_date", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<MatchRecord[]>();

  const matches = data || [];

  async function saveMatch(formData: FormData) {
    "use server";

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

    const access = await checkWaitlistAccess(supabase, user, "match-save");

    if (!access.isApproved) {
      redirect("/early-access");
    }

    const matchType = getFormValue(formData, "match_type");
    const opponentName = getFormValue(formData, "opponent_name");
    const partnerName = getFormValue(formData, "partner_name");
    const score = getFormValue(formData, "score");
    const result = getFormValue(formData, "result");
    const matchDate = getFormValue(formData, "match_date");
    const notes = getFormValue(formData, "notes");

    const hasValidMatchType =
      matchType === "singles" || matchType === "doubles";
    const hasValidResult = result === "win" || result === "loss";

    if (
      !hasValidMatchType ||
      !hasValidResult ||
      !opponentName ||
      !score ||
      !matchDate ||
      (matchType === "doubles" && !partnerName)
    ) {
      redirect("/matches?error=invalid-fields");
    }

    const { error } = await supabase.from("match_records").insert({
      user_id: user.id,
      match_type: matchType,
      opponent_name: opponentName,
      partner_name: matchType === "doubles" ? partnerName : null,
      score,
      result,
      match_date: matchDate,
      notes: notes || null,
    });

    if (error) {
      console.error("PaddleRank match save error:", error);
      redirect("/matches?error=save-failed");
    }

    redirect("/matches?saved=1");
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
        <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-court-teal/25 bg-white px-4 py-2 text-sm font-black text-court-navy transition hover:border-court-mint hover:text-court-ocean"
              >
                Logout
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-1 lg:justify-end">
            <nav
              aria-label="Player sections"
              className="flex gap-1 overflow-x-auto rounded-2xl border border-court-teal/15 bg-court-mist p-1"
            >
              <Link
                href="/dashboard"
                className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-black text-slate-500 transition hover:text-court-navy"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-black text-slate-500 transition hover:text-court-navy"
              >
                Profile
              </Link>
              <span className="whitespace-nowrap rounded-xl bg-white px-3 py-2 text-sm font-black text-court-navy shadow-sm">
                Matches
              </span>
              <span className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-black text-slate-500">
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

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <section className="rounded-3xl border border-court-teal/15 bg-white p-5 shadow-glow sm:p-6">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-court-ocean">
                Match tracking
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-court-navy">
                Log a completed match.
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Add the match details below. Your record is private to your
                PaddleRank account.
              </p>

              {params.saved === "1" ? (
                <p className="mt-5 rounded-xl bg-court-green/25 px-4 py-3 text-sm font-black text-court-navy">
                  Match saved.
                </p>
              ) : null}

              {params.error ? (
                <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {params.error === "invalid-fields"
                    ? "Please complete all required match fields."
                    : "Match could not be saved. Please check the match_records table setup."}
                </p>
              ) : null}

              <MatchForm action={saveMatch} />
            </section>

            <section className="rounded-3xl border border-court-teal/15 bg-white p-5 shadow-sm sm:p-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-court-ocean">
                  Match history
                </p>
                <h2 className="mt-2 text-2xl font-black text-court-navy">
                  {matches.length === 0
                    ? "No matches logged yet."
                    : `${matches.length} ${
                        matches.length === 1 ? "match" : "matches"
                      } logged.`}
                </h2>
              </div>

              {historyError ? (
                <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  Match history could not be loaded.
                </p>
              ) : matches.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-court-teal/30 bg-court-mist px-5 py-8 text-center">
                  <p className="text-sm leading-6 text-slate-600">
                    Save your first match to start building your history.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {matches.map((match) => (
                    <article
                      key={match.id}
                      className="rounded-2xl border border-court-teal/15 bg-court-mist p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                                match.result === "win"
                                  ? "bg-court-green/25 text-court-navy"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {match.result}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-court-ocean">
                              {match.match_type}
                            </span>
                          </div>
                          <h3 className="mt-3 text-lg font-black text-court-navy">
                            vs. {match.opponent_name}
                          </h3>
                          {match.partner_name ? (
                            <p className="mt-1 text-sm font-semibold text-slate-600">
                              Partner: {match.partner_name}
                            </p>
                          ) : null}
                        </div>

                        <div className="sm:text-right">
                          <p className="text-2xl font-black text-court-navy">
                            {match.score}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {formatMatchDate(match.match_date)}
                          </p>
                        </div>
                      </div>

                      {match.notes ? (
                        <p className="mt-4 border-t border-court-teal/15 pt-4 text-sm leading-6 text-slate-600">
                          {match.notes}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
