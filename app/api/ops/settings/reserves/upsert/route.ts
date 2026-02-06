// app/api/ops/settings/reserves/upsert/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";

type Body = {
  id: string | null;
  name: string;
  business_line: string;
  kind: string;
  percentage: number | null;
  fixed_amount: number | null;
  notes: string;
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

    if (!body.name?.trim()) {
      return new NextResponse("Name is required", { status: 400 });
    }
    if (!body.business_line?.trim()) {
      return new NextResponse("business_line is required", { status: 400 });
    }
    if (!body.kind?.trim()) {
      return new NextResponse("kind is required", { status: 400 });
    }

    const payload = {
      name: body.name.trim(),
      business_line: body.business_line,
      kind: body.kind,
      percentage: body.percentage,
      fixed_amount: body.fixed_amount,
      notes: body.notes ?? "",
      created_by: user.id,
    };

    if (body.id) {
      const upd = await admin
        .from("ops_reserve_buckets")
        .update(payload)
        .eq("id", body.id);

      if (upd.error) return new NextResponse(upd.error.message, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    const ins = await admin.from("ops_reserve_buckets").insert(payload);
    if (ins.error) return new NextResponse(ins.error.message, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : String(e);
    return new NextResponse(m, { status: 500 });
  }
}
