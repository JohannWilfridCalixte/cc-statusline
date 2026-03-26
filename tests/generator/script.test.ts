import { describe, expect, it } from "bun:test";

import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { DEFAULT_CONFIG } from "../../src/config/defaults.ts";
import { generateScript } from "../../src/generator/script.ts";

const TEST_DIR = join(tmpdir(), `cc-statusline-script-test-${Date.now()}`);

describe("script generator", () => {
  it("generates non-empty script from default config", () => {
    const script = generateScript(DEFAULT_CONFIG);
    expect(script.length).toBeGreaterThan(100);
  });

  it("generates script starting with bash shebang", () => {
    const script = generateScript(DEFAULT_CONFIG);
    expect(script.startsWith("#!/usr/bin/env bash")).toBe(true);
  });

  it("does not include set -euo pipefail", () => {
    const script = generateScript(DEFAULT_CONFIG);
    expect(script).not.toContain("set -euo pipefail");
  });

  it("includes generated-file comment", () => {
    const script = generateScript(DEFAULT_CONFIG);
    expect(script).toContain("cc-statusline generated");
  });

  it("includes stdin reading (DATA=$(cat))", () => {
    const script = generateScript(DEFAULT_CONFIG);
    expect(script).toContain("DATA=$(cat)");
  });

  it("includes JSON validation with jq", () => {
    const script = generateScript(DEFAULT_CONFIG);
    expect(script).toContain("jq empty");
    expect(script).toContain("invalid JSON");
  });

  it("includes terminal width detection", () => {
    const script = generateScript(DEFAULT_CONFIG);
    expect(script).toContain("tput cols");
    expect(script).toContain("COLS=");
  });

  it("includes separator definition", () => {
    const script = generateScript(DEFAULT_CONFIG);
    expect(script).toContain("SEP=");
  });

  it("includes segment computation sections", () => {
    const script = generateScript(DEFAULT_CONFIG);
    expect(script).toContain("# Segment: model");
    expect(script).toContain("# Segment: cost");
    expect(script).toContain("# Segment: os_icon");
    expect(script).toContain("# Segment: git_branch");
  });

  it("includes line assembly for both lines", () => {
    const script = generateScript(DEFAULT_CONFIG);
    expect(script).toContain("# Assemble line 1");
    expect(script).toContain("# Assemble line 2");
    expect(script).toContain("LINE1_LEFT");
    expect(script).toContain("LINE2_LEFT");
  });

  it("outputs exactly two echo statements for 2-line layout", () => {
    const script = generateScript(DEFAULT_CONFIG);
    const echoLines = script.split("\n").filter((l) => l.startsWith("echo -e"));
    expect(echoLines.length).toBe(2);
  });

  it("generates syntactically valid bash", () => {
    mkdirSync(TEST_DIR, { recursive: true });
    const script = generateScript(DEFAULT_CONFIG);
    const scriptPath = join(TEST_DIR, "syntax-check.sh");
    writeFileSync(scriptPath, script);

    const result = spawnSync("bash", ["-n", scriptPath], { encoding: "utf-8" });
    expect(result.status).toBe(0);

    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("skips disabled segments", () => {
    const config = {
      ...DEFAULT_CONFIG,
      line1: {
        left: ["model" as const, "cost" as const],
        right: [],
      },
      line2: { left: [], right: [] },
      segments: {
        cost: { enabled: false as const },
      },
    };

    const script = generateScript(config);
    // model should be present
    expect(script).toContain("# Segment: model");
    // cost should be skipped
    expect(script).not.toContain("# Segment: cost");
  });

  it("handles minimal config with few segments", () => {
    const config = {
      ...DEFAULT_CONFIG,
      line1: { left: ["time" as const], right: [] },
      line2: { left: [], right: [] },
    };

    const script = generateScript(config);
    expect(script).toContain("# Segment: time");
    expect(script.length).toBeGreaterThan(0);
  });

  it("includes ANSI stripping for length calculation", () => {
    const script = generateScript(DEFAULT_CONFIG);
    // sed command to strip ANSI escape sequences for plain-text length
    expect(script).toContain("sed");
    expect(script).toContain("x1b");
  });
});
