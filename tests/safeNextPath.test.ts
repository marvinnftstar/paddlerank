import assert from "node:assert/strict";
import test from "node:test";
import { getSafeNextPath } from "../lib/safeNextPath";

test("keeps safe local return paths", () => {
  assert.equal(
    getSafeNextPath("/confirm-match/123?token=abc#review"),
    "/confirm-match/123?token=abc#review",
  );
});

test("falls back when a return path could redirect away from PaddleRank", () => {
  const unsafePaths = [
    "https://example.com",
    "//example.com",
    "/\\example.com",
    "javascript:alert(1)",
  ];

  for (const path of unsafePaths) {
    assert.equal(getSafeNextPath(path), "/dashboard");
  }
});
