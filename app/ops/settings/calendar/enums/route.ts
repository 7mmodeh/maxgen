import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";

type RpcResult = {
  business_lines?: unknown;
  frequencies?: unknown;
  statuses?: unknown;
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

    // Requires: public.ops_calendar_enums()
    const rpc = await admin.rpc("ops_calendar_enums");
    if (rpc.error) return new NextResponse(rpc.error.message, { status: 400 });

    const payload = (rpc.data ?? {}) as RpcResult;

    return NextResponse.json({
      business_lines: Array.isArray(payload.business_lines)
        ? payload.business_lines
        : [],
      frequencies: Array.isArray(payload.frequencies) ? payload.frequencies : [],
      statuses: Array.isArray(payload.statuses) ? payload.statuses : [],
    });
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : String(e);
    return new NextResponse(m, { status: 500 });
  }
}
