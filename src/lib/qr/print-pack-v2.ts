// src/lib/qr/print-pack-v2.ts

export type PrintTemplateId = "card" | "flyer" | "poster" | "label";

export type PrintPackPayload = {
  business_name: string;
  role: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  socials: string;
};

export const DEFAULT_PRINT_PACK_PAYLOAD: PrintPackPayload = {
  business_name: "",
  role: "",
  phone: "",
  email: "",
  address: "",
  website: "",
  socials: "",
};

export function isPrintTemplateId(x: string): x is PrintTemplateId {
  return x === "card" || x === "flyer" || x === "poster" || x === "label";
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function coercePrintPackPayload(v: unknown): PrintPackPayload {
  if (!isRecord(v)) return { ...DEFAULT_PRINT_PACK_PAYLOAD };

  return {
    business_name: asString(v.business_name),
    role: asString(v.role),
    phone: asString(v.phone),
    email: asString(v.email),
    address: asString(v.address),
    website: asString(v.website),
    socials: asString(v.socials),
  };
}
