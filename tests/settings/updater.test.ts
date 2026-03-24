import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { updateSettings } from "../../src/settings/updater.ts";

const TEST_DIR = join(tmpdir(), `cc-statusline-settings-test-${Date.now()}`);

describe("settings updater", () => {
  beforeAll(() => {
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterAll(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("creates settings file when it does not exist", () => {
    const settingsPath = join(TEST_DIR, "new-settings.json");

    updateSettings("/path/to/script.sh", settingsPath);

    expect(existsSync(settingsPath)).toBe(true);
    const content = JSON.parse(readFileSync(settingsPath, "utf-8"));
    expect(content.statusLine).toEqual({
      type: "command",
      command: "/path/to/script.sh",
    });
  });

  it("preserves existing keys when updating", () => {
    const settingsPath = join(TEST_DIR, "existing-settings.json");
    writeFileSync(
      settingsPath,
      JSON.stringify({
        env: { API_KEY: "secret" },
        someOtherSetting: true,
      }),
    );

    updateSettings("/path/to/script.sh", settingsPath);

    const content = JSON.parse(readFileSync(settingsPath, "utf-8"));
    expect(content.env).toEqual({ API_KEY: "secret" });
    expect(content.someOtherSetting).toBe(true);
    expect(content.statusLine).toEqual({
      type: "command",
      command: "/path/to/script.sh",
    });
  });

  it("overwrites existing statusLine config", () => {
    const settingsPath = join(TEST_DIR, "overwrite-settings.json");
    writeFileSync(
      settingsPath,
      JSON.stringify({
        statusLine: { type: "command", command: "/old/script.sh" },
      }),
    );

    updateSettings("/new/script.sh", settingsPath);

    const content = JSON.parse(readFileSync(settingsPath, "utf-8"));
    expect(content.statusLine.command).toBe("/new/script.sh");
  });

  it("writes JSON with 2-space indentation", () => {
    const settingsPath = join(TEST_DIR, "indent-settings.json");

    updateSettings("/path/to/script.sh", settingsPath);

    const raw = readFileSync(settingsPath, "utf-8");
    // 2-space indent means the second line should start with 2 spaces
    expect(raw).toContain('  "statusLine"');
  });

  it("appends trailing newline", () => {
    const settingsPath = join(TEST_DIR, "newline-settings.json");

    updateSettings("/path/to/script.sh", settingsPath);

    const raw = readFileSync(settingsPath, "utf-8");
    expect(raw.endsWith("\n")).toBe(true);
  });

  it("handles malformed JSON in existing file gracefully", () => {
    const settingsPath = join(TEST_DIR, "malformed-settings.json");
    writeFileSync(settingsPath, "not json at all {{{");

    // Should not throw -- creates new content
    updateSettings("/path/to/script.sh", settingsPath);

    const content = JSON.parse(readFileSync(settingsPath, "utf-8"));
    expect(content.statusLine).toEqual({
      type: "command",
      command: "/path/to/script.sh",
    });
  });

  it("creates parent directories if missing", () => {
    const settingsPath = join(TEST_DIR, "deep", "nested", "dir", "settings.json");

    updateSettings("/path/to/script.sh", settingsPath);

    expect(existsSync(settingsPath)).toBe(true);
  });

  it('sets statusLine.type to "command"', () => {
    const settingsPath = join(TEST_DIR, "type-check.json");

    updateSettings("/any/path.sh", settingsPath);

    const content = JSON.parse(readFileSync(settingsPath, "utf-8"));
    expect(content.statusLine.type).toBe("command");
  });
});
