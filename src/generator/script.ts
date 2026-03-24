import type { Config, SegmentName } from "../config/schema.ts";
import type { SegmentContext } from "../segments/types.ts";

import { DEFAULT_THEME, shellVar } from "./shell-utils.ts";
import {
  generateHeader,
  generateJsonParsing,
  generateLineAssembly,
  generateSeparator,
  generateTermWidth,
} from "./template.ts";
import "../segments/register-all.ts";
import { getSegment } from "../segments/registry.ts";

function buildSegmentCode(name: SegmentName, config: Config) {
  const definition = getSegment(name);
  const segmentConfig = config.segments[name] ?? {
    enabled: true,
  };

  const ctx: SegmentContext = {
    segmentConfig,
    theme: DEFAULT_THEME,
  };

  return definition.generateShellCode(ctx);
}

export function generateScript(config: Config) {
  const parts: string[] = [];

  parts.push(generateHeader());
  parts.push(generateJsonParsing());
  parts.push(generateTermWidth());
  parts.push(generateSeparator(DEFAULT_THEME.separator_fg));
  parts.push("");

  // Collect all unique segment names
  const allSegments = new Set<SegmentName>([
    ...config.line1.left,
    ...config.line1.right,
    ...config.line2.left,
    ...config.line2.right,
  ]);

  // Generate code for each segment
  parts.push("# --- Segment computations ---");
  for (const name of allSegments) {
    const segConfig = config.segments[name];
    if (segConfig && !segConfig.enabled) continue;

    parts.push("");
    parts.push(`# Segment: ${name}`);
    parts.push(buildSegmentCode(name, config));
  }

  parts.push("");
  parts.push("# --- Layout ---");
  parts.push("");

  // Line assembly
  const enabledFilter = (name: SegmentName) => {
    const segConfig = config.segments[name];
    return !segConfig || segConfig.enabled !== false;
  };

  const line1Left = config.line1.left.filter(enabledFilter).map(shellVar);
  const line1Right = config.line1.right.filter(enabledFilter).map(shellVar);
  const line2Left = config.line2.left.filter(enabledFilter).map(shellVar);
  const line2Right = config.line2.right.filter(enabledFilter).map(shellVar);

  parts.push(generateLineAssembly(1, line1Left, line1Right));
  parts.push(generateLineAssembly(2, line2Left, line2Right));

  return parts.join("\n");
}
