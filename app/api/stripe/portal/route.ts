import { NextResponse } from "next/server";
import { stripe } from "@/src/lib/stripe";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";

export const runtime = "nodejs";

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

  const { error: insErr } = await getSupabaseAdmin()
    .from("stripe_customers")
    .insert({
      user_id: userId,
      stripe_customer_id: customer.id,
    });

  if (insErr) throw insErr;

  return customer.id;
}

export async function POST(req: Request) {
  try {
    const user = await userFromBearer(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = await getOrCreateStripeCustomer(user.id, user.email);

    const baseUrl = siteUrl();
    const returnUrl = `${baseUrl}/qr-studio/dashboard`;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: unknown) {
    console.error("portal error (raw):", e);
    const msg = e instanceof Error ? e.message : String(e);
    console.error("portal error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
