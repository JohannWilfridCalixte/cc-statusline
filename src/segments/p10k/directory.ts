import { colorWrap, shellVar } from "../../generator/shell-utils.ts";
import { registerSegment } from "../registry.ts";
import type { SegmentDefinition } from "../types.ts";

const definition: SegmentDefinition = {
  name: "directory",
  defaultIcon: "\uf07c",
  defaultFg: "39",
  defaultBg: "",
  type: "json",
  generateShellCode(ctx) {
    const varName = shellVar("directory");
    const icon = ctx.segmentConfig.icon ?? this.defaultIcon;
    const fg = ctx.segmentConfig.fg ?? this.defaultFg;
    return [
      `${varName}_RAW=$(echo "$DATA" | jq -r '.cwd // empty')`,
      `if [ -z "$${varName}_RAW" ]; then`,
      `  ${varName}_RAW=$(pwd)`,
      `fi`,
      `${varName}_SHORT=$(echo "$${varName}_RAW" | sed "s|^$HOME|~|")`,
      `${varName}="${colorWrap(`${icon} $${varName}_SHORT`, fg)}"`,
    ].join("\n");
  },
};

registerSegment(definition);
