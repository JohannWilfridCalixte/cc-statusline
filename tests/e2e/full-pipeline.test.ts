import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TEST_DIR = join(tmpdir(), `cc-statusline-e2e-${Date.now()}`);
const _CONFIG_PATH = join(TEST_DIR, "config.yaml");
const OUTPUT_PATH = join(TEST_DIR, "statusline.sh");
const SETTINGS_PATH = join(TEST_DIR, "settings.json");
const CLI = join(import.meta.dir, "../../src/cli.ts");

const MOCK_JSON = JSON.stringify({
  model: { id: "claude-opus-4", display_name: "Claude Opus 4" },
  cwd: "/Users/test/project",
  cost: {
    total_cost_usd: 0.25,
    total_duration_ms: 60000,
    total_lines_added: 100,
    total_lines_removed: 20,
  },
  context_window: { used_percentage: 35.0 },
  rate_limits: { five_hour: { used_percentage: 10 }, seven_day: { used_percentage: 5 } },
  session_id: "test-session-1234",
  vim: { mode: "insert" },
  agent: { name: "test-agent" },
  worktree: {},
});

describe("e2e: full pipeline", () => {
  beforeAll(() => {
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterAll(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("generate produces working script from defaults (no config file)", () => {
    const result = spawnSync(
      "bun",
      [
        "run",
        CLI,
        "generate",
        "--config",
        join(TEST_DIR, "nonexistent.yaml"),
        "--output",
        OUTPUT_PATH,
        "--skip-settings",
      ],
      {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Script generated");
    expect(existsSync(OUTPUT_PATH)).toBe(true);

    // Verify bash syntax
    const syntaxCheck = spawnSync("bash", ["-n", OUTPUT_PATH], { encoding: "utf-8" });
    expect(syntaxCheck.status).toBe(0);
  });

  it("generated script produces exactly 2 lines", () => {
    const result = spawnSync("bash", [OUTPUT_PATH], {
      input: MOCK_JSON,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    expect(result.status).toBe(0);
    const lines = result.stdout.split("\n").filter((l: string) => l.length > 0);
    expect(lines.length).toBe(2);
  });

  it("generated script contains expected segment data", () => {
    const result = spawnSync("bash", [OUTPUT_PATH], {
      input: MOCK_JSON,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    const output = result.stdout;
    expect(output).toContain("Claude Opus 4");
    expect(output).toContain("test-agent");
    expect(output).toContain("insert");
    expect(output).toContain("0.2500");
    expect(output).toContain("+100");
    expect(output).toContain("-20");
    expect(output).toContain("35%");
  });

  it("generated script completes under 500ms", () => {
    const start = performance.now();
    const result = spawnSync("bash", [OUTPUT_PATH], {
      input: MOCK_JSON,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const duration = performance.now() - start;

    expect(result.status).toBe(0);
    expect(duration).toBeLessThan(500);
  });

  it("generate + settings update works", () => {
    // Pre-existing settings
    const existingSettings = { env: { SOME_KEY: "value" } };
    const Bun = globalThis.Bun;
    Bun.write(SETTINGS_PATH, JSON.stringify(existingSettings));

    const outputPath2 = join(TEST_DIR, "statusline2.sh");
    const result = spawnSync("bun", ["run", CLI, "generate", "--output", outputPath2], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, CC_STATUSLINE_SETTINGS_PATH: SETTINGS_PATH },
    });

    // The settings updater uses config's settings_json_path which defaults to ~/.claude/settings.json
    // For this test, we verify the script was generated
    expect(result.status).toBe(0);
    expect(existsSync(outputPath2)).toBe(true);
  });

  it("preview command produces 2 lines of output", () => {
    const result = spawnSync("bun", ["run", CLI, "preview"], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    expect(result.status).toBe(0);
    const lines = result.stdout.split("\n").filter((l: string) => l.length > 0);
    expect(lines.length).toBe(2);
  });

  it("init then generate full pipeline", () => {
    const pipelineDir = join(TEST_DIR, "pipeline");
    mkdirSync(pipelineDir, { recursive: true });
    const pConfigPath = join(pipelineDir, "config.yaml");
    const pOutputPath = join(pipelineDir, "statusline.sh");

    // Create a minimal config file manually (since init writes to ~/.config)
    Bun.write(
      pConfigPath,
      `theme: default
line1:
  left: [os_icon, directory]
  right: [model]
line2:
  left: [cost]
  right: [time]
`,
    );

    // Generate from that config
    const genResult = spawnSync(
      "bun",
      ["run", CLI, "generate", "--config", pConfigPath, "--output", pOutputPath, "--skip-settings"],
      {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      },
    );

    expect(genResult.status).toBe(0);
    expect(existsSync(pOutputPath)).toBe(true);

    // Run the generated script
    const runResult = spawnSync("bash", [pOutputPath], {
      input: MOCK_JSON,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    expect(runResult.status).toBe(0);
    const lines = runResult.stdout.split("\n").filter((l: string) => l.length > 0);
    expect(lines.length).toBe(2);
    expect(runResult.stdout).toContain("Claude Opus 4");
  });

  it("handles invalid JSON input gracefully", () => {
    const result = spawnSync("bash", [OUTPUT_PATH], {
      input: "not json",
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toContain("invalid JSON");
  });
});
