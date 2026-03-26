import { colorWrap, shellVar } from "../../generator/shell-utils.ts";
import { registerSegment } from "../registry.ts";
import type { SegmentDefinition } from "../types.ts";

const definition: SegmentDefinition = {
  name: "git_branch",
  defaultIcon: "\ue725",
  defaultFg: "114",
  defaultBg: "",
  type: "shell",
  generateShellCode(ctx) {
    const varName = shellVar("git_branch");
    const icon = ctx.segmentConfig.icon ?? this.defaultIcon;
    const fg = ctx.segmentConfig.fg ?? this.defaultFg;
    return [
      `${varName}_RAW=$(git -C "$SEG_DIRECTORY_RAW" rev-parse --abbrev-ref HEAD 2>/dev/null)`,
      `if [ -n "$${varName}_RAW" ]; then`,
      `  ${varName}="${colorWrap(`${icon} $${varName}_RAW`, fg)}"`,
      `else`,
      `  ${varName}=""`,
      `fi`,
    ].join("\n");
  },
};

registerSegment(definition);
