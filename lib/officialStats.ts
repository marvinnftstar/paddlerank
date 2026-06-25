import {
  applyRankingEligibility,
  isRankingEligibleMatch,
  type RankingEligibilityMatch,
  type RankingEligibilityQuery,
} from "@/lib/rankingEligibility";

export function isOfficialStatsEligible(match: RankingEligibilityMatch) {
  return isRankingEligibleMatch(match);
}

export function applyOfficialStatsEligibility<T>(
  query: RankingEligibilityQuery<T>,
) {
  return applyRankingEligibility(query);
}
