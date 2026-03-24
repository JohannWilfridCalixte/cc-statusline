import { colorWrap, shellVar } from "../../generator/shell-utils.ts";
import { registerSegment } from "../registry.ts";
import type { SegmentDefinition } from "../types.ts";

const definition: SegmentDefinition = {
  name: "model",
  defaultIcon: "\uf489",
  defaultFg: "75",
  defaultBg: "",
  type: "json",
  generateShellCode(ctx) {
    const varName = shellVar("model");
    const icon = ctx.segmentConfig.icon ?? this.defaultIcon;
    const fg = ctx.segmentConfig.fg ?? this.defaultFg;
    return [
      `${varName}_RAW=$(echo "$DATA" | jq -r '.model.display_name // empty')`,
      `if [ -n "$${varName}_RAW" ]; then`,
      `  ${varName}="${colorWrap(`${icon} $${varName}_RAW`, fg)}"`,
      `else`,
      `  ${varName}=""`,
      `fi`,
    ].join("\n");
  },
};

registerSegment(definition);
