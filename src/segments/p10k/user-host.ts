import { colorWrap, shellVar } from "../../generator/shell-utils.ts";
import { registerSegment } from "../registry.ts";
import type { SegmentDefinition } from "../types.ts";

const definition: SegmentDefinition = {
  name: "user_host",
  defaultIcon: "\uf007",
  defaultFg: "195",
  defaultBg: "",
  type: "shell",
  generateShellCode(ctx) {
    const varName = shellVar("user_host");
    const icon = ctx.segmentConfig.icon ?? this.defaultIcon;
    const fg = ctx.segmentConfig.fg ?? this.defaultFg;
    return [
      `${varName}_USER=$(whoami)`,
      `${varName}_HOST=$(hostname -s 2>/dev/null || hostname)`,
      `${varName}="${colorWrap(`${icon} $${varName}_USER@$${varName}_HOST`, fg)}"`,
    ].join("\n");
  },
};

registerSegment(definition);
