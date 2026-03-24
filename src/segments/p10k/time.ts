import { colorWrap, shellVar } from "../../generator/shell-utils.ts";
import { registerSegment } from "../registry.ts";
import type { SegmentDefinition } from "../types.ts";

const definition: SegmentDefinition = {
  name: "time",
  defaultIcon: "\uf017",
  defaultFg: "66",
  defaultBg: "",
  type: "shell",
  generateShellCode(ctx) {
    const varName = shellVar("time");
    const icon = ctx.segmentConfig.icon ?? this.defaultIcon;
    const fg = ctx.segmentConfig.fg ?? this.defaultFg;
    return [
      `${varName}_VAL=$(date +"%H:%M:%S")`,
      `${varName}="${colorWrap(`${icon} $${varName}_VAL`, fg)}"`,
    ].join("\n");
  },
};

registerSegment(definition);
