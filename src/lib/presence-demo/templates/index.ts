import type { PresenceDemoTemplate } from "../types";
import { gardening } from "./gardening";
import { painting } from "./painting";
import { wasteRemoval } from "./waste-removal";

const registry: Record<string, PresenceDemoTemplate> = {
  gardening,
  painting,
  "waste-removal": wasteRemoval,
};

export function getPresenceDemo(slug: string): PresenceDemoTemplate | null {
  const key = slug.trim().toLowerCase();
  return registry[key] ?? null;
}

export function listPresenceDemos(): readonly PresenceDemoTemplate[] {
  return Object.values(registry);
}
