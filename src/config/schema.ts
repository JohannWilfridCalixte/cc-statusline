export type SegmentName =
  | "model"
  | "cost"
  | "context_bar"
  | "rate_limits"
  | "duration"
  | "lines_changed"
  | "session_id"
  | "vim_mode"
  | "worktree"
  | "agent_name"
  | "git_branch"
  | "git_status"
  | "os_icon"
  | "user_host"
  | "time"
  | "directory";

export const SEGMENT_NAMES: readonly SegmentName[] = [
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
  "git_branch",
  "git_status",
  "os_icon",
  "user_host",
  "time",
  "directory",
] as const;

interface SegmentConfig {
  readonly enabled: boolean;
  readonly fg?: string;
  readonly bg?: string;
  readonly icon?: string;
  readonly format?: string;
}

interface LineConfig {
  readonly left: readonly SegmentName[];
  readonly right: readonly SegmentName[];
}

interface Config {
  readonly theme: "default";
  readonly line1: LineConfig;
  readonly line2: LineConfig;
  readonly segments: Partial<Record<SegmentName, SegmentConfig>>;
  readonly settings_json_path: string;
  readonly output_path: string;
}

export type { Config, SegmentConfig };
