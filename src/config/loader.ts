import { existsSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import { DEFAULT_CONFIG } from "./defaults.ts";
import type { Config, SegmentConfig, SegmentName } from "./schema.ts";
import { SEGMENT_NAMES } from "./schema.ts";

interface ConfigError {
  readonly code: "INVALID_SEGMENT" | "INVALID_YAML" | "READ_ERROR";
  readonly message: string;
}

interface ConfigResult {
  readonly ok: true;
  readonly value: Config;
}

interface ConfigErrorResult {
  readonly ok: false;
  readonly error: ConfigError;
}

const SEGMENT_NAME_SET: ReadonlySet<string> = new Set(SEGMENT_NAMES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSegmentName(name: string): name is SegmentName {
  return SEGMENT_NAME_SET.has(name);
}

function validateSegmentNames(names: readonly unknown[]): ConfigError | null {
  for (const name of names) {
    if (typeof name !== "string" || !isSegmentName(name)) {
      return { code: "INVALID_SEGMENT", message: `Unknown segment: "${String(name)}"` };
    }
  }
  return null;
}

function getRecord(
  parent: Record<string, unknown>,
  key: string,
): Record<string, unknown> | undefined {
  const value = parent[key];
  return isRecord(value) ? value : undefined;
}

function validateLineConfig(line: Record<string, unknown>): ConfigError | null {
  if (Array.isArray(line["left"])) {
    const err = validateSegmentNames(line["left"]);
    if (err) return err;
  }
  if (Array.isArray(line["right"])) {
    const err = validateSegmentNames(line["right"]);
    if (err) return err;
  }
  return null;
}

function validateConfig(raw: Record<string, unknown>): ConfigError | null {
  const line1 = getRecord(raw, "line1");
  const line2 = getRecord(raw, "line2");

  if (line1) {
    const err = validateLineConfig(line1);
    if (err) return err;
  }

  if (line2) {
    const err = validateLineConfig(line2);
    if (err) return err;
  }

  const segments = getRecord(raw, "segments");
  if (segments) {
    for (const key of Object.keys(segments)) {
      if (!isSegmentName(key)) {
        return { code: "INVALID_SEGMENT", message: `Unknown segment in overrides: "${key}"` };
      }
    }
  }

  return null;
}

function extractSegmentNames(
  line: Record<string, unknown> | undefined,
  side: string,
  fallback: readonly SegmentName[],
): readonly SegmentName[] {
  if (!line) return fallback;
  const value = line[side];
  if (!Array.isArray(value)) return fallback;
  return value.filter(
    (item): item is SegmentName => typeof item === "string" && isSegmentName(item),
  );
}

function toSegmentConfig(raw: unknown): SegmentConfig | undefined {
  if (!isRecord(raw)) return undefined;
  if (typeof raw["enabled"] !== "boolean") return undefined;
  return {
    enabled: raw["enabled"],
    ...(typeof raw["fg"] === "string" ? { fg: raw["fg"] } : {}),
    ...(typeof raw["bg"] === "string" ? { bg: raw["bg"] } : {}),
    ...(typeof raw["icon"] === "string" ? { icon: raw["icon"] } : {}),
    ...(typeof raw["format"] === "string" ? { format: raw["format"] } : {}),
  };
}

function toSegmentOverrides(
  raw: Record<string, unknown>,
): Partial<Record<SegmentName, SegmentConfig>> {
  const result: Partial<Record<SegmentName, SegmentConfig>> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!isSegmentName(key)) continue;
    // YAML objects pass through as-is when they have valid keys after validation
    if (isRecord(value)) {
      const parsed = toSegmentConfig(value);
      if (parsed) {
        result[key] = parsed;
      } else {
        // Permissive: treat raw record with at least enabled as override
        result[key] = { enabled: true, ...pickStringFields(value) };
      }
    }
  }
  return result;
}

function pickStringFields(raw: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") result[key] = value;
  }
  return result;
}

function mergeConfig(partial: Record<string, unknown>): Config {
  const line1 = getRecord(partial, "line1");
  const line2 = getRecord(partial, "line2");
  const segments = getRecord(partial, "segments");

  return {
    theme: "default",
    line1: {
      left: extractSegmentNames(line1, "left", DEFAULT_CONFIG.line1.left),
      right: extractSegmentNames(line1, "right", DEFAULT_CONFIG.line1.right),
    },
    line2: {
      left: extractSegmentNames(line2, "left", DEFAULT_CONFIG.line2.left),
      right: extractSegmentNames(line2, "right", DEFAULT_CONFIG.line2.right),
    },
    segments: {
      ...DEFAULT_CONFIG.segments,
      ...(segments ? toSegmentOverrides(segments) : {}),
    },
    settings_json_path:
      typeof partial["settings_json_path"] === "string"
        ? partial["settings_json_path"]
        : DEFAULT_CONFIG.settings_json_path,
    output_path:
      typeof partial["output_path"] === "string"
        ? partial["output_path"]
        : DEFAULT_CONFIG.output_path,
  };
}

export function loadConfig(path?: string): ConfigResult | ConfigErrorResult {
  if (!path || !existsSync(path)) {
    return { ok: true, value: DEFAULT_CONFIG };
  }

  let content: string;
  try {
    content = readFileSync(path, "utf-8");
  } catch {
    return { ok: false, error: { code: "READ_ERROR", message: `Cannot read config: ${path}` } };
  }

  let raw: unknown;
  try {
    raw = parse(content);
  } catch {
    return { ok: false, error: { code: "INVALID_YAML", message: `Invalid YAML in ${path}` } };
  }

  if (!isRecord(raw)) {
    return { ok: true, value: DEFAULT_CONFIG };
  }

  const err = validateConfig(raw);
  if (err) {
    return { ok: false, error: err };
  }

  return { ok: true, value: mergeConfig(raw) };
}
