import { colorWrap, shellVar } from "../../generator/shell-utils.ts";
import { registerSegment } from "../registry.ts";
import type { SegmentDefinition } from "../types.ts";

const definition: SegmentDefinition = {
  name: "agent_name",
  defaultIcon: "\uf544",
  defaultFg: "141",
  defaultBg: "",
  type: "json",
  generateShellCode(ctx) {
    const varName = shellVar("agent_name");
    const icon = ctx.segmentConfig.icon ?? this.defaultIcon;
    const fg = ctx.segmentConfig.fg ?? this.defaultFg;
    return [
      `${varName}_RAW=$(echo "$DATA" | jq -r '.agent.name // empty')`,
      `if [ -n "$${varName}_RAW" ]; then`,
      `  ${varName}="${colorWrap(`${icon} $${varName}_RAW`, fg)}"`,
      `else`,
      `  ${varName}=""`,
      `fi`,
    ].join("\n");
  },
};

registerSegment(definition);
