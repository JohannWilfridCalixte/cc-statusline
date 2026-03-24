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

describe("P10k system segments", () => {
  describe("os_icon segment", () => {
    const segment = getSegment("os_icon");

    it("uses uname -s for OS detection", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("uname -s");
      expect(code).toContain("SEG_OS_ICON");
    });

    it("handles Darwin, Linux, and fallback cases", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("Darwin");
      expect(code).toContain("Linux");
      expect(code).toContain("*)");
    });

    it("uses case/esac statement", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("case");
      expect(code).toContain("esac");
    });
  });

  describe("user_host segment", () => {
    const segment = getSegment("user_host");

    it("uses whoami and hostname commands", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("whoami");
      expect(code).toContain("hostname");
      expect(code).toContain("SEG_USER_HOST");
    });

    it("formats as user@host", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("@");
    });

    it("has fallback for hostname -s failure", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("hostname -s 2>/dev/null || hostname");
    });
  });

  describe("time segment", () => {
    const segment = getSegment("time");

    it("uses date command for HH:MM:SS format", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("date");
      expect(code).toContain("%H:%M:%S");
      expect(code).toContain("SEG_TIME");
    });
  });

  describe("directory segment", () => {
    const segment = getSegment("directory");

    it("extracts cwd from CC JSON data", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain(".cwd");
      expect(code).toContain("jq");
      expect(code).toContain("SEG_DIRECTORY");
    });

    it("falls back to pwd when cwd is empty", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("pwd");
    });

    it("replaces $HOME with ~ for shorter display", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("$HOME");
      expect(code).toContain("~");
    });
  });
});

describe("P10k git segments", () => {
  describe("git_branch segment", () => {
    const segment = getSegment("git_branch");

    it("uses git rev-parse --abbrev-ref HEAD", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("git rev-parse --abbrev-ref HEAD");
      expect(code).toContain("SEG_GIT_BRANCH");
    });

    it("suppresses stderr for non-git repos", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("2>/dev/null");
    });

    it("produces empty output when not in git repo", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain('SEG_GIT_BRANCH=""');
    });
  });

  describe("git_status segment", () => {
    const segment = getSegment("git_status");

    it("checks if in git repo before running commands", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("git rev-parse --git-dir");
      expect(code).toContain("SEG_GIT_STATUS");
    });

    it("counts staged, modified, and untracked files", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("git diff --cached --numstat");
      expect(code).toContain("git diff --numstat");
      expect(code).toContain("git ls-files --others --exclude-standard");
    });

    it("uses color coding for staged (green), modified (yellow), untracked (red)", () => {
      const code = segment.generateShellCode(makeContext());
      // Green for staged
      expect(code).toContain("38;5;114m");
      // Yellow for modified
      expect(code).toContain("38;5;178m");
      // Red for untracked
      expect(code).toContain("38;5;196m");
    });

    it('shows "ok" when no changes', () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain("ok");
    });

    it("produces empty output when not in git repo", () => {
      const code = segment.generateShellCode(makeContext());
      expect(code).toContain('SEG_GIT_STATUS=""');
    });
  });

  describe("all P10k segments support custom icon and fg overrides", () => {
    const p10kSegments = [
      "os_icon",
      "user_host",
      "time",
      "directory",
      "git_branch",
      "git_status",
    ] as const;

    for (const name of p10kSegments) {
      it(`${name} uses custom icon when provided`, () => {
        const segment = getSegment(name);
        const code = segment.generateShellCode(makeContext({ icon: "CUSTOM_ICO" }));
        expect(code).toContain("CUSTOM_ICO");
      });

      it(`${name} uses custom fg when provided`, () => {
        const segment = getSegment(name);
        const code = segment.generateShellCode(makeContext({ fg: "222" }));
        expect(code).toContain("222");
      });
    }
  });
});
