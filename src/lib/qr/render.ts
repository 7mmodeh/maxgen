// src/lib/qr/render.ts
import QRCode from "qrcode";
import sharp from "sharp";
import { supabaseServer } from "@/src/lib/supabase/server";
import { TEMPLATES_V1, type TemplateId } from "@/src/lib/qr/templates";

export type QrProjectRow = {
  id: string;
  user_id: string;
  business_name: string;
  tagline: string | null;
  url: string;
  template_id: string;
  template_version: number;
  logo_path: string | null;
};

function assertTemplate(templateId: string, templateVersion: number) {
  if (templateVersion !== 1) {
    throw new Error(`Unsupported template_version: ${templateVersion}`);
  }
  const t = TEMPLATES_V1[templateId as TemplateId];
  if (!t) throw new Error(`Unsupported template_id: ${templateId}`);
  return t;
}

function normalizeUrl(input: string): string {
  const u = input.trim();
  // Conservative normalization: if no scheme, add https://
  if (!/^https?:\/\//i.test(u)) return `https://${u}`;
  return u;
}

export async function generateQrSvg(project: QrProjectRow): Promise<string> {
  const t = assertTemplate(project.template_id, project.template_version);

  const url = normalizeUrl(project.url);

  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 4, // quiet zone
    width: 1024,
  });

  // For v1, keep SVG “clean”: no logo embed here (SVG logo embed can be added later).
  // Preview stays scanner-safe and deterministic.
  // (PNG path handles logo overlay.)
  if (!t.allowText) return svg;

  // For T2, we still return just the QR SVG (UI shows text below via HTML, not inside SVG),
  // which keeps the QR module area pure and scan-safe.
  return svg;
}

async function fetchLogoBytesFromPrivateBucket(logoPath: string): Promise<Buffer> {
  const sb = await supabaseServer();

  // Signed URL so server can fetch logo bytes safely (bucket is private).
  const { data, error } = await sb.storage
    .from("qr-logos")
    .createSignedUrl(logoPath, 60);

  if (error || !data?.signedUrl) {
    throw new Error("Failed to create signed logo URL");
  }

  const res = await fetch(data.signedUrl);
  if (!res.ok) throw new Error("Failed to fetch logo bytes");

  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

export async function generateQrPng(project: QrProjectRow): Promise<Buffer> {
  const t = assertTemplate(project.template_id, project.template_version);

  const url = normalizeUrl(project.url);

  const qrPng = await QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 4, // quiet zone
    width: 1024,
    scale: 1,
  });

  // No logo allowed or none provided
  if (!t.allowLogo || !project.logo_path) return qrPng;

  const logoBytes = await fetchLogoBytesFromPrivateBucket(project.logo_path);

  // Compose:
  // - Resize logo to <= 22% of QR width
  // - Add white “knockout” padding behind logo for scan reliability
  const base = sharp(qrPng);
  const meta = await base.metadata();

  const size = meta.width ?? 1024;
  const logoMax = Math.floor(size * t.maxLogoRatio);

  const logo = sharp(logoBytes).resize(logoMax, logoMax, {
    fit: "inside",
    withoutEnlargement: true,
  });

  const logoPng = await logo.png().toBuffer();
  const logoMeta = await sharp(logoPng).metadata();

  const lw = logoMeta.width ?? logoMax;
  const lh = logoMeta.height ?? logoMax;

  // White knockout box slightly larger than the logo
  const pad = Math.max(8, Math.floor(size * 0.012)); // ~1.2% of size, min 8px
  const boxW = lw + pad * 2;
  const boxH = lh + pad * 2;

  const left = Math.floor((size - boxW) / 2);
  const top = Math.floor((size - boxH) / 2);

  // Create white rectangle overlay
  const knockout = await sharp({
    create: {
      width: boxW,
      height: boxH,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  const logoLeft = left + pad + Math.floor((boxW - pad * 2 - lw) / 2);
  const logoTop = top + pad + Math.floor((boxH - pad * 2 - lh) / 2);

  const out = await base
    .composite([
      { input: knockout, left, top },
      { input: logoPng, left: logoLeft, top: logoTop },
    ])
    .png()
    .toBuffer();

  return out;
}
