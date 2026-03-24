import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DEFAULT_CONFIG } from "../../src/config/defaults.ts";
import { loadConfig } from "../../src/config/loader.ts";

const TEST_DIR = join(tmpdir(), `cc-statusline-config-test-${Date.now()}`);

describe("config loader", () => {
  beforeAll(() => {
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterAll(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("returns default config when no path provided", () => {
    const result = loadConfig();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual(DEFAULT_CONFIG);
  });

  it("returns default config when file does not exist", () => {
    const result = loadConfig("/nonexistent/path/config.yaml");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual(DEFAULT_CONFIG);
  });

  it("merges partial YAML with defaults", () => {
    const configPath = join(TEST_DIR, "partial.yaml");
    writeFileSync(
      configPath,
      `theme: default
line1:
  left: [model, cost]
  right: [time]
`,
    );

    const result = loadConfig(configPath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.line1.left).toEqual(["model", "cost"]);
    expect(result.value.line1.right).toEqual(["time"]);
    // line2 should fall back to defaults
    expect(result.value.line2.left).toEqual(DEFAULT_CONFIG.line2.left);
    expect(result.value.line2.right).toEqual(DEFAULT_CONFIG.line2.right);
  });

  it("returns error for invalid segment name in line config", () => {
    const configPath = join(TEST_DIR, "invalid-segment.yaml");
    writeFileSync(
      configPath,
      `line1:
  left: [model, not_a_real_segment]
`,
    );

    const result = loadConfig(configPath);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INVALID_SEGMENT");
    expect(result.error.message).toContain("not_a_real_segment");
  });

  it("returns error for invalid segment name in overrides", () => {
    const configPath = join(TEST_DIR, "invalid-override.yaml");
    writeFileSync(
      configPath,
      `segments:
  bogus_segment:
    enabled: false
`,
    );

    const result = loadConfig(configPath);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INVALID_SEGMENT");
    expect(result.error.message).toContain("bogus_segment");
  });

  it("returns error for invalid YAML syntax", () => {
    const configPath = join(TEST_DIR, "invalid.yaml");
    writeFileSync(configPath, `{{{{ invalid yaml ::::`);

    const result = loadConfig(configPath);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INVALID_YAML");
  });

  it("returns defaults when YAML file is empty", () => {
    const configPath = join(TEST_DIR, "empty.yaml");
    writeFileSync(configPath, "");

    const result = loadConfig(configPath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual(DEFAULT_CONFIG);
  });

  it("preserves custom settings_json_path", () => {
    const configPath = join(TEST_DIR, "custom-paths.yaml");
    writeFileSync(
      configPath,
      `settings_json_path: /custom/settings.json
output_path: /custom/statusline.sh
`,
    );

    const result = loadConfig(configPath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.settings_json_path).toBe("/custom/settings.json");
    expect(result.value.output_path).toBe("/custom/statusline.sh");
  });

  it("merges segment overrides with defaults", () => {
    const configPath = join(TEST_DIR, "segment-override.yaml");
    writeFileSync(
      configPath,
      `segments:
  model:
    enabled: false
    fg: "200"
`,
    );

    const result = loadConfig(configPath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.segments.model).toEqual({ enabled: false, fg: "200" });
  });

  it("validates segment names in line2 right section", () => {
    const configPath = join(TEST_DIR, "invalid-line2.yaml");
    writeFileSync(
      configPath,
      `line2:
  right: [fake_segment]
`,
    );

    const result = loadConfig(configPath);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("INVALID_SEGMENT");
    expect(result.error.message).toContain("fake_segment");
  });

  it("accepts all valid segment names", () => {
    const configPath = join(TEST_DIR, "all-segments.yaml");
    writeFileSync(
      configPath,
      `line1:
  left: [model, cost, context_bar, rate_limits, duration, lines_changed, session_id, vim_mode]
  right: [worktree, agent_name, git_branch, git_status, os_icon, user_host, time, directory]
`,
    );

    const result = loadConfig(configPath);

    expect(result.ok).toBe(true);
  });
});
