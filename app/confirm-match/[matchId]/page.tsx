import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getMatchVerificationStatus,
  type MatchVerificationStatus,
} from "@/lib/matches";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ConfirmMatchPageProps = {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<{
    token?: string;
    response?: string;
    error?: string;
  }>;
};

type MatchConfirmationRow = {
  id: string;
  user_id: string;
  match_type: "singles" | "doubles";
  opponent_name: string;
  partner_name: string | null;
  score: string;
  result: "win" | "loss";
  verification_status: MatchVerificationStatus | null;
  match_date: string;
};

type ProfileNameRow = {
  display_name: string | null;
  full_name: string | null;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatMatchDate(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default async function ConfirmMatchPage({
  params,
  searchParams,
}: ConfirmMatchPageProps) {
  const { matchId } = await params;
  const query = await searchParams;
  const token = query.token || "";
  const supabase = createSupabaseAdminClient();
  const hasValidLink = UUID_PATTERN.test(matchId) && UUID_PATTERN.test(token);

  let match: MatchConfirmationRow | null = null;
  let loadError = !supabase || !hasValidLink;

  if (supabase && hasValidLink) {
    const result = await supabase
      .from("match_records")
      .select(
        "id, user_id, match_type, opponent_name, partner_name, score, result, verification_status, match_date",
      )
      .eq("id", matchId)
      .eq("confirmation_token", token)
      .maybeSingle<MatchConfirmationRow>();

    match = result.data;
    loadError = Boolean(result.error) || !match;
  }

  let playerName = "PaddleRank player";

  if (supabase && match) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, full_name")
      .eq("user_id", match.user_id)
      .maybeSingle<ProfileNameRow>();

    playerName = profile?.display_name || profile?.full_name || playerName;
  }

  async function respondToMatch(formData: FormData) {
    "use server";

    const submittedMatchId = String(formData.get("match_id") || "");
    const submittedToken = String(formData.get("token") || "");
    const response = String(formData.get("response") || "");

    if (
      !UUID_PATTERN.test(submittedMatchId) ||
      !UUID_PATTERN.test(submittedToken) ||
      (response !== "confirmed" && response !== "disputed")
    ) {
      redirect(`/confirm-match/${matchId}?error=invalid-link`);
    }

    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      redirect(
        `/confirm-match/${submittedMatchId}?token=${submittedToken}&error=unavailable`,
      );
    }

    const { data, error } = await supabase
      .from("match_records")
      .update({ verification_status: response })
      .eq("id", submittedMatchId)
      .eq("confirmation_token", submittedToken)
      .in("verification_status", ["pending", "confirmed", "disputed"])
      .select("id")
      .maybeSingle();

    if (error || !data) {
      redirect(
        `/confirm-match/${submittedMatchId}?token=${submittedToken}&error=update-failed`,
      );
    }

    redirect(
      `/confirm-match/${submittedMatchId}?token=${submittedToken}&response=${response}`,
    );
  }

  const verificationStatus = getMatchVerificationStatus(
    match?.verification_status,
  );
  const winner = match?.result === "win" ? playerName : match?.opponent_name;
  const canRespond =
    match &&
    ["pending", "confirmed", "disputed"].includes(verificationStatus);

  return (
    <main className="min-h-screen bg-court-mist px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image
            src="/PaddleRank.png"
            alt="PaddleRank logo"
            width={48}
            height={48}
            priority
            className="h-12 w-12 rounded-xl object-contain"
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

        <section className="mt-6 rounded-3xl border border-court-teal/15 bg-white p-5 shadow-glow sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-court-ocean">
            Match confirmation
          </p>
          <h1 className="mt-3 text-2xl font-black leading-tight text-court-navy sm:text-3xl">
            Review this match result.
          </h1>

          {loadError || !match ? (
            <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
              This confirmation link is invalid or unavailable. Ask the player
              who logged the match for a new link.
            </p>
          ) : (
            <>
              {query.response === "confirmed" ? (
                <p role="status" className="mt-5 rounded-xl bg-court-green/25 px-4 py-3 text-sm font-black text-court-navy">
                  Thanks! This match has been confirmed.
                </p>
              ) : null}

              {query.response === "disputed" ? (
                <p role="status" className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900">
                  This match has been marked as disputed. The PaddleRank team
                  may review it later.
                </p>
              ) : null}

              {query.error ? (
                <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  We could not update this match. Please check the link and try
                  again.
                </p>
              ) : null}

              <dl className="mt-6 grid gap-4 rounded-2xl border border-court-teal/15 bg-court-mist p-4 sm:grid-cols-2 sm:p-5">
                <div>
                  <dt className="text-xs font-black uppercase tracking-wide text-slate-500">Player</dt>
                  <dd className="mt-1 font-black text-court-navy">{playerName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-wide text-slate-500">Opponent</dt>
                  <dd className="mt-1 font-black text-court-navy">{match.opponent_name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-wide text-slate-500">Match type</dt>
                  <dd className="mt-1 font-semibold capitalize text-court-navy">{match.match_type}</dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-wide text-slate-500">Score</dt>
                  <dd className="mt-1 font-semibold text-court-navy">{match.score}</dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-wide text-slate-500">Winner</dt>
                  <dd className="mt-1 font-semibold text-court-navy">{winner}</dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-wide text-slate-500">Date</dt>
                  <dd className="mt-1 font-semibold text-court-navy">{formatMatchDate(match.match_date)}</dd>
                </div>
              </dl>

              {canRespond ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <form action={respondToMatch}>
                    <input type="hidden" name="match_id" value={match.id} />
                    <input type="hidden" name="token" value={token} />
                    <input type="hidden" name="response" value="confirmed" />
                    <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-court-mint px-5 py-3 text-sm font-black text-white transition hover:bg-court-ocean">
                      Confirm Match
                    </button>
                  </form>
                  <form action={respondToMatch}>
                    <input type="hidden" name="match_id" value={match.id} />
                    <input type="hidden" name="token" value={token} />
                    <input type="hidden" name="response" value="disputed" />
                    <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-50">
                      Dispute Match
                    </button>
                  </form>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
