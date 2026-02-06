// app/api/ops/settings/bank-accounts/create/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";

type Body = {
  name: string;
  currency: string;
  opening_balance_amount: number;
  opening_balance_date: string; // YYYY-MM-DD
};

function getBearer(req: Request): string | null {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

async function isSuperAdmin(admin: ReturnType<typeof getSupabaseAdmin>, userId: string): Promise<boolean> {
  // Preferred: function exists (RPC)
  const rpc = await admin.rpc("is_ops_super_admin");
  if (!rpc.error && typeof rpc.data === "boolean") return rpc.data;

  // Fallback: table exists
  const t = await admin
    .from("ops_super_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  return !!t.data && !t.error;
}

export async function POST(req: Request) {
  try {
    const admin = getSupabaseAdmin();
    const token = getBearer(req);
    if (!token) return new NextResponse("Missing bearer token", { status: 401 });

    const userRes = await admin.auth.getUser(token);
    const user = userRes.data.user;
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const roleRes = await admin
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const role = (roleRes.data as { role?: string } | null)?.role ?? null;
    if (role !== "admin") return new NextResponse("Forbidden", { status: 403 });

    const okSuper = await isSuperAdmin(admin, user.id);
    if (!okSuper) {
      return new NextResponse("Super-admin required", { status: 403 });
    }

    const body = (await req.json()) as Body;

    if (!body.name?.trim()) return new NextResponse("Name required", { status: 400 });
    if (!body.currency?.trim())
      return new NextResponse("Currency required", { status: 400 });
    if (!body.opening_balance_date?.trim())
      return new NextResponse("Opening balance date required", { status: 400 });

    const ins = await admin.from("ops_bank_accounts").insert({
      name: body.name.trim(),
      currency: body.currency.trim(),
      status: "active",
      opening_balance_amount: body.opening_balance_amount,
      opening_balance_date: body.opening_balance_date,
      created_by: user.id,
    });

    if (ins.error) return new NextResponse(ins.error.message, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : String(e);
    return new NextResponse(m, { status: 500 });
  }
}
