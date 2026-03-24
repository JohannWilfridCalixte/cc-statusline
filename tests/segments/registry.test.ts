import { describe, expect, it } from "bun:test";

import { SEGMENT_NAMES } from "../../src/config/schema.ts";
import "../../src/segments/register-all.ts";
import { getAllSegments, getSegment, hasSegment } from "../../src/segments/registry.ts";

describe("segment registry", () => {
  it("has all 16 segments registered", () => {
    const all = getAllSegments();
    expect(all.length).toBe(16);
  });

  it("returns correct definition for each known segment name", () => {
    for (const name of SEGMENT_NAMES) {
      const segment = getSegment(name);
      expect(segment.name).toBe(name);
      expect(typeof segment.generateShellCode).toBe("function");
    }
  });

  it("hasSegment returns true for registered segments", () => {
    expect(hasSegment("model")).toBe(true);
    expect(hasSegment("cost")).toBe(true);
    expect(hasSegment("git_branch")).toBe(true);
    expect(hasSegment("os_icon")).toBe(true);
  });

  it("throws for unknown segment name", () => {
    // Force an invalid name through the type system for test purposes
    expect(() => getSegment("nonexistent" as never)).toThrow("Unknown segment");
  });

  it("each segment has a non-empty defaultIcon", () => {
    for (const name of SEGMENT_NAMES) {
      const segment = getSegment(name);
      expect(segment.defaultIcon.length).toBeGreaterThan(0);
    }
  });

  it("each segment has a valid type (json or shell)", () => {
    for (const name of SEGMENT_NAMES) {
      const segment = getSegment(name);
      expect(["json", "shell"]).toContain(segment.type);
    }
  });

  it("CC JSON segments are typed as json", () => {
    const jsonSegments = [
      "model",
      "cost",
      "context_bar",
      "rate_limits",
      "duration",
      "lines_changed",
      "session_id",
      "vim_mode",
      "worktree",
      "agent_name",
    ] as const;
    for (const name of jsonSegments) {
      expect(getSegment(name).type).toBe("json");
    }
  });

  it("P10k shell segments are typed as shell", () => {
    const shellSegments = ["os_icon", "user_host", "time", "git_branch", "git_status"] as const;
    for (const name of shellSegments) {
      expect(getSegment(name).type).toBe("shell");
    }
  });

  it("directory segment uses json type (extracts cwd from CC JSON)", () => {
    expect(getSegment("directory").type).toBe("json");
  });
});
