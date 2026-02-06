import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/src/lib/stripe";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";
import {
  productKeyFromPriceId,
  planFromPriceId,
  type ProductKey,
  type Plan,
} from "@/src/config/stripe-price-map";

export const runtime = "nodejs";

type EntitlementStatus = "active" | "inactive" | "canceled" | "expired";

function assertEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function toIsoFromUnixSeconds(sec: number | null | undefined): string | null {
  if (!sec || typeof sec !== "number") return null;
  return new Date(sec * 1000).toISOString();
}

async function rawBody(req: Request): Promise<Buffer> {
  const ab = await req.arrayBuffer();
  return Buffer.from(ab);
}

async function resolveUserIdFromCustomer(
  stripeCustomerId: string,
): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin()
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
  eventType: string,
): EntitlementStatus {
  if (stripeStatus === "active" || stripeStatus === "trialing") return "active";
  if (stripeStatus === "canceled") return "canceled";
  if (eventType === "customer.subscription.deleted") return "canceled";
  return "inactive";
}

function tryGetCurrentPeriodEndIso(sub: Stripe.Subscription): string | null {
  const maybe = sub as unknown as { current_period_end?: unknown };
  if (typeof maybe.current_period_end === "number") {
    return new Date(maybe.current_period_end * 1000).toISOString();
  }
  return null;
}

function businessLineFromProductKey(pk: ProductKey): "company" | "qr_studio" {
  // presence_* => company, qr_* => qr_studio
  if (pk.startsWith("presence_")) return "company";
  return "qr_studio";
}

/**
 * Stripe typings can differ by API version; access price id safely.
 */
function getInvoiceLinePriceId(line: Stripe.InvoiceLineItem): string | null {
  const maybe = line as unknown as { price?: unknown };
  const price = maybe.price as unknown;
  if (!price || typeof price !== "object") return null;

  const pid = (price as { id?: unknown }).id;
  return typeof pid === "string" ? pid : null;
}

/**
 * Stripe typings can differ by API version; access subscription safely.
 */
function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const maybe = invoice as unknown as { subscription?: unknown };
  const sub = maybe.subscription;
  return typeof sub === "string" ? sub : null;
}

async function upsertEntitlement(args: {
  userId: string;
  productKey: ProductKey;
  plan: Plan;
  status: EntitlementStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePaymentIntentId: string | null;
  expiresAt: string | null;
  metadata: Record<string, unknown>;
  // canonical paid fields
  amountCents: number | null;
  currency: string | null;
  paidAtIso: string | null;
  stripeInvoiceId: string | null;
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

    // paid-only canonical fields (keep null unless paid event)
    amount_cents: args.amountCents,
    currency: args.currency,
    paid_at: args.paidAtIso,
    stripe_invoice_id: args.stripeInvoiceId,
  };

  const { error } = await getSupabaseAdmin()
    .from("entitlements")
    .upsert(payload, { onConflict: "user_id,product_key,plan" });

  if (error) console.error("entitlements upsert error:", error);
}

async function upsertPresenceOrder(args: {
  userId: string;
  packageKey: "basic" | "booking" | "seo";
  checkoutSessionId: string;
  // paid-only canonical
  amountCents: number | null;
  currency: string | null;
  paidAtIso: string | null;
  stripePaymentIntentId: string | null;
  stripeSubscriptionId: string | null;
}) {
  const now = new Date().toISOString();

  const { error } = await getSupabaseAdmin()
    .from("presence_orders")
    .upsert(
      {
        user_id: args.userId,
        package_key: args.packageKey,
        status: "paid",
        onboarding: {},
        stripe_checkout_session_id: args.checkoutSessionId,
        updated_at: now,

        // paid-only canonical fields
        amount_cents: args.amountCents,
        currency: args.currency,
        paid_at: args.paidAtIso,
        stripe_payment_intent_id: args.stripePaymentIntentId,
        stripe_subscription_id: args.stripeSubscriptionId,
      },
      { onConflict: "stripe_checkout_session_id" },
    );

  if (error) console.error("presence_orders upsert error:", error);
}

