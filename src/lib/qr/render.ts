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

type SvgSize = { width: number };

function assertTemplate(templateId: string, templateVersion: number) {
  if (templateVersion !== 1) throw new Error(`Unsupported template_version: ${templateVersion}`);
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
    margin: 4,
    width,
  });

  return makeSvgResponsive(svg);
}

async function fetchLogoBytesFromPrivateBucket(logoPath: string): Promise<Buffer> {
  const sb = await supabaseServer();

  const { data, error } = await sb.storage.from("qr-logos").createSignedUrl(logoPath, 60);
  if (error || !data?.signedUrl) throw new Error("Failed to create signed logo URL");

  const res = await fetch(data.signedUrl);
  if (!res.ok) throw new Error("Failed to fetch logo bytes");
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

function roundedBadgeSvg(w: number, h: number, radius: number): string {
  // Flat, scanner-safe badge: white fill + subtle border (no shadow).
  const stroke = "#E5E7EB"; // neutral-200
  return `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" ry="${radius}" fill="#FFFFFF"/>
    <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${Math.max(0, radius - 0.5)}" ry="${Math.max(
      0,
      radius - 0.5
    )}" fill="none" stroke="${stroke}" stroke-width="1"/>
  </svg>
  `.trim();
}

async function makeRoundedLogo(logoBytes: Buffer, size: number, radius: number): Promise<Buffer> {
  const resized = await sharp(logoBytes)
    .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  const maskSvg = Buffer.from(
    `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/>
    </svg>
    `.trim()
  );

  return sharp(resized)
    .composite([{ input: maskSvg, blend: "dest-in" }])
    .png()
    .toBuffer();
}

export async function generateQrPng(
  project: QrProjectRow,
  opts?: { width?: number }
): Promise<Buffer> {
  const t = assertTemplate(project.template_id, project.template_version);
  const url = normalizeUrl(project.url);

  const width = opts?.width ?? 1024;

  const qrPng = await QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 4, // quiet zone enforced
    width,
    scale: 1,
  });

  // No logo allowed (T3) or not provided
  if (!t.allowLogo || !project.logo_path) return qrPng;

  const logoBytes = await fetchLogoBytesFromPrivateBucket(project.logo_path);

  const base = sharp(qrPng);
  const meta = await base.metadata();
  const size = meta.width ?? width;

  // Your rule: logo area limited by maxLogoRatio (<= 22%)
  const logoMax = Math.floor(size * t.maxLogoRatio);

  // Badge padding (kept conservative for scan safety)
  const pad = Math.max(12, Math.floor(size * 0.018));
  const badgeSize = logoMax + pad * 2;

  // Rounded corners: “Revolut-like” badge feel
  const badgeRadius = Math.floor(badgeSize * 0.22);
  const logoRadius = Math.floor(logoMax * 0.18);

  // Center positioning
  const left = Math.floor((size - badgeSize) / 2);
  const top = Math.floor((size - badgeSize) / 2);

  // Build badge image (white rounded rect + subtle border)
  const badgeSvg = Buffer.from(roundedBadgeSvg(badgeSize, badgeSize, badgeRadius));
  const badgePng = await sharp(badgeSvg).png().toBuffer();

  // Rounded logo clipped
  const roundedLogo = await makeRoundedLogo(logoBytes, logoMax, logoRadius);

  const logoLeft = left + pad;
  const logoTop = top + pad;

  return base
    .composite([
      { input: badgePng, left, top },
      { input: roundedLogo, left: logoLeft, top: logoTop },
    ])
    .png()
    .toBuffer();
}
