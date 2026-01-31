import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/src/lib/stripe";
import { supabaseAdmin } from "@/src/lib/supabase-admin";
import {
  productKeyFromPriceId,
  planFromPriceId,
  type ProductKey,
  type Plan,
} from "@/src/config/stripe-price-map";

export const runtime = "nodejs";

// DB enum labels (confirmed)
type EntitlementStatus = "active" | "inactive" | "canceled" | "expired";

function assertEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

async function rawBody(req: Request): Promise<Buffer> {
  const ab = await req.arrayBuffer();
  return Buffer.from(ab);
}

async function resolveUserIdFromCustomer(
  stripeCustomerId: string
): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("stripe_customers")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (error) {
    console.error("resolveUserIdFromCustomer error:", error);
    return null;
  }
  return data?.user_id ?? null;
}

function mapStripeSubStatusToEnum(
  stripeStatus: Stripe.Subscription.Status,
  eventType: string
): EntitlementStatus {
  if (stripeStatus === "active" || stripeStatus === "trialing") return "active";
  if (stripeStatus === "canceled") return "canceled";
  if (eventType === "customer.subscription.deleted") return "canceled";
  return "inactive";
}

function tryGetCurrentPeriodEndIso(sub: Stripe.Subscription): string | null {
  // Runtime-safe access (Stripe typings may differ by configured apiVersion)
  const maybe = sub as unknown as { current_period_end?: unknown };
  if (typeof maybe.current_period_end === "number") {
    return new Date(maybe.current_period_end * 1000).toISOString();
  }
  return null;
}

async function upsertEntitlement(args: {
  userId: string;
  productKey: ProductKey;
  plan: Plan;
  status: EntitlementStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePaymentIntentId: string | null;
  expiresAt: string | null; // ISO
  metadata: Record<string, unknown>;
}) {
  const now = new Date().toISOString();

  const payload = {
    user_id: args.userId,
    product_key: args.productKey,
    plan: args.plan,
    status: args.status,
    stripe_customer_id: args.stripeCustomerId,
    stripe_subscription_id: args.stripeSubscriptionId,
    stripe_payment_intent_id: args.stripePaymentIntentId,
    expires_at: args.expiresAt,
    metadata: args.metadata,
    updated_at: now,
  };

  const { error } = await supabaseAdmin
    .from("entitlements")
    .upsert(payload, { onConflict: "user_id,product_key,plan" });

  if (error) console.error("entitlements upsert error:", error);
}

async function upsertPresenceOrder(args: {
  userId: string;
  packageKey: "basic" | "booking" | "seo";
  checkoutSessionId: string;
}) {
  // NOTE: this requires your table to have:
  // - stripe_checkout_session_id text
  // - a unique index on stripe_checkout_session_id (recommended)
  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from("presence_orders")
    .upsert(
      {
        user_id: args.userId,
        package_key: args.packageKey,
        status: "paid",
        onboarding: {},
        stripe_checkout_session_id: args.checkoutSessionId,
        updated_at: now,
      },
      { onConflict: "stripe_checkout_session_id" }
    );

  if (error) {
    console.error("presence_orders upsert error:", error);
  }
}

function presencePackageKeyFromProductKey(
  productKey: string
): "basic" | "booking" | "seo" | null {
  if (productKey === "presence_basic") return "basic";
  if (productKey === "presence_booking") return "booking";
  if (productKey === "presence_seo") return "seo";
  return null;
}

export async function POST(req: Request) {
  const webhookSecret = assertEnv("STRIPE_WEBHOOK_SECRET");
  const sig = req.headers.get("stripe-signature");
  if (!sig)
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );

  let event: Stripe.Event;
  try {
    const body = await rawBody(req);
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Webhook signature verification failed:", msg);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const stripeCustomerId =
          typeof session.customer === "string" ? session.customer : null;
        if (!stripeCustomerId) break;

        const metaUserId = session.metadata?.["supabase_user_id"] ?? null;
        const userId =
          metaUserId || (await resolveUserIdFromCustomer(stripeCustomerId));
        if (!userId) break;

        const stripePaymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : null;

        const stripeSubscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;

        // ✅ Presence operational record creation (deterministic, no line-item guessing)
        // Uses the metadata set in your /api/stripe/checkout route.
        const metaProductKey = session.metadata?.["product_key"] ?? null;
        if (metaProductKey) {
          const pkgKey = presencePackageKeyFromProductKey(metaProductKey);
          if (pkgKey) {
            await upsertPresenceOrder({
              userId,
              packageKey: pkgKey,
              checkoutSessionId: session.id,
            });
          }
        }

        // Entitlements: derive from the actual line items (scope-guarded)
        const items = await stripe.checkout.sessions.listLineItems(session.id, {
          limit: 100,
        });

        for (const li of items.data) {
          const priceId = li.price?.id ?? null;
          if (!priceId) continue;

          const productKey = productKeyFromPriceId(priceId);
          const plan = planFromPriceId(priceId);
          if (!productKey || !plan) continue;

          await upsertEntitlement({
            userId,
            productKey,
            plan,
            status: "active",
            stripeCustomerId,
            stripeSubscriptionId: plan === "monthly" ? stripeSubscriptionId : null,
            stripePaymentIntentId: plan === "onetime" ? stripePaymentIntentId : null,
            expiresAt: null,
            metadata: {
              source: "stripe",
              event: "checkout.session.completed",
              checkout_session_id: session.id,
              price_id: priceId,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        const stripeCustomerId =
          typeof sub.customer === "string" ? sub.customer : null;
        if (!stripeCustomerId) break;

        const userId = await resolveUserIdFromCustomer(stripeCustomerId);
        if (!userId) break;

        const expanded = await stripe.subscriptions.retrieve(sub.id, {
          expand: ["items.data.price"],
        });

        const expiresAt = tryGetCurrentPeriodEndIso(expanded);
        const status = mapStripeSubStatusToEnum(expanded.status, event.type);

        for (const item of expanded.items.data) {
          const priceId = item.price?.id ?? null;
          if (!priceId) continue;

          const productKey = productKeyFromPriceId(priceId);
          const plan = planFromPriceId(priceId);

          // Only monthly entitlements are maintained here
          if (!productKey || plan !== "monthly") continue;

          await upsertEntitlement({
            userId,
            productKey,
            plan: "monthly",
            status,
            stripeCustomerId,
            stripeSubscriptionId: expanded.id,
            stripePaymentIntentId: null,
            expiresAt,
            metadata: {
              source: "stripe",
              event: event.type,
              subscription_id: expanded.id,
              price_id: priceId,
              stripe_status: expanded.status,
            },
          });
        }
        break;
      }

      // Kept in scope, but not required because subscription.updated handles renewals.
      case "invoice.paid":
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Webhook handler failed:", msg);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
