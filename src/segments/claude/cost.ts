import { colorWrap, shellVar } from "../../generator/shell-utils.ts";
import { registerSegment } from "../registry.ts";
import type { SegmentDefinition } from "../types.ts";

const definition: SegmentDefinition = {
  name: "cost",
  defaultIcon: "\uf155",
  defaultFg: "178",
  defaultBg: "",
  type: "json",
  generateShellCode(ctx) {
    const varName = shellVar("cost");
    const icon = ctx.segmentConfig.icon ?? this.defaultIcon;
    const fg = ctx.segmentConfig.fg ?? this.defaultFg;
    return [
      `${varName}_RAW=$(echo "$DATA" | jq -r '.cost.total_cost_usd // empty')`,
      `if [ -n "$${varName}_RAW" ]; then`,
      `  ${varName}_FMT=$(printf "%.4f" "$${varName}_RAW")`,
      `  ${varName}="${colorWrap(`${icon} $${varName}_FMT`, fg)}"`,
      `else`,
      `  ${varName}=""`,
      `fi`,
    ].join("\n");
  },
};

registerSegment(definition);
