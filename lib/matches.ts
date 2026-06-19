export type MatchVerificationStatus =
  | "pending"
  | "confirmed"
  | "disputed"
  | "admin_verified"
  | "rejected";

const MATCH_VERIFICATION_STATUSES: MatchVerificationStatus[] = [
  "pending",
  "confirmed",
  "disputed",
  "admin_verified",
  "rejected",
];

export const DEFAULT_MATCH_VERIFICATION_STATUS: MatchVerificationStatus =
  "pending";

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
