// app/api/ops/settings/tax/upsert/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";

type Body = {
  business_line: string;
  vat_status: string;
  vat_filing_frequency: string;
  vat_effective_from: string | null;
  corp_tax_rate: number;
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

    if (!body.business_line?.trim()) {
      return new NextResponse("business_line is required", { status: 400 });
    }

    const payload = {
      business_line: body.business_line,
      vat_status: body.vat_status,
      vat_filing_frequency: body.vat_filing_frequency,
      vat_effective_from: body.vat_effective_from,
      corp_tax_rate: body.corp_tax_rate,
      notes: body.notes ?? "",
      updated_by: user.id,
    };

    const up = await admin
      .from("ops_tax_profile")
      .upsert(payload, { onConflict: "business_line" });

    if (up.error) return new NextResponse(up.error.message, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : String(e);
    return new NextResponse(m, { status: 500 });
  }
}
