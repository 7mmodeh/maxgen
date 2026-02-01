// app/api/stripe/checkout/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/src/lib/stripe";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";
import { STRIPE_PRICES } from "@/src/config/stripe-prices";

type CheckoutBody =
  | { kind: "presence"; tier: "basic" | "booking"; withMonthly?: boolean }
  | { kind: "presence"; tier: "seo" } // mandatory monthly
  | { kind: "qr_studio"; billing: "monthly" | "onetime" }
  | { kind: "qr_print_pack" };

function siteUrl(): string {
  const v = process.env.NEXT_PUBLIC_SITE_URL;
  if (!v) throw new Error("Missing NEXT_PUBLIC_SITE_URL");
  return v.replace(/\/+$/, "");
}

async function userFromBearer(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

async function getOrCreateStripeCustomer(userId: string, email?: string | null) {
  const { data, error } = await getSupabaseAdmin()
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (data?.stripe_customer_id) return data.stripe_customer_id;

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { supabase_user_id: userId },
  });

  const { error: insErr } = await getSupabaseAdmin().from("stripe_customers").insert({
    user_id: userId,
    stripe_customer_id: customer.id,
  });
  if (insErr) throw insErr;

  return customer.id;
}

export async function POST(req: Request) {
  try {
    const user = await userFromBearer(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as CheckoutBody;

    const customerId = await getOrCreateStripeCustomer(user.id, user.email);
    const baseUrl = siteUrl();

    let mode: "payment" | "subscription";
    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[];

    // These become Stripe Session metadata, then webhook uses them.
    const metadata: Record<string, string> = {
      supabase_user_id: user.id,
    };

    if (body.kind === "presence") {
      const productKey =
        body.tier === "basic"
          ? "presence_basic"
          : body.tier === "booking"
          ? "presence_booking"
          : "presence_seo";

      metadata.product_key = productKey;

      if (body.tier === "seo") {
        metadata.plan = "monthly"; // subscription plan
        mode = "subscription";
        line_items = [
          { price: STRIPE_PRICES.presence.seo.onetime, quantity: 1 },
          { price: STRIPE_PRICES.presence.seo.monthly, quantity: 1 },
        ];
      } else {
        const onetime =
          body.tier === "basic"
            ? STRIPE_PRICES.presence.basic.onetime
            : STRIPE_PRICES.presence.booking.onetime;

        const monthly =
          body.tier === "basic"
            ? STRIPE_PRICES.presence.basic.monthly
            : STRIPE_PRICES.presence.booking.monthly;

        if (body.withMonthly) {
          metadata.plan = "monthly";
          mode = "subscription";
          line_items = [
            { price: onetime, quantity: 1 },
            { price: monthly, quantity: 1 },
          ];
        } else {
          metadata.plan = "onetime";
          mode = "payment";
          line_items = [{ price: onetime, quantity: 1 }];
        }
      }
    } else if (body.kind === "qr_studio") {
      metadata.product_key = "qr_studio";
      metadata.plan = body.billing === "monthly" ? "monthly" : "onetime";

      if (body.billing === "monthly") {
        mode = "subscription";
        line_items = [{ price: STRIPE_PRICES.qr.studio.monthly, quantity: 1 }];
      } else {
        mode = "payment";
        line_items = [{ price: STRIPE_PRICES.qr.studio.onetime, quantity: 1 }];
      }
    } else if (body.kind === "qr_print_pack") {
      metadata.product_key = "qr_print_pack";
      metadata.plan = "onetime";
      mode = "payment";
      line_items = [{ price: STRIPE_PRICES.qr.printPack.onetime, quantity: 1 }];
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      customer: customerId,
      line_items,
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing/cancel`,
      metadata,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
    } catch (e: unknown) {
  console.error("checkout error (raw):", e);
  const msg = e instanceof Error ? e.message : String(e);
  console.error("checkout error:", msg);
  return NextResponse.json({ error: msg }, { status: 500 });
}
  // } catch (e: unknown) {
  //   const msg = e instanceof Error ? e.message : String(e);
  //   console.error("checkout error:", msg);
  //   return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  // }
}
