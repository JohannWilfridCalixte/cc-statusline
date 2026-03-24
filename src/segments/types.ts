import type { SegmentConfig, SegmentName } from "../config/schema.ts";

type SegmentType = "json" | "shell";

interface ThemeColors {
  readonly separator_fg: string;
  readonly segment_defaults: Record<SegmentName, { readonly fg: string; readonly bg: string }>;
}

interface SegmentContext {
  readonly segmentConfig: SegmentConfig;
  readonly theme: ThemeColors;
}

interface SegmentDefinition {
  readonly name: SegmentName;
  readonly defaultIcon: string;
  readonly defaultFg: string;
  readonly defaultBg: string;
  readonly type: SegmentType;
  readonly generateShellCode: (ctx: SegmentContext) => string;
}

export type { SegmentContext, SegmentDefinition, ThemeColors };
