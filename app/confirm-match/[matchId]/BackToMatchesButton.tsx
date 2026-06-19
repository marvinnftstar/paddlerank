"use client";

import { useRouter } from "next/navigation";

type BackToMatchesButtonProps = {
  matchId: string;
};

const MATCH_HISTORY_RETURN_KEY = "paddlerank-match-history-return";

export function BackToMatchesButton({ matchId }: BackToMatchesButtonProps) {
  const router = useRouter();

  function goBack() {
    const cameFromMatchHistory =
      window.sessionStorage.getItem(MATCH_HISTORY_RETURN_KEY) === matchId;

    window.sessionStorage.removeItem(MATCH_HISTORY_RETURN_KEY);
    router.push(cameFromMatchHistory ? "/matches" : "/");
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-court-teal/25 bg-white px-5 py-2 text-sm font-black text-court-navy transition hover:border-court-mint hover:text-court-ocean"
    >
      ← Back to matches
    </button>
  );
}
