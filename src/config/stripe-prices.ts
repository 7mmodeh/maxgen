// src/config/stripe-prices.ts

/**
 * Stripe Price Map — Maxgen Systems Ltd
 * -----------------------------------
 * Single source of truth for ALL Stripe Price IDs.
 * - Reads env vars once at import time
 * - Freezes the object to prevent mutation
 * - Throws early if any required price is missing
 *
 * IMPORTANT:
 * - This file MUST only be imported server-side
 *   (route handlers, server actions, webhooks).
 * - Do NOT import into client components.
 */

type PresenceTier = "basic" | "booking" | "seo";
type BillingKind = "onetime" | "monthly";

export type StripePriceKey =
  | "presence_basic_onetime"
  | "presence_basic_monthly"
  | "presence_booking_onetime"
  | "presence_booking_monthly"
  | "presence_seo_onetime"
  | "presence_seo_monthly"
  | "qr_studio_monthly"
  | "qr_studio_onetime"
  | "qr_print_pack_onetime"
  | "experimental_eur1_onetime";

function mustGetEnv(key: string): string {
  const v = process.env[key];
  if (!v) {
    throw new Error(`[stripe-prices] Missing env var: ${key}`);
  }
  return v;
}

export const STRIPE_PRICES = Object.freeze({
  presence: {
    basic: {
      onetime: mustGetEnv("PRICE_PRESENCE_BASIC_ONETIME"),
      monthly: mustGetEnv("PRICE_PRESENCE_BASIC_MONTHLY"),
    },
    booking: {
      onetime: mustGetEnv("PRICE_PRESENCE_BOOKING_ONETIME"),
      monthly: mustGetEnv("PRICE_PRESENCE_BOOKING_MONTHLY"),
    },
    seo: {
      onetime: mustGetEnv("PRICE_PRESENCE_SEO_ONETIME"),
      monthly: mustGetEnv("PRICE_PRESENCE_SEO_MONTHLY"),
    },
  },

  qr: {
    studio: {
      monthly: mustGetEnv("PRICE_QR_STUDIO_MONTHLY"),
      onetime: mustGetEnv("PRICE_QR_STUDIO_ONETIME"),
    },
    printPack: {
      onetime: mustGetEnv("PRICE_QR_PRINT_PACK_ONETIME"),
    },
  },

  experimental: {
    eur1: {
      onetime: mustGetEnv("PRICE_EXPERIMENTAL_EUR1_ONETIME"),
    },
  },
} as const);

// Convenience helpers (optional but recommended)
export function getPresencePrice(tier: PresenceTier, kind: BillingKind): string {
  return STRIPE_PRICES.presence[tier][kind];
}

export function getQrStudioPrice(kind: "monthly" | "onetime"): string {
  return STRIPE_PRICES.qr.studio[kind];
}

export function getQrPrintPackPrice(): string {
  return STRIPE_PRICES.qr.printPack.onetime;
}

export function getExperimentalEur1Price(): string {
  return STRIPE_PRICES.experimental.eur1.onetime;
}
