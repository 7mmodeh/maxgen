// app/api/qr/print-pack/download/route.ts
import { NextResponse } from "next/server";
import { requireUser, hasQrStudioAndPrintPack } from "@/src/lib/qr/entitlement";
import { getAssetById } from "@/src/lib/qr/print-pack";
import { supabaseServer } from "@/src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export async function GET(req: Request) {
  const { user } = await requireUser();
  if (!user) return bad("Unauthorized", 401);

  const entitled = await hasQrStudioAndPrintPack(user.id);
  if (!entitled) return bad("Forbidden", 403);

  const url = new URL(req.url);
  const assetId = String(url.searchParams.get("asset_id") ?? "").trim();
  const key = String(url.searchParams.get("key") ?? "").trim();

  if (!assetId) return bad("Missing asset_id");
  if (!key) return bad("Missing key");

  const row = await getAssetById({ assetId, userId: user.id });
  if (!row) return bad("Not found", 404);

  const files = isRecord(row.files) ? row.files : null;
  if (!files || !isRecord(files[key])) return bad("Invalid key", 400);

  const file = files[key] as Record<string, unknown>;
  const path = typeof file.path === "string" ? file.path : null;
  if (!path) return bad("Missing file path", 500);

  const sb = await supabaseServer();
  const { data, error } = await sb.storage.from("qr-print-pack").createSignedUrl(path, 60);

  if (error || !data?.signedUrl) {
    console.error("[print-pack download] signed url error:", error);
    return bad("Failed to create download URL", 500);
  }

  // Redirect to signed URL so the browser downloads it
  return NextResponse.redirect(data.signedUrl, 302);
}
