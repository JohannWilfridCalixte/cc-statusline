import { colorWrap, shellVar } from "../../generator/shell-utils.ts";
import { registerSegment } from "../registry.ts";
import type { SegmentDefinition } from "../types.ts";

const definition: SegmentDefinition = {
  name: "duration",
  defaultIcon: "\uf252",
  defaultFg: "146",
  defaultBg: "",
  type: "json",
  generateShellCode(ctx) {
    const varName = shellVar("duration");
    const icon = ctx.segmentConfig.icon ?? this.defaultIcon;
    const fg = ctx.segmentConfig.fg ?? this.defaultFg;
    return [
      `${varName}_MS=$(echo "$DATA" | jq -r '.cost.total_duration_ms // empty')`,
      `if [ -n "$${varName}_MS" ]; then`,
      `  ${varName}_S=$(( ${varName}_MS / 1000 ))`,
      `  ${varName}_H=$(( ${varName}_S / 3600 ))`,
      `  ${varName}_RM=$(( (${varName}_S % 3600) / 60 ))`,
      `  ${varName}_RS=$(( ${varName}_S % 60 ))`,
      `  if [ "$${varName}_H" -gt 0 ]; then`,
      `    ${varName}_FMT="\${${varName}_H}h\${${varName}_RM}m\${${varName}_RS}s"`,
      `  elif [ "$${varName}_RM" -gt 0 ]; then`,
      `    ${varName}_FMT="\${${varName}_RM}m\${${varName}_RS}s"`,
      `  else`,
      `    ${varName}_FMT="\${${varName}_S}s"`,
      `  fi`,
      `  ${varName}="${colorWrap(`${icon} $${varName}_FMT`, fg)}"`,
      `else`,
      `  ${varName}=""`,
      `fi`,
    ].join("\n");
  },
};

registerSegment(definition);
