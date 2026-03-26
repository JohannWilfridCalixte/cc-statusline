import { describe, expect, it } from "bun:test";

import {
  generateHeader,
  generateJsonParsing,
  generateLineAssembly,
  generateSeparator,
  generateTermWidth,
} from "../../src/generator/template.ts";

describe("template", () => {
  describe("generateHeader", () => {
    it("starts with bash shebang", () => {
      expect(generateHeader()).toContain("#!/usr/bin/env bash");
    });

    it("includes generated-file warning comment", () => {
      expect(generateHeader()).toContain("cc-statusline generated");
    });

    it("does not include set -euo pipefail", () => {
      expect(generateHeader()).not.toContain("set -euo pipefail");
    });
  });

  describe("generateJsonParsing", () => {
    it("reads stdin into DATA variable", () => {
      const code = generateJsonParsing();
      expect(code).toContain("DATA=$(cat)");
    });

    it("validates JSON with jq empty", () => {
      const code = generateJsonParsing();
      expect(code).toContain("jq empty");
    });

    it("outputs error on invalid JSON", () => {
      const code = generateJsonParsing();
      expect(code).toContain("invalid JSON");
    });

    it("outputs 2 empty lines and exits 0 on invalid JSON", () => {
      const code = generateJsonParsing();
      expect(code).toContain('echo ""');
      expect(code).toContain("exit 0");
    });
  });

  describe("generateTermWidth", () => {
    it("uses tput cols for terminal width", () => {
      const code = generateTermWidth();
      expect(code).toContain("tput cols");
    });

    it("falls back to 80 columns", () => {
      const code = generateTermWidth();
      expect(code).toContain("echo 80");
    });

    it("assigns to COLS variable", () => {
      const code = generateTermWidth();
      expect(code).toContain("COLS=");
    });
  });

  describe("generateSeparator", () => {
    it("creates SEP variable with colored pipe separator", () => {
      const code = generateSeparator("240");
      expect(code).toContain("SEP=");
      expect(code).toContain("|");
      expect(code).toContain("38;5;240m");
    });

    it("includes reset after separator", () => {
      const code = generateSeparator("240");
      expect(code).toContain("\\033[0m");
    });
  });

  describe("generateLineAssembly", () => {
    it("generates assembly for left and right vars", () => {
      const code = generateLineAssembly(1, ["SEG_MODEL", "SEG_COST"], ["SEG_TIME"]);
      expect(code).toContain("LINE1_LEFT");
      expect(code).toContain("LINE1_RIGHT");
      expect(code).toContain("SEG_MODEL");
      expect(code).toContain("SEG_COST");
      expect(code).toContain("SEG_TIME");
    });

    it("uses separator between left segments", () => {
      const code = generateLineAssembly(1, ["SEG_A", "SEG_B"], []);
      expect(code).toContain("$SEP");
    });

    it("generates echo -e for output", () => {
      const code = generateLineAssembly(1, ["SEG_A"], ["SEG_B"]);
      expect(code).toContain("echo -e");
    });

    it("includes ANSI stripping for plain-text length", () => {
      const code = generateLineAssembly(1, ["SEG_A"], []);
      expect(code).toContain("sed");
      expect(code).toContain("_PLAIN");
      expect(code).toContain("_LEN");
    });

    it("calculates padding between left and right", () => {
      const code = generateLineAssembly(1, ["SEG_A"], ["SEG_B"]);
      expect(code).toContain("PAD");
      expect(code).toContain("COLS");
      expect(code).toContain("SPACES");
    });

    it("handles line 2 correctly", () => {
      const code = generateLineAssembly(2, ["SEG_X"], ["SEG_Y"]);
      expect(code).toContain("LINE2_LEFT");
      expect(code).toContain("LINE2_RIGHT");
    });

    it("handles empty left segments", () => {
      const code = generateLineAssembly(1, [], ["SEG_A"]);
      expect(code).toContain('LINE1_LEFT=""');
      expect(code).toContain("LINE1_RIGHT");
    });

    it("handles empty right segments", () => {
      const code = generateLineAssembly(1, ["SEG_A"], []);
      expect(code).toContain('LINE1_RIGHT=""');
    });
  });
});
