import { fg256, RESET, shellVar } from "../../generator/shell-utils.ts";
import { registerSegment } from "../registry.ts";
import type { SegmentDefinition } from "../types.ts";

const definition: SegmentDefinition = {
  name: "lines_changed",
  defaultIcon: "\uf044",
  defaultFg: "150",
  defaultBg: "",
  type: "json",
  generateShellCode(ctx) {
    const varName = shellVar("lines_changed");
    const icon = ctx.segmentConfig.icon ?? this.defaultIcon;
    const fg = ctx.segmentConfig.fg ?? this.defaultFg;
    return [
      `${varName}_ADD=$(echo "$DATA" | jq -r '.cost.total_lines_added // 0')`,
      `${varName}_REM=$(echo "$DATA" | jq -r '.cost.total_lines_removed // 0')`,
      `if [ "$${varName}_ADD" != "0" ] || [ "$${varName}_REM" != "0" ]; then`,
      `  ${varName}="${fg256(fg)}${icon} ${fg256("114")}+\${${varName}_ADD} ${fg256("196")}-\${${varName}_REM}${RESET}"`,
      `else`,
      `  ${varName}=""`,
      `fi`,
    ].join("\n");
  },
};

registerSegment(definition);
