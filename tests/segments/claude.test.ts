import { describe, expect, it } from "bun:test";
import { DEFAULT_THEME } from "../../src/generator/shell-utils.ts";
import type { SegmentContext } from "../../src/segments/types.ts";
import "../../src/segments/register-all.ts";
import { getSegment } from "../../src/segments/registry.ts";

function makeContext(overrides?: Partial<SegmentContext["segmentConfig"]>): SegmentContext {
  return {
    segmentConfig: { enabled: true, ...overrides },
    theme: DEFAULT_THEME,
  };
}

describe("CC JSON segments", () => {
  describe("model segment", () => {
    const segment = getSegment("model");

    it("generates bash code extracting model.display_name via jq", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain(".model.display_name");
      expect(code).toContain("jq");
      expect(code).toContain("SEG_MODEL");
    });

    it("assigns empty string when field missing", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain('SEG_MODEL=""');
    });

    it("uses custom icon when provided", () => {
      const code = segment.generateShellCode(makeContext({ icon: "X" }));
      expect(code).toContain("X");
    });

    it("uses custom fg color when provided", () => {
      const code = segment.generateShellCode(makeContext({ fg: "200" }));
      expect(code).toContain("38;5;200m");
    });
  });

  describe("cost segment", () => {
    const segment = getSegment("cost");

    it("extracts cost.total_cost_usd via jq", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain(".cost.total_cost_usd");
      expect(code).toContain("SEG_COST");
    });

    it("formats cost with printf %.4f", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain('printf "%.4f"');
    });
  });

  describe("context_bar segment", () => {
    const segment = getSegment("context_bar");

    it("extracts context_window.used_percentage via jq", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain(".context_window.used_percentage");
      expect(code).toContain("SEG_CONTEXT_BAR");
    });

    it("generates bar with filled and empty portions", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("FILLED");
      expect(code).toContain("EMPTY");
      expect(code).toContain("#");
      expect(code).toContain("-");
    });

    it("has color thresholds for high usage (red at 80%, yellow at 50%)", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("-ge 80");
      expect(code).toContain("-ge 50");
      // Red for >= 80%
      expect(code).toContain("38;5;196m");
      // Yellow for >= 50%
      expect(code).toContain("38;5;178m");
    });
  });

  describe("rate_limits segment", () => {
    const segment = getSegment("rate_limits");

    it("extracts both 5h and 7d rate limits via jq", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain(".rate_limits.five_hour.used_percentage");
      expect(code).toContain(".rate_limits.seven_day.used_percentage");
      expect(code).toContain("SEG_RATE_LIMITS");
    });

    it("has severity color thresholds (red 80, yellow 50)", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("-ge 80");
      expect(code).toContain("-ge 50");
    });

    it("displays both 5h and 7d percentages", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("5h:");
      expect(code).toContain("7d:");
    });
  });

  describe("duration segment", () => {
    const segment = getSegment("duration");

    it("extracts cost.total_duration_ms via jq", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain(".cost.total_duration_ms");
      expect(code).toContain("SEG_DURATION");
    });

    it("converts ms to human-readable minutes and seconds", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("/ 1000");
      expect(code).toContain("/ 60");
      expect(code).toContain("% 60");
    });

    it("shows minutes format when > 0 minutes", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("-gt 0");
      expect(code).toContain("m");
      expect(code).toContain("s");
    });
  });

  describe("lines_changed segment", () => {
    const segment = getSegment("lines_changed");

    it("extracts lines added and removed via jq", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain(".cost.total_lines_added");
      expect(code).toContain(".cost.total_lines_removed");
      expect(code).toContain("SEG_LINES_CHANGED");
    });

    it("uses green for additions and red for removals", () => {
      const code = segment.generateShellCode(makeContext());
      // Green (114) for additions
      expect(code).toContain("38;5;114m");
      // Red (196) for removals
      expect(code).toContain("38;5;196m");
      expect(code).toContain("+");
      expect(code).toContain("-");
    });

    it("shows empty when both are 0", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain('"0"');
    });
  });

  describe("session_id segment", () => {
    const segment = getSegment("session_id");

    it("extracts session_id via jq", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain(".session_id");
      expect(code).toContain("SEG_SESSION_ID");
    });

    it("truncates to 8 characters", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("cut -c1-8");
    });
  });

  describe("vim_mode segment", () => {
    const segment = getSegment("vim_mode");

    it("extracts vim.mode via jq", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain(".vim.mode");
      expect(code).toContain("SEG_VIM_MODE");
    });
  });

  describe("worktree segment", () => {
    const segment = getSegment("worktree");

    it("extracts worktree as JSON string via jq", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain(".worktree");
      expect(code).toContain("SEG_WORKTREE");
    });

    it("handles empty worktree object gracefully", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("{}");
      expect(code).toContain("null");
    });
  });

  describe("agent_name segment", () => {
    const segment = getSegment("agent_name");

    it("extracts agent.name via jq", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain(".agent.name");
      expect(code).toContain("SEG_AGENT_NAME");
    });
  });

  describe("all CC JSON segments generate valid shell code structure", () => {
    const ccSegments = [
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

    for (const name of ccSegments) {
      it(`${name} generates non-empty shell code`, () => {
        const segment = getSegment(name);
        const code = segment.generateShellCode(makeContext());
        expect(code.length).toBeGreaterThan(0);
        // All JSON segments use jq to parse $DATA
        expect(code).toContain("$DATA");
        expect(code).toContain("jq");
      });
    }
  });
});
