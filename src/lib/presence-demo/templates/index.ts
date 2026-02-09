import type { PresenceDemoTemplate } from "../types";
import { gardeningDemo } from "./gardening";
import { wasteRemovalDemo } from "./waste-removal";
import { paintingDemo } from "./painting";

const templates = [gardeningDemo, wasteRemovalDemo, paintingDemo] as const;

export function listPresenceDemos(): readonly PresenceDemoTemplate[] {
  return templates;
}

export function getPresenceDemo(slug: string): PresenceDemoTemplate | null {
  const match = templates.find((t) => t.slug === slug);
  return match ?? null;
}

