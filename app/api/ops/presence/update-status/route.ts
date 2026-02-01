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

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { order_id?: unknown; status?: unknown };

    const orderId =
      typeof body.order_id === "string" ? body.order_id.trim() : "";
    const status = typeof body.status === "string" ? body.status.trim() : "";

    if (!orderId || !isUuid(orderId) || !status || !ALLOWED.has(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const profileRes = await getSupabaseAdmin()
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const profile = profileRes.data as { role: UserRole } | null;

    if (profileRes.error || !profile || !isAdmin(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updRes = await getSupabaseAdmin()
      .from("presence_orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (updRes.error) {
      return NextResponse.json({ error: updRes.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("ops update-status error:", msg);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
