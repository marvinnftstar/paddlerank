export type MatchVerificationStatus =
  | "pending"
  | "confirmed"
  | "disputed"
  | "admin_verified"
  | "rejected";

export type MatchConfirmationTrustLevel =
  | "guest_confirmed"
  | "account_confirmed";

const MATCH_VERIFICATION_STATUSES: MatchVerificationStatus[] = [
  "pending",
  "confirmed",
  "disputed",
  "admin_verified",
  "rejected",
];

export const DEFAULT_MATCH_VERIFICATION_STATUS: MatchVerificationStatus =
  "pending";

const MATCH_CONFIRMATION_TRUST_LEVELS: MatchConfirmationTrustLevel[] = [
  "guest_confirmed",
  "account_confirmed",
];

export function getMatchVerificationStatus(
  status: string | null | undefined,
): MatchVerificationStatus {
  if (
    MATCH_VERIFICATION_STATUSES.includes(
      status as MatchVerificationStatus,
    )
  ) {
    return status as MatchVerificationStatus;
  }

  return DEFAULT_MATCH_VERIFICATION_STATUS;
}

export function getMatchConfirmationTrustLevel(
  trustLevel: string | null | undefined,
): MatchConfirmationTrustLevel | null {
  if (
    MATCH_CONFIRMATION_TRUST_LEVELS.includes(
      trustLevel as MatchConfirmationTrustLevel,
    )
  ) {
    return trustLevel as MatchConfirmationTrustLevel;
  }

  return null;
}
