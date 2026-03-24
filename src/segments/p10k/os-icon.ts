import { colorWrap, shellVar } from "../../generator/shell-utils.ts";
import { registerSegment } from "../registry.ts";
import type { SegmentDefinition } from "../types.ts";

const definition: SegmentDefinition = {
  name: "os_icon",
  defaultIcon: "\uf179",
  defaultFg: "255",
  defaultBg: "",
  type: "shell",
  generateShellCode(ctx) {
    const varName = shellVar("os_icon");
    const icon = ctx.segmentConfig.icon ?? this.defaultIcon;
    const fg = ctx.segmentConfig.fg ?? this.defaultFg;
    return [
      `case "$(uname -s)" in`,
      `  Darwin) ${varName}_ICON="${icon}" ;;`,
      `  Linux)  ${varName}_ICON="\uf17c" ;;`,
      `  *)      ${varName}_ICON="\uf108" ;;`,
      `esac`,
      `${varName}="${colorWrap(`$${varName}_ICON`, fg)}"`,
    ].join("\n");
  },
};

registerSegment(definition);
