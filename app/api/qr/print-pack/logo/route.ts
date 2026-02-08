import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabase/server";
import { requireUser, hasQrPrintPackEntitlement } from "@/src/lib/qr/entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function safeFileName(name: string): string {
  const base = name.trim().replace(/[^\w.\-]+/g, "_");
  return base.slice(0, 80) || "logo";
}

function redirectBack(req: Request, projectId: string, qs?: Record<string, string>) {
  const url = new URL(`/qr-studio/${projectId}/print-pack`, req.url);
  if (qs) {
    Object.entries(qs).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return NextResponse.redirect(url, 303);
}

export async function POST(req: Request) {
  const { user } = await requireUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url), 303);

  const entitledPrint = await hasQrPrintPackEntitlement(user.id);
  if (!entitledPrint) return NextResponse.redirect(new URL("/qr-studio", req.url), 303);

  const sb = await supabaseServer();
  const form = await req.formData();

  const file = form.get("file");
  const projectId = String(form.get("project_id") ?? "").trim();

  if (!projectId) return NextResponse.json({ error: "Missing project_id" }, { status: 400 });
  if (!(file instanceof File)) return redirectBack(req, projectId, { error: "upload_failed" });

  const maxBytes = 2 * 1024 * 1024;
  if (file.size > maxBytes) return redirectBack(req, projectId, { error: "too_large" });

  const contentType = file.type || "application/octet-stream";
  if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(contentType)) {
    return redirectBack(req, projectId, { error: "bad_type" });
  }

  // Ownership check
  const { data: proj, error: projErr } = await sb
    .from("qr_projects")
    .select("id,user_id")
    .eq("id", projectId)
    .maybeSingle();

  if (projErr || !proj) return redirectBack(req, projectId, { error: "not_found" });
  if (proj.user_id !== user.id) return redirectBack(req, projectId, { error: "forbidden" });

  const buf = Buffer.from(await file.arrayBuffer());
  const filename = safeFileName(file.name);
  const path = `logos/${user.id}/${projectId}/print/${filename}`;

  const { error: upErr } = await sb.storage
    .from("qr-logos")
    .upload(path, buf, { contentType, upsert: true, cacheControl: "3600" });

  if (upErr) {
    console.error("[print pack logo] upload error:", upErr);
    return redirectBack(req, projectId, { error: "storage_upload_failed" });
  }

  const { error: updErr } = await sb.from("qr_print_pack_projects").upsert(
    {
      project_id: projectId,
      user_id: user.id,
      print_template_id: "card",
      payload: {},
      print_logo_path: path,
    },
    { onConflict: "project_id" },
  );

  if (updErr) {
    console.error("[print pack logo] db upsert error:", updErr);
    return redirectBack(req, projectId, { error: "db_update_failed" });
  }

  return redirectBack(req, projectId, { saved: "ok" });
}
