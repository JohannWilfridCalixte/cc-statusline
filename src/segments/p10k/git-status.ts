import { fg256, RESET, shellVar } from "../../generator/shell-utils.ts";
import { registerSegment } from "../registry.ts";
import type { SegmentDefinition } from "../types.ts";

const definition: SegmentDefinition = {
  name: "git_status",
  defaultIcon: "\uf126",
  defaultFg: "178",
  defaultBg: "",
  type: "shell",
  generateShellCode(ctx) {
    const varName = shellVar("git_status");
    const icon = ctx.segmentConfig.icon ?? this.defaultIcon;
    const fg = ctx.segmentConfig.fg ?? this.defaultFg;
    return [
      `if git -C "$SEG_DIRECTORY_RAW" rev-parse --git-dir >/dev/null 2>&1; then`,
      `  ${varName}_STAGED=$(git -C "$SEG_DIRECTORY_RAW" diff --cached --numstat 2>/dev/null | wc -l | tr -d ' ')`,
      `  ${varName}_MODIFIED=$(git -C "$SEG_DIRECTORY_RAW" diff --numstat 2>/dev/null | wc -l | tr -d ' ')`,
      `  ${varName}_UNTRACKED=$(git -C "$SEG_DIRECTORY_RAW" ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')`,
      `  ${varName}_PARTS=""`,
      `  if [ "$${varName}_STAGED" -gt 0 ] 2>/dev/null; then`,
      `    ${varName}_PARTS="${fg256("114")}+\${${varName}_STAGED}"`,
      `  fi`,
      `  if [ "$${varName}_MODIFIED" -gt 0 ] 2>/dev/null; then`,
      `    ${varName}_PARTS="\${${varName}_PARTS} ${fg256("178")}~\${${varName}_MODIFIED}"`,
      `  fi`,
      `  if [ "$${varName}_UNTRACKED" -gt 0 ] 2>/dev/null; then`,
      `    ${varName}_PARTS="\${${varName}_PARTS} ${fg256("196")}?\${${varName}_UNTRACKED}"`,
      `  fi`,
      `  if [ -n "$${varName}_PARTS" ]; then`,
      `    ${varName}="${fg256(fg)}${icon}\${${varName}_PARTS}${RESET}"`,
      `  else`,
      `    ${varName}="${fg256(fg)}${icon} ${fg256("114")}ok${RESET}"`,
      `  fi`,
      `else`,
      `  ${varName}=""`,
      `fi`,
    ].join("\n");
  },
};

registerSegment(definition);
