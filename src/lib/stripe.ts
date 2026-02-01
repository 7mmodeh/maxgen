// src/lib/stripe.ts

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("Missing STRIPE_SECRET_KEY");

export const stripe = new Stripe(key, {
  // IMPORTANT: use the library’s typed latest API version
  // or set to null if you intentionally stay on older account version.
  apiVersion: "2026-01-28.clover",
  maxNetworkRetries: 2,
});
