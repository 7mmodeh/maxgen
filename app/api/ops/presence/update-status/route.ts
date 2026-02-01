import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";

export const runtime = "nodejs";

const ALLOWED = new Set([
  "paid",
  "onboarding_received",
  "in_progress",
  "delivered",
  "canceled",
]);

type UserRole = "user" | "b2b_pending" | "b2b_approved" | "admin";

function isAdmin(role: unknown): role is "admin" {
  return role === "admin";
}

async function userFromBearer(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export async function POST(req: Request) {
  try {
    const user = await userFromBearer(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as { order_id?: string; status?: string };
    const orderId = body.order_id ?? null;
    const status = body.status ?? null;

    if (!orderId || !status || !ALLOWED.has(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { data: profile, error: pErr } = await getSupabaseAdmin()
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
      .returns<{ role: UserRole } | null>();

    if (pErr || !profile || !isAdmin(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error: updErr } = await getSupabaseAdmin()
      .from("presence_orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("ops update-status error:", msg);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
