// app/api/qr/print-pack/generate/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabase/server";
import { requireUser, hasQrPrintPackEntitlement } from "@/src/lib/qr/entitlement";
import type { QrProjectRow } from "@/src/lib/qr/render";
import {
  coercePrintPackPayload,
  isPrintTemplateId,
  type PrintTemplateId,
} from "@/src/lib/qr/print-pack-v2";
import {
  renderPrintPackPdfs,
  type PrintPackSpec,
  type PrintPackFormat,
} from "@/src/lib/qr/print-render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type PrintPackRow = {
  project_id: string;
  user_id: string;
  print_template_id: string;
  payload: unknown;
  print_logo_path: string | null;
};

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

function formatFromTemplateId(id: PrintTemplateId): PrintPackFormat {
  if (id === "card") return "business_card";
  if (id === "flyer") return "flyer_a5";
  if (id === "poster") return "poster_a3";
  // "label"
  return "sticker_sheet_a4";
}

function buildSpec(args: {
  projectId: string;
  format: PrintPackFormat;
  payload: ReturnType<typeof coercePrintPackPayload>;
  project: QrProjectRow;
}): PrintPackSpec {
  const bn = (args.payload.business_name || args.project.business_name).trim();
  const website = (args.payload.website || args.project.url).trim();

  return {
    project_id: args.projectId,
    formats: [args.format],

    brand_name: bn,
    title: args.payload.role.trim() || undefined,
    phone: args.payload.phone.trim() || undefined,
    email: args.payload.email.trim() || undefined,
    website,
    address: args.payload.address.trim() || undefined,

    // keep locked + premium default
    theme: "dark",
    accent: "blue",
  };
}

export async function GET(req: Request) {
  const { user } = await requireUser();
  if (!user) return bad("Unauthorized", 401);

  const entitledPrint = await hasQrPrintPackEntitlement(user.id);
  if (!entitledPrint) return bad("Forbidden", 403);

  const url = new URL(req.url);
  const projectId = String(url.searchParams.get("project_id") ?? "").trim();
  if (!projectId) return bad("Missing project_id", 400);

  const sb = await supabaseServer();

  // project
  const { data: proj, error: projErr } = await sb
    .from("qr_projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (projErr) return bad("Failed to load project", 500);
  if (!proj || proj.user_id !== user.id) return bad("Not found", 404);

  const project = proj as QrProjectRow;

  // saved print-pack settings (template + payload)
  const { data: pp, error: ppErr } = await sb
    .from("qr_print_pack_projects")
    .select("project_id,user_id,print_template_id,payload,print_logo_path")
    .eq("project_id", projectId)
    .maybeSingle();

  if (ppErr) return bad("Failed to load print pack", 500);

  const row = (pp as PrintPackRow | null) ?? null;
  const templateId: PrintTemplateId =
    row && isPrintTemplateId(row.print_template_id) ? row.print_template_id : "card";

  const payload = row ? coercePrintPackPayload(row.payload) : coercePrintPackPayload({});
  const format = formatFromTemplateId(templateId);

  const spec = buildSpec({ projectId, format, payload, project });

  const rendered = await renderPrintPackPdfs(project, spec);
  const first = rendered[0];

  if (!first) return bad("No output generated", 500);

  const body = new Uint8Array(first.bytes);

return new Response(body, {
  status: 200,
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${first.filename}"`,
    "Cache-Control": "no-store",
  },
});
}
