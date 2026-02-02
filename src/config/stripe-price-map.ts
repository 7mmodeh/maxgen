// src/config/stripe-price-map.ts

import { STRIPE_PRICES } from "@/src/config/stripe-prices";

export const runtime = "nodejs";

export type ProductKey =
  | "presence_basic"
  | "presence_booking"
  | "presence_seo"
  | "qr_studio"
  | "qr_print_pack";

export type Plan = "monthly" | "onetime";

export function productKeyFromPriceId(priceId: string): ProductKey | null {
  switch (priceId) {
    // Presence Basic
    case STRIPE_PRICES.presence.basic.onetime:
    case STRIPE_PRICES.presence.basic.monthly:
      return "presence_basic";

    // Presence Booking
    case STRIPE_PRICES.presence.booking.onetime:
    case STRIPE_PRICES.presence.booking.monthly:
      return "presence_booking";

    // Presence SEO
    case STRIPE_PRICES.presence.seo.onetime:
    case STRIPE_PRICES.presence.seo.monthly:
      return "presence_seo";

    // QR Studio
    case STRIPE_PRICES.qr.studio.onetime:
    case STRIPE_PRICES.qr.studio.monthly:
      return "qr_studio";

    // QR Print Pack
    case STRIPE_PRICES.qr.printPack.onetime:
      return "qr_print_pack";

    default:
      return null;
  }
}

export function planFromPriceId(priceId: string): Plan | null {
  switch (priceId) {
    case STRIPE_PRICES.presence.basic.monthly:
    case STRIPE_PRICES.presence.booking.monthly:
    case STRIPE_PRICES.presence.seo.monthly:
    case STRIPE_PRICES.qr.studio.monthly:
      return "monthly";

    case STRIPE_PRICES.presence.basic.onetime:
    case STRIPE_PRICES.presence.booking.onetime:
    case STRIPE_PRICES.presence.seo.onetime:
    case STRIPE_PRICES.qr.studio.onetime:
    case STRIPE_PRICES.qr.printPack.onetime:
      return "onetime";

    default:
      return null;
  }
}
