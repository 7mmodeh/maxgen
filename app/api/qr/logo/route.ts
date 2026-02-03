// app/api/qr/logo/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabase/server";
import { requireUser } from "@/src/lib/qr/entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function safeFileName(name: string): string {
  const base = name.trim().replace(/[^\w.\-]+/g, "_");
  return base.slice(0, 80) || "logo";
}

function redirectBack(req: Request, projectId: string, qs?: Record<string, string>) {
  const url = new URL(`/qr-studio/${projectId}`, req.url);
  if (qs) {
    Object.entries(qs).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return NextResponse.redirect(url, 303);
}

export async function POST(req: Request) {
  const { user } = await requireUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url), 303);

  const sb = await supabaseServer();
  const form = await req.formData();

  const file = form.get("file");
  const projectId = String(form.get("project_id") ?? "").trim();

  if (!projectId) return NextResponse.json({ error: "Missing project_id" }, { status: 400 });
  if (!(file instanceof File)) return redirectBack(req, projectId, { upload: "error", reason: "missing_file" });

  const maxBytes = 2 * 1024 * 1024; // 2MB
  if (file.size > maxBytes) return redirectBack(req, projectId, { upload: "error", reason: "too_large" });

  const contentType = file.type || "application/octet-stream";
  if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(contentType)) {
    return redirectBack(req, projectId, { upload: "error", reason: "bad_type" });
  }

  const { data: proj, error: projErr } = await sb
    .from("qr_projects")
    .select("id,user_id,template_id")
    .eq("id", projectId)
    .maybeSingle();

  if (projErr || !proj) return redirectBack(req, projectId, { upload: "error", reason: "not_found" });
  if (proj.user_id !== user.id) return redirectBack(req, projectId, { upload: "error", reason: "forbidden" });

  if (proj.template_id === "T3") {
    return redirectBack(req, projectId, { upload: "error", reason: "template_disallows_logo" });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const filename = safeFileName(file.name);
  const path = `logos/${user.id}/${projectId}/${filename}`;

  const { error: upErr } = await sb.storage
    .from("qr-logos")
    .upload(path, buf, { contentType, upsert: true, cacheControl: "3600" });

  if (upErr) {
    console.error("[qr logo upload] upload error:", upErr);
    return redirectBack(req, projectId, { upload: "error", reason: "storage_upload_failed" });
  }

  const { error: updErr } = await sb.from("qr_projects").update({ logo_path: path }).eq("id", projectId);
  if (updErr) {
    console.error("[qr logo upload] update error:", updErr);
    return redirectBack(req, projectId, { upload: "error", reason: "db_update_failed" });
  }

  return redirectBack(req, projectId, { upload: "ok" });
}
