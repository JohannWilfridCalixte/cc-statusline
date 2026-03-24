import { describe, expect, it } from "bun:test";

import { checkJq } from "../../src/utils/jq-check.ts";

describe("jq-check", () => {
  it("detects jq when installed", () => {
    const result = checkJq();
    // jq is available in the test environment (macOS with homebrew)
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.version).toContain("jq-");
  });

  it("returns version string on success", () => {
    const result = checkJq();
    if (!result.ok) return;
    expect(typeof result.version).toBe("string");
    expect(result.version.length).toBeGreaterThan(0);
  });
});
