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

type SvgSize = {
  width: number;
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
  if (!/^https?:\/\//i.test(u)) return `https://${u}`;
  return u;
}

function makeSvgResponsive(svg: string): string {
  // Remove fixed pixel sizing to prevent layout overflow.
  // Keeps viewBox and makes it responsive in container.
  return svg
    .replace(/width="[^"]*"/g, "")
    .replace(/height="[^"]*"/g, "")
    .replace("<svg", '<svg preserveAspectRatio="xMidYMid meet"');
}

export async function generateQrSvg(
  project: QrProjectRow,
  opts?: { size?: SvgSize }
): Promise<string> {
  assertTemplate(project.template_id, project.template_version);

  const url = normalizeUrl(project.url);
  const width = opts?.size?.width ?? 1024;

  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 4, // quiet zone
    width,
  });

  return makeSvgResponsive(svg);
}

async function fetchLogoBytesFromPrivateBucket(logoPath: string): Promise<Buffer> {
  const sb = await supabaseServer();

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

  if (!t.allowLogo || !project.logo_path) return qrPng;

  const logoBytes = await fetchLogoBytesFromPrivateBucket(project.logo_path);

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

  const pad = Math.max(10, Math.floor(size * 0.014));
  const boxW = lw + pad * 2;
  const boxH = lh + pad * 2;

  const left = Math.floor((size - boxW) / 2);
  const top = Math.floor((size - boxH) / 2);

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

  return base
    .composite([
      { input: knockout, left, top },
      { input: logoPng, left: logoLeft, top: logoTop },
    ])
    .png()
    .toBuffer();
}
