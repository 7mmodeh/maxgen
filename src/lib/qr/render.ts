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

function escapeXml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function truncate(s: string, max: number): string {
  const v = s.trim();
  if (v.length <= max) return v;
  // simple, deterministic truncation
  return v.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
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
  const stroke = "#E5E7EB"; // neutral-200
  return `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" ry="${radius}" fill="#FFFFFF"/>
    <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${Math.max(
      0,
      radius - 0.5
    )}" ry="${Math.max(0, radius - 0.5)}" fill="none" stroke="${stroke}" stroke-width="1"/>
  </svg>
  `.trim();
}

async function makeRoundedLogo(logoBytes: Buffer, size: number, radius: number): Promise<Buffer> {
  const resized = await sharp(logoBytes)
    .resize(size, size, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
      withoutEnlargement: true,
    })
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

async function applyLogoBadgeToQr(qrPng: Buffer, logoBytes: Buffer, maxLogoRatio: number): Promise<Buffer> {
  const base = sharp(qrPng);
  const meta = await base.metadata();
  const size = meta.width ?? 1024;

  const logoMax = Math.floor(size * maxLogoRatio);

  const pad = Math.max(12, Math.floor(size * 0.018));
  const badgeSize = logoMax + pad * 2;

  const badgeRadius = Math.floor(badgeSize * 0.22);
  const logoRadius = Math.floor(logoMax * 0.18);

  const left = Math.floor((size - badgeSize) / 2);
  const top = Math.floor((size - badgeSize) / 2);

  const badgeSvg = Buffer.from(roundedBadgeSvg(badgeSize, badgeSize, badgeRadius));
  const badgePng = await sharp(badgeSvg).png().toBuffer();

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

/**
 * SVG output:
 * - v1: QR-only (clean SVG), responsive for previews.
 * - If you want T2 label text in SVG later, we can add it as a follow-on.
 */
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

/**
 * PNG output:
 * - T1: QR-only (1024)
 * - T2: QR + label zone (business name + tagline) within the SAME 1024x1024 canvas
 * - T3: QR-only (scan-max), no logo
 */
export async function generateQrPng(project: QrProjectRow): Promise<Buffer> {
  const t = assertTemplate(project.template_id, project.template_version);
  const url = normalizeUrl(project.url);

  // --- Template geometry (keeps output 1024x1024, per spec) ---
  const CANVAS = 1024;

  const isT2 = project.template_id === "T2";
  const wantsText = isT2 && t.allowText;

  // For T2, shrink QR slightly to create a label zone at the bottom
  const qrSize = wantsText ? 860 : CANVAS;
  const topPad = wantsText ? 52 : 0;
  const leftPad = Math.floor((CANVAS - qrSize) / 2);

  // Generate QR at chosen size
  let qrPng = await QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 4, // quiet zone enforced inside QR
    width: qrSize,
    scale: 1,
  });

  // Apply logo badge if allowed
  if (t.allowLogo && project.logo_path) {
    const logoBytes = await fetchLogoBytesFromPrivateBucket(project.logo_path);
    qrPng = await applyLogoBadgeToQr(qrPng, logoBytes, t.maxLogoRatio);
  }

  // If not T2 label template, return QR-only output (exact)
  if (!wantsText) {
    // If qrSize != 1024 (shouldn't happen), place on canvas; but here it's CANVAS.
    if (qrSize === CANVAS) return qrPng;
  }

  // Compose into a 1024x1024 white canvas
  let composed = sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  }).png();

  composed = composed.composite([{ input: qrPng, left: leftPad, top: topPad }]);

  // Render label text for T2 into bottom zone
  const name = truncate(project.business_name, t.businessNameMax);
  const tagline = project.tagline ? truncate(project.tagline, t.taglineMax) : "";

  const nameY = 930; // tuned for 1024 canvas
  const tagY = 972;

  const labelSvg = Buffer.from(
    `
    <svg width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}" xmlns="http://www.w3.org/2000/svg">
      <text x="512" y="${nameY}" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
            font-size="28" font-weight="700" fill="#0F172A">
        ${escapeXml(name)}
      </text>
      ${
        tagline
          ? `<text x="512" y="${tagY}" text-anchor="middle"
                 font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
                 font-size="18" font-weight="500" fill="#334155">
               ${escapeXml(tagline)}
             </text>`
          : ""
      }
    </svg>
    `.trim()
  );

  composed = composed.composite([{ input: labelSvg, left: 0, top: 0 }]);

  return composed.png().toBuffer();
}
