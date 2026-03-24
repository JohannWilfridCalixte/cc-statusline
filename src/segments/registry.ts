import type { SegmentName } from "../config/schema.ts";
import type { SegmentDefinition } from "./types.ts";

const registry = new Map<SegmentName, SegmentDefinition>();

export function registerSegment(definition: SegmentDefinition) {
  registry.set(definition.name, definition);
}

export function getSegment(name: SegmentName) {
  const definition = registry.get(name);
  if (!definition) {
    throw new Error(`Unknown segment: "${name}"`);
  }
  return definition;
}

export function getAllSegments() {
  return [...registry.values()];
}

export function hasSegment(name: SegmentName) {
  return registry.has(name);
}
