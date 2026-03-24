import { describe, expect, it } from "bun:test";
import { SEGMENT_NAMES } from "../../src/config/schema.ts";
import {
  bg256,
  colorWrap,
  DEFAULT_THEME,
  fg256,
  RESET,
  shellVar,
} from "../../src/generator/shell-utils.ts";

describe("shell-utils", () => {
  describe("fg256", () => {
    it("produces ANSI 256-color foreground escape", () => {
      expect(fg256("75")).toBe("\\033[38;5;75m");
    });

    it("works with different color numbers", () => {
      expect(fg256("196")).toBe("\\033[38;5;196m");
      expect(fg256("0")).toBe("\\033[38;5;0m");
      expect(fg256("255")).toBe("\\033[38;5;255m");
    });
  });

  describe("bg256", () => {
    it("produces ANSI 256-color background escape", () => {
      expect(bg256("75")).toBe("\\033[48;5;75m");
    });
  });

  describe("RESET", () => {
    it("produces ANSI reset escape", () => {
      expect(RESET).toBe("\\033[0m");
    });
  });

  describe("colorWrap", () => {
    it("wraps text with foreground color and reset", () => {
      const result = colorWrap("hello", "75");
      expect(result).toContain("\\033[38;5;75m");
      expect(result).toContain("hello");
      expect(result).toContain("\\033[0m");
    });

    it("includes background color when provided", () => {
      const result = colorWrap("hello", "75", "238");
      expect(result).toContain("\\033[38;5;75m");
      expect(result).toContain("\\033[48;5;238m");
      expect(result).toContain("hello");
      expect(result).toContain("\\033[0m");
    });

    it("omits background when not provided", () => {
      const result = colorWrap("text", "75");
      expect(result).not.toContain("48;5;");
    });
  });

  describe("shellVar", () => {
    it("converts segment name to uppercase SEG_ variable", () => {
      expect(shellVar("model")).toBe("SEG_MODEL");
      expect(shellVar("cost")).toBe("SEG_COST");
      expect(shellVar("context_bar")).toBe("SEG_CONTEXT_BAR");
      expect(shellVar("rate_limits")).toBe("SEG_RATE_LIMITS");
      expect(shellVar("git_branch")).toBe("SEG_GIT_BRANCH");
      expect(shellVar("os_icon")).toBe("SEG_OS_ICON");
    });
  });

  describe("DEFAULT_THEME", () => {
    it("has separator_fg defined", () => {
      expect(DEFAULT_THEME.separator_fg).toBeDefined();
      expect(typeof DEFAULT_THEME.separator_fg).toBe("string");
    });

    it("has color defaults for all 16 segments", () => {
      for (const name of SEGMENT_NAMES) {
        const colors = DEFAULT_THEME.segment_defaults[name];
        expect(colors).toBeDefined();
        expect(typeof colors.fg).toBe("string");
        expect(typeof colors.bg).toBe("string");
      }
    });
  });
});
