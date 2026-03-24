import { fg256, RESET, shellVar } from "../../generator/shell-utils.ts";
import { registerSegment } from "../registry.ts";
import type { SegmentDefinition } from "../types.ts";

const definition: SegmentDefinition = {
  name: "rate_limits",
  defaultIcon: "\uf0e4",
  defaultFg: "209",
  defaultBg: "",
  type: "json",
  generateShellCode(ctx) {
    const varName = shellVar("rate_limits");
    const icon = ctx.segmentConfig.icon ?? this.defaultIcon;
    const fg = ctx.segmentConfig.fg ?? this.defaultFg;
    return [
      `${varName}_5H=$(echo "$DATA" | jq -r '.rate_limits.five_hour.used_percentage // empty')`,
      `${varName}_7D=$(echo "$DATA" | jq -r '.rate_limits.seven_day.used_percentage // empty')`,
      `if [ -n "$${varName}_5H" ] || [ -n "$${varName}_7D" ]; then`,
      `  ${varName}_5H_INT=\${${varName}_5H%.*}`,
      `  ${varName}_5H_INT=\${${varName}_5H_INT:-0}`,
      `  ${varName}_7D_INT=\${${varName}_7D%.*}`,
      `  ${varName}_7D_INT=\${${varName}_7D_INT:-0}`,
      `  # color by severity`,
      `  if [ "$${varName}_5H_INT" -ge 80 ] || [ "$${varName}_7D_INT" -ge 80 ]; then`,
      `    ${varName}_CLR="${fg256("196")}"`,
      `  elif [ "$${varName}_5H_INT" -ge 50 ] || [ "$${varName}_7D_INT" -ge 50 ]; then`,
      `    ${varName}_CLR="${fg256("178")}"`,
      `  else`,
      `    ${varName}_CLR="${fg256(fg)}"`,
      `  fi`,
      `  ${varName}="\${${varName}_CLR}${icon} 5h:\${${varName}_5H_INT}% 7d:\${${varName}_7D_INT}%${RESET}"`,
      `else`,
      `  ${varName}=""`,
      `fi`,
    ].join("\n");
  },
};

registerSegment(definition);
