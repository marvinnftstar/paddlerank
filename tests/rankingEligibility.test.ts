import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isRankingEligibleMatch } from "../lib/rankingEligibility";

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
