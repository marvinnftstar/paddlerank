import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyRankingEligibility,
  isRankingEligibleMatch,
} from "../lib/rankingEligibility";

describe("isRankingEligibleMatch", () => {
  it("includes account-confirmed admin-verified matches", () => {
    assert.equal(
      isRankingEligibleMatch({
        confirmation_trust_level: "account_confirmed",
        verification_status: "admin_verified",
      }),
      true,
    );
  });

  const ineligibleCases = [
    {
      name: "guest-confirmed admin-verified matches",
      confirmation_trust_level: "guest_confirmed",
      verification_status: "admin_verified",
    },
    {
      name: "account-confirmed pending matches",
      confirmation_trust_level: "account_confirmed",
      verification_status: "pending",
    },
    {
      name: "account-confirmed disputed matches",
      confirmation_trust_level: "account_confirmed",
      verification_status: "disputed",
    },
    {
      name: "account-confirmed rejected matches",
      confirmation_trust_level: "account_confirmed",
      verification_status: "rejected",
    },
    {
      name: "guest-confirmed pending matches",
      confirmation_trust_level: "guest_confirmed",
      verification_status: "pending",
    },
    {
      name: "guest-confirmed disputed matches",
      confirmation_trust_level: "guest_confirmed",
      verification_status: "disputed",
    },
    {
      name: "guest-confirmed rejected matches",
      confirmation_trust_level: "guest_confirmed",
      verification_status: "rejected",
    },
  ] as const;

  for (const testCase of ineligibleCases) {
    it(`excludes ${testCase.name}`, () => {
      assert.equal(isRankingEligibleMatch(testCase), false);
    });
  }
});

describe("applyRankingEligibility", () => {
  it("applies the exact account-confirmed and admin-verified match filter", () => {
    type MatchFilter = Parameters<
      Parameters<typeof applyRankingEligibility>[0]["match"]
    >[0];

    const filters: MatchFilter[] = [];
    const query = {
      match(filter: MatchFilter) {
        filters.push(filter);
        return "filtered-query";
      },
    };

    const result = applyRankingEligibility(query);

    assert.equal(result, "filtered-query");
    assert.equal(filters.length, 1);
    assert.deepEqual(filters[0], {
      confirmation_trust_level: "account_confirmed",
      verification_status: "admin_verified",
    });
  });
});
