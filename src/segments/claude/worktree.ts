import { colorWrap, shellVar } from "../../generator/shell-utils.ts";
import { registerSegment } from "../registry.ts";
import type { SegmentDefinition } from "../types.ts";

const definition: SegmentDefinition = {
  name: "worktree",
  defaultIcon: "\ue728",
  defaultFg: "180",
  defaultBg: "",
  type: "json",
  generateShellCode(ctx) {
    const varName = shellVar("worktree");
    const icon = ctx.segmentConfig.icon ?? this.defaultIcon;
    const fg = ctx.segmentConfig.fg ?? this.defaultFg;
    return [
      `${varName}_RAW=$(echo "$DATA" | jq -r 'if .worktree then (.worktree | tostring) else empty end')`,
      `if [ -n "$${varName}_RAW" ] && [ "$${varName}_RAW" != "null" ] && [ "$${varName}_RAW" != "{}" ]; then`,
      `  ${varName}="${colorWrap(`${icon} $${varName}_RAW`, fg)}"`,
      `else`,
      `  ${varName}=""`,
      `fi`,
    ].join("\n");
  },
};

registerSegment(definition);
