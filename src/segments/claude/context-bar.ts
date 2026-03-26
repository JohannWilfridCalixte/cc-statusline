import { fg256, RESET, shellVar } from "../../generator/shell-utils.ts";
import { registerSegment } from "../registry.ts";
import type { SegmentDefinition } from "../types.ts";

const definition: SegmentDefinition = {
  name: "context_bar",
  defaultIcon: "\uf2db",
  defaultFg: "114",
  defaultBg: "",
  type: "json",
  generateShellCode(ctx) {
    const varName = shellVar("context_bar");
    const icon = ctx.segmentConfig.icon ?? this.defaultIcon;
    const fg = ctx.segmentConfig.fg ?? this.defaultFg;
    return [
      `${varName}_PCT=$(echo "$DATA" | jq -r '.context_window.used_percentage // empty')`,
      `if [ -n "$${varName}_PCT" ]; then`,
      `  ${varName}_INT=\${${varName}_PCT%.*}`,
      `  ${varName}_INT=\${${varName}_INT:-0}`,
      `  ${varName}_FILLED=$(( ${varName}_INT / 10 ))`,
      `  ${varName}_EMPTY=$(( 10 - ${varName}_FILLED ))`,
      `  ${varName}_BAR=""`,
      `  ${varName}_I=0; while [ "$${varName}_I" -lt "$${varName}_FILLED" ]; do ${varName}_BAR="$${varName}_BAR#"; ${varName}_I=$(( ${varName}_I + 1 )); done`,
      `  ${varName}_I=0; while [ "$${varName}_I" -lt "$${varName}_EMPTY" ]; do ${varName}_BAR="$${varName}_BAR-"; ${varName}_I=$(( ${varName}_I + 1 )); done`,
      `  if [ "$${varName}_INT" -ge 80 ]; then`,
      `    ${varName}_CLR="${fg256("196")}"`,
      `  elif [ "$${varName}_INT" -ge 50 ]; then`,
      `    ${varName}_CLR="${fg256("178")}"`,
      `  else`,
      `    ${varName}_CLR="${fg256(fg)}"`,
      `  fi`,
      `  ${varName}="${fg256(fg)}${icon} \${${varName}_CLR}[\${${varName}_BAR}] \${${varName}_INT}%${RESET}"`,
      `else`,
      `  ${varName}=""`,
      `fi`,
    ].join("\n");
  },
};

registerSegment(definition);