async function ensureStripeLedgerEntry(args: {
  bankAccountId: string;
  userId: string;
  businessLine: "company" | "qr_studio";
  effectiveDateIso: string; // YYYY-MM-DD
  amountCents: number; // positive (inflow)
  currency: string;
  relatedId: string; // invoice_id or payment_intent_id
  notes: string;
  tags?: string[];
}) {
  const admin = getSupabaseAdmin();

  // Idempotent by unique index on (related_entity_type, related_entity_id) where type='stripe'
  const exists = await admin
    .from("ops_ledger_entries")
    .select("id")
    .eq("related_entity_type", "stripe")
    .eq("related_entity_id", args.relatedId)
    .maybeSingle();

  if (exists.data?.id) return;

  const amt = args.amountCents / 100;

  const ins = await admin.from("ops_ledger_entries").insert({
    effective_date: args.effectiveDateIso,
    bank_account_id: args.bankAccountId,
    amount: amt, // numeric
    entry_type: "customer_payment",
    category: "general", // ledger_category enum (you can change later)
    business_line: args.businessLine,
    counterparty: null,
    payment_method: `stripe:${args.currency}`,
    tags: args.tags ?? ["sales"],
    related_entity_type: "stripe",
    related_entity_id: args.relatedId,
    notes: args.notes,
    created_by: args.userId,
  });

  if (ins.error) {
    console.error("ops_ledger_entries insert (stripe) error:", ins.error);
  }
}

