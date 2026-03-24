export const MOCK_CC_JSON = {
  model: {
    id: "claude-opus-4-20250514",
    display_name: "Claude Opus 4",
  },
  cwd: "/Users/dev/projects/my-app",
  workspace: {
    current_dir: "/Users/dev/projects/my-app",
    project_dir: "/Users/dev/projects/my-app",
  },
  cost: {
    total_cost_usd: 0.4521,
    total_duration_ms: 127300,
    total_api_duration_ms: 98200,
    total_lines_added: 342,
    total_lines_removed: 87,
  },
  context_window: {
    total_input_tokens: 45200,
    total_output_tokens: 12800,
    context_window_size: 200000,
    used_percentage: 29.0,
    remaining_percentage: 71.0,
    current_usage: 8400,
  },
  exceeds_200k_tokens: false,
  rate_limits: {
    five_hour: { used_percentage: 23.5 },
    seven_day: { used_percentage: 11.2 },
  },
  session_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  transcript_path: "/Users/dev/.claude/transcripts/session.json",
  version: "1.0.0",
  output_style: { name: "default" },
  vim: { mode: "normal" },
  agent: { name: "software-engineer" },
  worktree: {},
};
