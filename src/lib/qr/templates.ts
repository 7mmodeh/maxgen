// src/lib/qr/templates.ts

export type TemplateId = "T1" | "T2" | "T3";

export const TEMPLATE_VERSION_V1 = 1;

export type TemplateSpec = {
  id: TemplateId;
  version: number;
  allowLogo: boolean;
  allowText: boolean;
  maxLogoRatio: number; // <= 0.22
  businessNameMax: number;
  taglineMax: number;
};

export const TEMPLATES_V1: Record<TemplateId, TemplateSpec> = {
  // T1 — clean (QR only, logo optional)
  T1: {
    id: "T1",
    version: 1,
    allowLogo: true,
    allowText: false,
    maxLogoRatio: 0.22,
    businessNameMax: 0,
    taglineMax: 0,
  },

  // T2 — clean + label
  T2: {
    id: "T2",
    version: 1,
    allowLogo: true,
    allowText: true,
    maxLogoRatio: 0.22,
    businessNameMax: 28,
    taglineMax: 42,
  },

  // T3 — scan-max (no logo, no text)
  T3: {
    id: "T3",
    version: 1,
    allowLogo: false,
    allowText: false,
    maxLogoRatio: 0,
    businessNameMax: 0,
    taglineMax: 0,
  },
};

export function isTemplateId(x: string): x is TemplateId {
  return x === "T1" || x === "T2" || x === "T3";
}
