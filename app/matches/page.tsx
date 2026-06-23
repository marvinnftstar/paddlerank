import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MatchHistoryItem } from "@/components/matches/MatchHistoryItem";
import { MatchForm } from "@/components/matches/MatchForm";
import {
  type MatchConfirmationTrustLevel,
  type MatchVerificationStatus,
} from "@/lib/matches";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkWaitlistAccess } from "@/lib/waitlistAccess";

export const dynamic = "force-dynamic";

type MatchesPageProps = {
  searchParams: Promise<{
    saved?: string;
    updated?: string;
    deleted?: string;
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
  verification_status: MatchVerificationStatus | null;
  confirmation_trust_level?: MatchConfirmationTrustLevel | null;
  confirmation_token?: string | null;
  match_date: string;
  notes: string | null;
  created_at: string;
};

const MATCH_FIELD_LIMITS = {
  opponentName: 100,
  partnerName: 100,
  score: 100,
  notes: 1000,
};

const MATCH_HISTORY_SELECT =
  "id, match_type, opponent_name, partner_name, score, result, verification_status, confirmation_trust_level, confirmation_token, match_date, notes, created_at";

const MATCH_HISTORY_SELECT_WITHOUT_TRUST_LEVEL =
  "id, match_type, opponent_name, partner_name, score, result, verification_status, confirmation_token, match_date, notes, created_at";

const MATCH_HISTORY_SELECT_WITHOUT_TOKEN =
  "id, match_type, opponent_name, partner_name, score, result, verification_status, confirmation_trust_level, match_date, notes, created_at";

const MATCH_HISTORY_SELECT_WITHOUT_TRUST_LEVEL_OR_TOKEN =
  "id, match_type, opponent_name, partner_name, score, result, verification_status, match_date, notes, created_at";

const MATCH_HISTORY_SELECT_WITHOUT_STATUS =
  "id, match_type, opponent_name, partner_name, score, result, match_date, notes, created_at";

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
}

