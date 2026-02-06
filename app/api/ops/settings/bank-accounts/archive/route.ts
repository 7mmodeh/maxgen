// app/api/ops/settings/bank-accounts/archive/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";

type Body = {
  id: string;
  status: string;
};

function getBearer(req: Request): string | null {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
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

    const body = (await req.json()) as Body;
    if (!body.id?.trim()) return new NextResponse("id required", { status: 400 });
    if (!body.status?.trim())
      return new NextResponse("status required", { status: 400 });

    const upd = await admin
      .from("ops_bank_accounts")
      .update({ status: body.status })
      .eq("id", body.id);

    if (upd.error) return new NextResponse(upd.error.message, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : String(e);
    return new NextResponse(m, { status: 500 });
  }
}
