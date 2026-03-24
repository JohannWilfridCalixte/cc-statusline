import { colorWrap, shellVar } from "../../generator/shell-utils.ts";
import { registerSegment } from "../registry.ts";
import type { SegmentDefinition } from "../types.ts";

const definition: SegmentDefinition = {
  name: "session_id",
  defaultIcon: "\uf2c1",
  defaultFg: "245",
  defaultBg: "",
  type: "json",
  generateShellCode(ctx) {
    const varName = shellVar("session_id");
    const icon = ctx.segmentConfig.icon ?? this.defaultIcon;
    const fg = ctx.segmentConfig.fg ?? this.defaultFg;
    return [
      `${varName}_RAW=$(echo "$DATA" | jq -r '.session_id // empty')`,
      `if [ -n "$${varName}_RAW" ]; then`,
      `  ${varName}_SHORT=$(echo "$${varName}_RAW" | cut -c1-8)`,
      `  ${varName}="${colorWrap(`${icon} $${varName}_SHORT`, fg)}"`,
      `else`,
      `  ${varName}=""`,
      `fi`,
    ].join("\n");
  },
};

registerSegment(definition);
