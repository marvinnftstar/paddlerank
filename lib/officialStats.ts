import type {
  MatchConfirmationTrustLevel,
  MatchVerificationStatus,
} from "@/lib/matches";

type OfficialStatsMatch = {
  verification_status: MatchVerificationStatus | string | null;
  confirmation_trust_level: MatchConfirmationTrustLevel | string | null;
};

type OfficialStatsQuery<T> = {
  or: (filters: string) => T;
};

export const OFFICIAL_STATS_ELIGIBILITY_FILTER =
  "confirmation_trust_level.eq.account_confirmed,verification_status.eq.admin_verified";

export function isOfficialStatsEligible(match: OfficialStatsMatch) {
  return (
    match.confirmation_trust_level === "account_confirmed" ||
    match.verification_status === "admin_verified"
  );
}

export function applyOfficialStatsEligibility<T>(query: OfficialStatsQuery<T>) {
  return query.or(OFFICIAL_STATS_ELIGIBILITY_FILTER);
}
