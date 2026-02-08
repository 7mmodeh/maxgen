import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { supabaseServer } from "@/src/lib/supabase/server";
import { requireUser, hasQrPrintPackEntitlement } from "@/src/lib/qr/entitlement";
import { generateQrPng, type QrProjectRow } from "@/src/lib/qr/render";
import {
  coercePrintPackPayload,
  isPrintTemplateId,
  type PrintPackPayload,
  type PrintTemplateId,
} from "@/src/lib/qr/print-pack-v2";

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

function mmToPt(mm: number): number {
  return (mm * 72) / 25.4;
}

type TemplateSpec = {
  id: PrintTemplateId;
  widthPt: number;
  heightPt: number;
  bleedPt: number;
  safePt: number;
};

function templateSpec(id: PrintTemplateId): TemplateSpec {
  if (id === "card") {
    return {
      id,
      widthPt: mmToPt(85),
      heightPt: mmToPt(55),
      bleedPt: mmToPt(3),
      safePt: mmToPt(3.5),
    };
  }
  if (id === "flyer") {
    return {
      id,
      widthPt: mmToPt(148),
      heightPt: mmToPt(210),
      bleedPt: mmToPt(3),
      safePt: mmToPt(6),
    };
  }
  if (id === "poster") {
    return {
      id,
      widthPt: mmToPt(297),
      heightPt: mmToPt(420),
      bleedPt: mmToPt(3),
      safePt: mmToPt(10),
    };
  }
  return {
    id: "label",
    widthPt: mmToPt(50),
    heightPt: mmToPt(30),
    bleedPt: mmToPt(2),
    safePt: mmToPt(2.5),
  };
}

async function fetchLogoBytesFromPrivateBucket(logoPath: string): Promise<Uint8Array> {
  const sb = await supabaseServer();

  const { data, error } = await sb.storage.from("qr-logos").createSignedUrl(logoPath, 60);
  if (error || !data?.signedUrl) throw new Error("Failed to create signed logo URL");

  const res = await fetch(data.signedUrl);
  if (!res.ok) throw new Error("Failed to fetch logo bytes");

  const ab = await res.arrayBuffer();
  return new Uint8Array(ab);
}

function clampLine(s: string, max = 120): string {
  const t = s.trim();
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function buildLines(payload: PrintPackPayload): string[] {
  const lines: string[] = [];
  const bn = clampLine(payload.business_name, 80);
  const role = clampLine(payload.role, 60);
  const phone = clampLine(payload.phone, 60);
  const email = clampLine(payload.email, 80);
  const address = clampLine(payload.address, 120);
  const website = clampLine(payload.website, 80);
  const socials = clampLine(payload.socials, 120);

  if (bn) lines.push(bn);
  if (role) lines.push(role);
  if (phone) lines.push(phone);
  if (email) lines.push(email);
  if (website) lines.push(website);
  if (address) lines.push(address);
  if (socials) lines.push(socials);

  return lines;
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

  const { data: proj, error: projErr } = await sb
    .from("qr_projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (projErr) return bad("Failed to load project", 500);
  if (!proj || proj.user_id !== user.id) return bad("Not found", 404);

  const project = proj as QrProjectRow;

  const { data: pp, error: ppErr } = await sb
    .from("qr_print_pack_projects")
    .select("project_id,user_id,print_template_id,payload,print_logo_path")
    .eq("project_id", projectId)
    .maybeSingle();

  if (ppErr) return bad("Failed to load print pack", 500);

  const row = (pp as PrintPackRow | null) ?? null;

  const tId: PrintTemplateId =
    row && isPrintTemplateId(row.print_template_id) ? row.print_template_id : "card";

  const spec = templateSpec(tId);

  const payload = row ? coercePrintPackPayload(row.payload) : coercePrintPackPayload({});
  const lines = buildLines(payload);

  const qrPngBuf = await generateQrPng(project);

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([spec.widthPt, spec.heightPt]);

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const qrImg = await pdf.embedPng(qrPngBuf);

  let printLogo: { draw: (x: number, y: number, s: number) => void } | null = null;

  const logoPath = row?.print_logo_path ?? null;
  if (logoPath) {
    try {
      const bytes = await fetchLogoBytesFromPrivateBucket(logoPath);
      const img = await pdf.embedPng(bytes);
      printLogo = {
        draw: (x: number, y: number, s: number) => {
          page.drawImage(img, { x, y, width: s, height: s });
        },
      };
    } catch {
      printLogo = null;
    }
  }

  const safe = spec.safePt;
  const x0 = safe;
  const y0 = safe;
  const w0 = spec.widthPt - safe * 2;
  const h0 = spec.heightPt - safe * 2;

  const qrSize =
    tId === "label"
      ? Math.min(w0, h0) * 0.62
      : tId === "card"
        ? Math.min(w0, h0) * 0.62
        : tId === "flyer"
          ? Math.min(w0, h0) * 0.45
          : Math.min(w0, h0) * 0.38;

  const qrX = x0 + w0 - qrSize;
  const qrY = y0;

  page.drawImage(qrImg, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  if (printLogo) {
    const s = Math.min(qrSize * 0.28, w0 * 0.18);
    const lx = x0;
    const ly = y0 + h0 - s;
    printLogo.draw(lx, ly, s);
  }

  const textX = x0;
  const textYTop = y0 + h0;
  const textMaxW = Math.max(10, qrX - x0 - mmToPt(4));

  const baseSize = tId === "card" ? 9 : tId === "label" ? 8 : tId === "flyer" ? 12 : 14;
  const titleSize = tId === "card" ? 12 : tId === "label" ? 10 : tId === "flyer" ? 18 : 24;

  const title = clampLine(payload.business_name || project.business_name, 80);

  page.drawText(title, {
    x: textX,
    y: textYTop - titleSize,
    size: titleSize,
    font: fontBold,
    maxWidth: textMaxW,
  });

  let cursorY = textYTop - titleSize - mmToPt(5);

  const textLines = lines.filter((l) => l !== title);
  const lineGap = baseSize + (tId === "poster" ? 6 : 4);

  for (const l of textLines) {
    if (!l) continue;
    if (cursorY < y0) break;
    page.drawText(l, {
      x: textX,
      y: cursorY,
      size: baseSize,
      font,
      maxWidth: textMaxW,
    });
    cursorY -= lineGap;
  }

  const footer = "Generated by Maxgen QR Studio — Print Pack";
  const footerSize = tId === "poster" ? 10 : 7;
  page.drawText(footer, {
    x: x0,
    y: y0 - mmToPt(1),
    size: footerSize,
    font,
    maxWidth: w0,
  });

  const bytes = await pdf.save();

  // ✅ Fix TS env that rejects Uint8Array as BodyInit
  const out = Buffer.from(bytes);

  return new Response(out, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="print-pack-${projectId}-${tId}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
