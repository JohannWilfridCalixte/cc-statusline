import type { SegmentName } from "../config/schema.ts";
import type { ThemeColors } from "../segments/types.ts";

export function fg256(color: string) {
  return `\\033[38;5;${color}m`;
}

export function bg256(color: string) {
  return `\\033[48;5;${color}m`;
}

export const RESET = "\\033[0m";

export function colorWrap(text: string, fgColor: string, bgColor?: string) {
  const bgPart = bgColor ? bg256(bgColor) : "";
  return `${fg256(fgColor)}${bgPart}${text}${RESET}`;
}

export function shellVar(segmentName: SegmentName) {
  return `SEG_${segmentName.toUpperCase()}`;
}

export const DEFAULT_THEME: ThemeColors = {
  separator_fg: "240",
  segment_defaults: {
    model: { fg: "75", bg: "" },
    cost: { fg: "178", bg: "" },
    context_bar: { fg: "114", bg: "" },
    rate_limits: { fg: "209", bg: "" },
    duration: { fg: "146", bg: "" },
    lines_changed: { fg: "150", bg: "" },
    session_id: { fg: "245", bg: "" },
    vim_mode: { fg: "208", bg: "" },
    worktree: { fg: "180", bg: "" },
    agent_name: { fg: "141", bg: "" },
    git_branch: { fg: "114", bg: "" },
    git_status: { fg: "178", bg: "" },
    os_icon: { fg: "255", bg: "" },
    user_host: { fg: "195", bg: "" },
    time: { fg: "66", bg: "" },
    directory: { fg: "39", bg: "" },
  },
};