function parseMatchForm(formData: FormData) {
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
  const hasValidLengths =
    opponentName.length <= MATCH_FIELD_LIMITS.opponentName &&
    partnerName.length <= MATCH_FIELD_LIMITS.partnerName &&
    score.length <= MATCH_FIELD_LIMITS.score &&
    notes.length <= MATCH_FIELD_LIMITS.notes;

  if (
    !hasValidMatchType ||
    !hasValidResult ||
    !opponentName ||
    !score ||
    !isValidDateInput(matchDate) ||
    !hasValidLengths ||
    (matchType === "doubles" && !partnerName)
  ) {
    return null;
  }

  return {
    match_type: matchType,
    opponent_name: opponentName,
    partner_name: matchType === "doubles" ? partnerName : null,
    score,
    result,
    match_date: matchDate,
    notes: notes || null,
  };
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

  let historyResult = await supabase
    .from("match_records")
    .select(MATCH_HISTORY_SELECT)
    .eq("user_id", user.id)
    .order("match_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<MatchRecord[]>();

  let trustLevelColumnAvailable = true;

  if (historyResult.error?.message.includes("confirmation_trust_level")) {
    trustLevelColumnAvailable = false;
    historyResult = await supabase
      .from("match_records")
      .select(MATCH_HISTORY_SELECT_WITHOUT_TRUST_LEVEL)
      .eq("user_id", user.id)
      .order("match_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<MatchRecord[]>();
  }

  if (historyResult.error?.message.includes("confirmation_token")) {
    historyResult = await supabase
      .from("match_records")
      .select(
        trustLevelColumnAvailable
          ? MATCH_HISTORY_SELECT_WITHOUT_TOKEN
          : MATCH_HISTORY_SELECT_WITHOUT_TRUST_LEVEL_OR_TOKEN,
      )
      .eq("user_id", user.id)
      .order("match_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<MatchRecord[]>();
  }

  if (historyResult.error?.message.includes("verification_status")) {
    historyResult = await supabase
      .from("match_records")
      .select(MATCH_HISTORY_SELECT_WITHOUT_STATUS)
      .eq("user_id", user.id)
      .order("match_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<MatchRecord[]>();
  }

  const matches = historyResult.data || [];

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

    const matchValues = parseMatchForm(formData);

    if (!matchValues) {
      redirect("/matches?error=invalid-fields");
    }

    const { error } = await supabase.from("match_records").insert({
      user_id: user.id,
      ...matchValues,
    });

    if (error) {
      console.error("PaddleRank match save error:", error);
      redirect("/matches?error=save-failed");
    }

    redirect(`/matches?saved=${Date.now()}`);
  }

  async function updateMatch(formData: FormData) {
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

    const access = await checkWaitlistAccess(supabase, user, "match-update");

    if (!access.isApproved) {
      redirect("/early-access");
    }

    const matchId = getFormValue(formData, "match_id");
    const matchValues = parseMatchForm(formData);

    if (!isValidUuid(matchId) || !matchValues) {
      redirect("/matches?error=invalid-edit");
    }

    const { data, error } = await supabase
      .from("match_records")
      .update({
        ...matchValues,
        // Editing a result invalidates any earlier opponent response.
        verification_status: "pending",
        confirmation_trust_level: null,
        confirmed_by_user_id: null,
        account_confirmed_at: null,
      })
      .eq("id", matchId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      console.error("PaddleRank match update error:", error);
      redirect("/matches?error=update-failed");
    }

    redirect(`/matches?updated=${Date.now()}`);
  }

  async function deleteMatch(formData: FormData) {
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

    const access = await checkWaitlistAccess(supabase, user, "match-delete");

    if (!access.isApproved) {
      redirect("/early-access");
    }

    const matchId = getFormValue(formData, "match_id");

    if (!isValidUuid(matchId)) {
      redirect("/matches?error=invalid-delete");
    }

    const { data, error } = await supabase
      .from("match_records")
      .delete()
      .eq("id", matchId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      console.error("PaddleRank match delete error:", error);
      redirect("/matches?error=delete-failed");
    }

    redirect(`/matches?deleted=${Date.now()}`);
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
              <span className="flex-1 whitespace-nowrap rounded-xl bg-white px-3 py-2 text-center text-sm font-black text-court-navy shadow-sm lg:flex-none">
                Matches
              </span>
              <Link
                href="/clubs"
                className="flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-center text-sm font-black text-slate-500 transition hover:text-court-navy lg:flex-none"
              >
                Clubs
              </Link>
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
          <div className="grid gap-5 sm:gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <section className="rounded-3xl border border-court-teal/15 bg-white p-4 shadow-glow sm:p-6">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-court-ocean">
                Match tracking
              </p>
              <h1 className="mt-3 text-2xl font-black leading-tight text-court-navy sm:text-3xl">
                Log a match result.
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Add the final score and match details. Your record stays
                private to your PaddleRank account.
              </p>

              {params.saved ? (
                <p
                  role="status"
                  className="mt-5 rounded-xl bg-court-green/25 px-4 py-3 text-sm font-black text-court-navy"
                >
                  Match saved. It is pending opponent confirmation.
                </p>
              ) : null}

              {params.updated ? (
                <p
                  role="status"
                  className="mt-5 rounded-xl bg-court-green/25 px-4 py-3 text-sm font-black text-court-navy"
                >
                  Match updated. It is pending opponent confirmation again.
                </p>
              ) : null}

              {params.deleted ? (
                <p
                  role="status"
                  className="mt-5 rounded-xl bg-court-green/25 px-4 py-3 text-sm font-black text-court-navy"
                >
                  Match deleted. Your stats are up to date.
                </p>
              ) : null}

              {params.error ? (
                <p
                  role="alert"
                  className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                >
                  {params.error === "invalid-fields"
                    ? "Please review the required fields and value lengths, then try again."
                    : params.error === "invalid-edit"
                      ? "Please review the match changes and try again."
                      : params.error === "invalid-delete"
                        ? "That match could not be deleted."
                        : params.error === "update-failed"
                          ? "We could not update this match. Please try again."
                          : params.error === "delete-failed"
                            ? "We could not delete this match. Please try again."
                            : "We could not save this match. Please try again in a moment."}
                </p>
              ) : null}

              <MatchForm key={params.saved || "new"} action={saveMatch} />
            </section>

            <section className="rounded-3xl border border-court-teal/15 bg-white p-4 shadow-sm sm:p-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-court-ocean">
                  Match history
                </p>
                <h2 className="mt-2 text-2xl font-black text-court-navy">
                  {matches.length === 0
                    ? "No matches logged yet."
                    : `Latest ${matches.length} ${
                        matches.length === 1 ? "match" : "matches"
                      }.`}
                </h2>
              </div>

              {historyResult.error ? (
                <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  Match history could not be loaded.
                </p>
              ) : matches.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-court-teal/30 bg-court-mist px-4 py-6 text-center sm:mt-6 sm:px-5 sm:py-8">
                  <p className="text-sm leading-6 text-slate-600">
                    Log your first match to start your private match history.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {matches.map((match) => (
                    <MatchHistoryItem
                      key={match.id}
                      match={match}
                      formattedDate={formatMatchDate(match.match_date)}
                      updateAction={updateMatch}
                      deleteAction={deleteMatch}
                    />
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