export async function POST(req: Request) {
  const webhookSecret = assertEnv("STRIPE_WEBHOOK_SECRET");
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    const body = await rawBody(req);
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Webhook signature verification failed:", msg);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const OPS_MAIN_BANK_ACCOUNT_ID = assertEnv("OPS_MAIN_BANK_ACCOUNT_ID");

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
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null;

        const stripeSubscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;

        const paidAtIso = toIsoFromUnixSeconds(
          typeof session.created === "number" ? session.created : null,
        );
        const currency =
          typeof session.currency === "string" ? session.currency : null;
        const amountTotal =
          typeof session.amount_total === "number" ? session.amount_total : null;

        // Get line items to derive product keys (authoritative)
        const items = await stripe.checkout.sessions.listLineItems(session.id, {
          limit: 100,
        });

        let presencePackage: "basic" | "booking" | "seo" | null = null;
        let anyBusinessLine: "company" | "qr_studio" | null = null;

        for (const li of items.data) {
          const priceId = li.price?.id ?? null;
          if (!priceId) continue;

          const productKey = productKeyFromPriceId(priceId);
          const plan = planFromPriceId(priceId);
          if (!productKey || !plan) continue;

          if (!anyBusinessLine)
            anyBusinessLine = businessLineFromProductKey(productKey);

          if (!presencePackage) {
            if (productKey === "presence_basic") presencePackage = "basic";
            else if (productKey === "presence_booking") presencePackage = "booking";
            else if (productKey === "presence_seo") presencePackage = "seo";
          }

          // Option A (safe): per-line allocation for onetime entitlements using li.amount_total
          const lineAmountTotal =
            typeof li.amount_total === "number" ? li.amount_total : null;

          await upsertEntitlement({
            userId,
            productKey,
            plan,
            status: "active",
            stripeCustomerId,
            stripeSubscriptionId: plan === "monthly" ? stripeSubscriptionId : null,
            stripePaymentIntentId:
              plan === "onetime" ? stripePaymentIntentId : null,
            expiresAt: null,
            metadata: {
              source: "stripe",
              event: "checkout.session.completed",
              checkout_session_id: session.id,
              price_id: priceId,
            },

            // Canonical paid fields:
            // - Onetime: stamp per-line cents (Option A)
            // - Monthly: do NOT stamp (renewals & precise amounts come via invoice.paid)
            amountCents: plan === "onetime" ? lineAmountTotal : null,
            currency: plan === "onetime" ? currency : null,
            paidAtIso: plan === "onetime" ? paidAtIso : null,
            stripeInvoiceId: null,
          });
        }

        // Presence operational order: stamp paid fields from session (canonical)
        if (presencePackage) {
          await upsertPresenceOrder({
            userId,
            packageKey: presencePackage,
            checkoutSessionId: session.id,
            amountCents: amountTotal,
            currency,
            paidAtIso,
            stripePaymentIntentId,
            stripeSubscriptionId,
          });
        }

        // Ledger entry for the cash actually received at checkout.
        // Use payment_intent id as canonical Stripe source id for this entry.
        if (stripePaymentIntentId && amountTotal && currency) {
          const effectiveDateIso = (paidAtIso ?? new Date().toISOString()).slice(
            0,
            10,
          );
          const bl = anyBusinessLine ?? (presencePackage ? "company" : "qr_studio");

          await ensureStripeLedgerEntry({
            bankAccountId: OPS_MAIN_BANK_ACCOUNT_ID,
            userId,
            businessLine: bl,
            effectiveDateIso,
            amountCents: amountTotal,
            currency,
            relatedId: stripePaymentIntentId,
            notes: `stripe checkout paid: session=${session.id} pi=${stripePaymentIntentId}`,
            tags: [
              "sales",
              bl === "company" ? "presence" : "qr_studio",
              "stripe",
            ],
          });
        }

        break;
      }

      case "invoice.paid": {
        // Handles subscription renewals and also first subscription invoice if applicable.
        const invoice = event.data.object as Stripe.Invoice;

        const stripeCustomerId =
          typeof invoice.customer === "string" ? invoice.customer : null;
        if (!stripeCustomerId) break;

        const userId = await resolveUserIdFromCustomer(stripeCustomerId);
        if (!userId) break;

        const invoiceId = invoice.id;
        const paidAtIso = toIsoFromUnixSeconds(
          typeof invoice.status_transitions?.paid_at === "number"
            ? invoice.status_transitions.paid_at
            : null,
        );

        const currency =
          typeof invoice.currency === "string" ? invoice.currency : null;
        const amountPaid =
          typeof invoice.amount_paid === "number" ? invoice.amount_paid : null;

        // Expand invoice lines to access price ids
        const expanded = await stripe.invoices.retrieve(invoiceId, {
          expand: ["lines.data.price"],
        });

        // Aggregate amounts per (productKey, plan) from invoice lines
        const perKey = new Map<string, number>();
        const perKeyPlan = new Map<string, { productKey: ProductKey; plan: Plan }>();

        for (const line of expanded.lines.data) {
          const priceId = getInvoiceLinePriceId(line);
          if (!priceId) continue;

          const productKey = productKeyFromPriceId(priceId);
          const plan = planFromPriceId(priceId);
          if (!productKey || !plan) continue;

          // Only care about monthly items from invoices
          if (plan !== "monthly") continue;

          const key = `${productKey}__${plan}`;
          const amt = typeof line.amount === "number" ? line.amount : 0;
          perKey.set(key, (perKey.get(key) ?? 0) + amt);
          perKeyPlan.set(key, { productKey, plan });
        }

        const invoiceSubscriptionId = getInvoiceSubscriptionId(expanded);

        // Upsert entitlement(s) with canonical invoice paid fields
        for (const [k, cents] of perKey.entries()) {
          const meta = perKeyPlan.get(k);
          if (!meta) continue;

          await upsertEntitlement({
            userId,
            productKey: meta.productKey,
            plan: meta.plan,
            status: "active",
            stripeCustomerId,
            stripeSubscriptionId: invoiceSubscriptionId,
            stripePaymentIntentId: null,
            expiresAt: null,
            metadata: {
              source: "stripe",
              event: "invoice.paid",
              invoice_id: invoiceId,
            },

            // canonical paid fields (paid-only)
            amountCents: cents > 0 ? cents : null,
            currency,
            paidAtIso,
            stripeInvoiceId: invoiceId,
          });
        }

        // Single ledger entry for invoice paid amount (source-of-truth cash receipt)
        if (amountPaid && currency) {
          // Decide business line (usually invoice is single product family)
          let bl: "company" | "qr_studio" = "company";
          for (const v of perKeyPlan.values()) {
            bl = businessLineFromProductKey(v.productKey);
            break;
          }

          const effectiveDateIso = (paidAtIso ?? new Date().toISOString()).slice(
            0,
            10,
          );

          await ensureStripeLedgerEntry({
            bankAccountId: OPS_MAIN_BANK_ACCOUNT_ID,
            userId,
            businessLine: bl,
            effectiveDateIso,
            amountCents: amountPaid,
            currency,
            relatedId: invoiceId,
            notes: `stripe invoice paid: invoice=${invoiceId}`,
            tags: [
              "sales",
              bl === "company" ? "presence" : "qr_studio",
              "stripe",
              "invoice",
            ],
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

            // do NOT stamp paid fields here (this is not a payment event)
            amountCents: null,
            currency: null,
            paidAtIso: null,
            stripeInvoiceId: null,
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e: unknown) {
    console.error("Webhook handler failed (raw):", e);
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Webhook handler failed:", msg);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
