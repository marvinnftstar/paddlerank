import type {
  MatchConfirmationTrustLevel,
  MatchVerificationStatus,
} from "@/lib/matches";

export type RankingEligibilityMatch = {
  confirmation_trust_level?:
    | MatchConfirmationTrustLevel
    | string
    | null;
  verification_status?: MatchVerificationStatus | string | null;
};

type RankingEligibilityFilter = {
  confirmation_trust_level: "account_confirmed";
  verification_status: "admin_verified";
};

export type RankingEligibilityQuery<T> = {
  match: (filter: RankingEligibilityFilter) => T;
};

// Source of truth for future ranking eligibility.
export function isRankingEligibleMatch(match: RankingEligibilityMatch) {
  return (
    match.confirmation_trust_level === "account_confirmed" &&
    match.verification_status === "admin_verified"
  );
}

export function applyRankingEligibility<T>(
  query: RankingEligibilityQuery<T>,
) {
  return query.match({
    confirmation_trust_level: "account_confirmed",
    verification_status: "admin_verified",
  });
}
