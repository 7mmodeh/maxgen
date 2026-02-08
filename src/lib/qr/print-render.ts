// src/lib/qr/print-render.ts
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFImage,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import sharp from "sharp";
import { supabaseServer } from "@/src/lib/supabase/server";
import { generateQrPng, type QrProjectRow } from "@/src/lib/qr/render";

export const PRINT_RENDER_VERSION = 2;

export type PrintPackFormat =
  | "business_card"
  | "flyer_a5"
  | "flyer_a4"
  | "poster_a3"
  | "sticker_sheet_a4";

export type PrintPackTheme = "dark" | "light";

export type PrintPackSpec = {
  project_id: string;
  formats: PrintPackFormat[];

  brand_name?: string;
  person_name?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;

  theme?: PrintPackTheme;
  accent?: "blue";
};

export type RenderedFile = {
  key: PrintPackFormat;
  filename: string;
  bytes: Buffer;
};

function mmToPt(mm: number): number {
  return (mm / 25.4) * 72;
}

function aSizePt(which: "A5" | "A4" | "A3"): [number, number] {
  if (which === "A5") return [mmToPt(148), mmToPt(210)];
  if (which === "A4") return [mmToPt(210), mmToPt(297)];
  return [mmToPt(297), mmToPt(420)];
}

function safeLine(v: string | undefined): string | null {
  const s = (v ?? "").trim();
  return s.length ? s : null;
}


function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}


type RgbTuple = readonly [number, number, number];

function rgbT(c: RgbTuple): RGB {
  return rgb(c[0], c[1], c[2]);
}

function mix(a: RgbTuple, b: RgbTuple, t: number): RgbTuple {
  const tt = clamp01(t);
  return [
    lerp(a[0], b[0], tt),
    lerp(a[1], b[1], tt),
    lerp(a[2], b[2], tt),
  ] as const;
}

function drawGradientBands(args: {
  page: PDFPage;
  x: number;
  y: number;
  w: number;
  h: number;
  from: RgbTuple;
  to: RgbTuple;
  steps?: number;
  vertical?: boolean;
  opacity?: number;
}) {
  const steps = Math.max(12, args.steps ?? 48);
  const vertical = args.vertical ?? true;
  const opacity = args.opacity;

  for (let i = 0; i < steps; i++) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    const c = rgbT(mix(args.from, args.to, (t0 + t1) / 2));

    if (vertical) {
      const bandH = args.h / steps;
      args.page.drawRectangle({
        x: args.x,
        y: args.y + i * bandH,
        width: args.w,
        height: bandH + 0.5,
        color: c,
        opacity,
      });
    } else {
      const bandW = args.w / steps;
      args.page.drawRectangle({
        x: args.x + i * bandW,
        y: args.y,
        width: bandW + 0.5,
        height: args.h,
        color: c,
        opacity,
      });
    }
  }
}

function roundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): string {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  const x0 = x;
  const y0 = y;
  const x1 = x + w;
  const y1 = y + h;

  // SVG path, absolute commands
  return [
    `M ${x0 + rr} ${y0}`,
    `L ${x1 - rr} ${y0}`,
    `Q ${x1} ${y0} ${x1} ${y0 + rr}`,
    `L ${x1} ${y1 - rr}`,
    `Q ${x1} ${y1} ${x1 - rr} ${y1}`,
    `L ${x0 + rr} ${y1}`,
    `Q ${x0} ${y1} ${x0} ${y1 - rr}`,
    `L ${x0} ${y0 + rr}`,
    `Q ${x0} ${y0} ${x0 + rr} ${y0}`,
    "Z",
  ].join(" ");
}

function drawRoundedPanel(args: {
  page: PDFPage;
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  fill: RGB;
  stroke?: RGB;
  strokeWidth?: number;
  opacity?: number;
}) {
  const d = roundedRectPath(args.x, args.y, args.w, args.h, args.r);
  args.page.drawSvgPath(d, {
    color: args.fill,
    opacity: args.opacity,
    borderColor: args.stroke,
    borderWidth: args.strokeWidth,
  });
}

function drawSoftShadow(args: {
  page: PDFPage;
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  layers?: number;
}) {
  const layers = Math.max(3, args.layers ?? 6);
  for (let i = 0; i < layers; i++) {
    const t = i / layers;
    const spread = lerp(2, 10, t);
    const op = lerp(0.18, 0.02, t);
    drawRoundedPanel({
      page: args.page,
      x: args.x - spread,
      y: args.y - spread,
      w: args.w + spread * 2,
      h: args.h + spread * 2,
      r: args.r + spread,
      fill: rgb(0, 0, 0),
      opacity: op,
    });
  }
}

async function fetchLogoBytes(logoPath: string): Promise<Buffer> {
  const sb = await supabaseServer();
  const { data, error } = await sb.storage
    .from("qr-logos")
    .createSignedUrl(logoPath, 60);
  if (error || !data?.signedUrl) throw new Error("Failed to sign logo URL");

  const res = await fetch(data.signedUrl);
  if (!res.ok) throw new Error("Failed to fetch logo bytes");
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function logoToPng(logoBytes: Buffer, targetPx: number): Promise<Buffer> {
  return sharp(logoBytes)
    .resize(targetPx, targetPx, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function embedLogoIfPresent(args: {
  doc: PDFDocument;
  project: QrProjectRow;
  targetPx: number;
}): Promise<PDFImage | null> {
  if (!args.project.logo_path) return null;
  try {
    const raw = await fetchLogoBytes(args.project.logo_path);
    const png = await logoToPng(raw, args.targetPx);
    return await args.doc.embedPng(png);
  } catch (e: unknown) {
    console.warn("[print-pack] logo embed failed:", e);
    return null;
  }
}

function premiumPalette(theme: PrintPackTheme) {
  // All QR sits on white panel for print/scanner safety.
  if (theme === "light") {
    return {
      bgFrom: [0.98, 0.985, 0.995] as const,
      bgTo: [0.93, 0.95, 0.99] as const,
      ink: rgb(0.06, 0.08, 0.11),
      muted: rgb(0.28, 0.33, 0.40),
      accent: rgb(0.145, 0.388, 0.922), // #2563EB-ish
      panel: rgb(1, 1, 1),
      panelStroke: rgb(0.86, 0.89, 0.94),
    };
  }

  return {
    bgFrom: [0.04, 0.06, 0.10] as const, // deep navy
    bgTo: [0.02, 0.04, 0.07] as const,
    ink: rgb(1, 1, 1),
    muted: rgb(0.88, 0.91, 0.96),
    accent: rgb(0.145, 0.388, 0.922),
    panel: rgb(1, 1, 1),
    panelStroke: rgb(0.82, 0.86, 0.92),
  };
}

function linesFromSpec(spec: PrintPackSpec, project: QrProjectRow): string[] {
  const out: string[] = [];

  const person = safeLine(spec.person_name);
  const title = safeLine(spec.title);
  if (person && title) out.push(`${person} — ${title}`);
  else if (person) out.push(person);
  else if (title) out.push(title);

  const phone = safeLine(spec.phone);
  const email = safeLine(spec.email);
  if (phone) out.push(phone);
  if (email) out.push(email);

  const website = safeLine(spec.website) ?? project.url;
  if (website) out.push(website);

  const address = safeLine(spec.address);
  if (address) out.push(address);

  return out.slice(0, 6);
}

function trimForMax(v: string, max: number): string {
  const s = v.trim();
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1))}…`;
}

async function renderBusinessCard(
  spec: PrintPackSpec,
  project: QrProjectRow
): Promise<Buffer> {
  const theme = spec.theme ?? "dark";
  const pal = premiumPalette(theme);

  // EU business card: 85 x 55 mm
  const w = mmToPt(85);
  const h = mmToPt(55);

  const qrPng = await generateQrPng(project, { width: 2800 });

  const doc = await PDFDocument.create();
  const page = doc.addPage([w, h]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Premium gradient base
  drawGradientBands({
    page,
    x: 0,
    y: 0,
    w,
    h,
    from: pal.bgFrom,
    to: pal.bgTo,
    steps: 64,
    vertical: false,
  });

  // subtle diagonal lines (premium texture)
  const lines = 14;
  for (let i = 0; i < lines; i++) {
    const t = i / (lines - 1);
    const x0 = -w * 0.2 + t * (w * 1.4);
    page.drawLine({
      start: { x: x0, y: 0 },
      end: { x: x0 + w * 0.45, y: h },
      thickness: 0.6,
      color: rgb(1, 1, 1),
      opacity: theme === "dark" ? 0.06 : 0.03,
    });
  }

  // QR panel (rounded + shadow)
  const panelPad = 6;
  const panelW = w * 0.40;
  const panelX = w - panelW - panelPad;
  const panelY = panelPad;
  const panelH = h - panelPad * 2;

  drawSoftShadow({
    page,
    x: panelX,
    y: panelY,
    w: panelW,
    h: panelH,
    r: 10,
    layers: 7,
  });

  drawRoundedPanel({
    page,
    x: panelX,
    y: panelY,
    w: panelW,
    h: panelH,
    r: 10,
    fill: pal.panel,
    stroke: pal.panelStroke,
    strokeWidth: 1,
  });

  // Accent pill + micro label
  const pillX = 8;
  const pillY = h - 14;
  drawRoundedPanel({
    page,
    x: pillX,
    y: pillY,
    w: 34,
    h: 8,
    r: 4,
    fill: pal.accent,
    opacity: 0.9,
  });
  page.drawText("PREMIUM", {
    x: pillX + 6,
    y: pillY + 2.2,
    size: 5.2,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  const brand = safeLine(spec.brand_name) ?? project.business_name;
  const brandText = trimForMax(brand, 30);

  // Brand + info left
  page.drawText(brandText, {
    x: 10,
    y: h - 26,
    size: 10.5,
    font: fontBold,
    color: pal.ink,
    maxWidth: panelX - 16,
  });

  const info = linesFromSpec(spec, project);
  let y = h - 38;
  for (const line of info) {
    page.drawText(trimForMax(line, 44), {
      x: 10,
      y,
      size: 7.2,
      font,
      color: pal.muted,
      maxWidth: panelX - 16,
    });
    y -= 9.2;
    if (y < 10) break;
  }

  // Logo (optional) — bottom-left, small
  const logoImg = await embedLogoIfPresent({
    doc,
    project,
    targetPx: 520,
  });

  if (logoImg) {
    const logoSize = 22;
    page.drawImage(logoImg, {
      x: 10,
      y: 8.5,
      width: logoSize,
      height: logoSize,
    });
  }

  // QR image on panel
  const qrImg = await doc.embedPng(qrPng);
  const qrSize = Math.min(panelW - 16, panelH - 18);
  const qx = panelX + (panelW - qrSize) / 2;
  const qy = panelY + (panelH - qrSize) / 2;

  page.drawImage(qrImg, { x: qx, y: qy, width: qrSize, height: qrSize });

  // tiny URL under QR
  const url = trimForMax(project.url, 26);
  page.drawText(url, {
    x: panelX + 8,
    y: panelY + 7,
    size: 6.2,
    font,
    color: rgb(0.18, 0.22, 0.28),
    maxWidth: panelW - 16,
  });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function renderFlyer(
  spec: PrintPackSpec,
  project: QrProjectRow,
  which: "A5" | "A4"
): Promise<Buffer> {
  const theme = spec.theme ?? "dark";
  const pal = premiumPalette(theme);

  const [w, h] = aSizePt(which);
  const qrPng = await generateQrPng(project, { width: 3600 });

  const doc = await PDFDocument.create();
  const page = doc.addPage([w, h]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // gradient background
  drawGradientBands({
    page,
    x: 0,
    y: 0,
    w,
    h,
    from: pal.bgFrom,
    to: pal.bgTo,
    steps: 80,
    vertical: true,
  });

  // Top accent bar
  page.drawRectangle({
    x: 0,
    y: h - 10,
    width: w,
    height: 10,
    color: pal.accent,
    opacity: 0.95,
  });

  // Premium header area
  const headerPadX = 42;
  const headerY = h - 84;

  const brand = safeLine(spec.brand_name) ?? project.business_name;
  page.drawText(trimForMax(brand, 46), {
    x: headerPadX,
    y: headerY + 28,
    size: which === "A5" ? 20 : 26,
    font: fontBold,
    color: pal.ink,
    maxWidth: w - headerPadX * 2,
  });

  const subtitle =
    safeLine(spec.title) ?? safeLine(project.tagline ?? undefined) ?? "Scan to connect";
  page.drawText(trimForMax(subtitle, 64), {
    x: headerPadX,
    y: headerY + 10,
    size: which === "A5" ? 10 : 12,
    font,
    color: pal.muted,
    maxWidth: w - headerPadX * 2,
  });

  // Card-like main panel
  const panelPad = 42;
  const panelX = panelPad;
  const panelY = 48;
  const panelW = w - panelPad * 2;
  const panelH = h - 150;

  drawSoftShadow({
    page,
    x: panelX,
    y: panelY,
    w: panelW,
    h: panelH,
    r: 16,
    layers: 8,
  });

  drawRoundedPanel({
    page,
    x: panelX,
    y: panelY,
    w: panelW,
    h: panelH,
    r: 16,
    fill: pal.panel,
    stroke: pal.panelStroke,
    strokeWidth: 1,
  });

  // QR framed area inside panel
  const qrImg = await doc.embedPng(qrPng);
  const qrBoxSize = Math.min(panelW * 0.58, panelH * 0.60);
  const qrBoxX = panelX + (panelW - qrBoxSize) / 2;
  const qrBoxY = panelY + panelH * 0.34;

  drawRoundedPanel({
    page,
    x: qrBoxX - 10,
    y: qrBoxY - 10,
    w: qrBoxSize + 20,
    h: qrBoxSize + 20,
    r: 14,
    fill: rgb(0.97, 0.98, 0.99),
    stroke: rgb(0.88, 0.90, 0.94),
    strokeWidth: 1,
  });

  page.drawImage(qrImg, {
    x: qrBoxX,
    y: qrBoxY,
    width: qrBoxSize,
    height: qrBoxSize,
  });

  // Info block (bottom)
  const info = linesFromSpec(spec, project);
  const infoX = panelX + 30;
  let infoY = panelY + 34;

  for (const line of info) {
    page.drawText(trimForMax(line, 88), {
      x: infoX,
      y: infoY,
      size: which === "A5" ? 10 : 11,
      font,
      color: rgb(0.22, 0.26, 0.32),
      maxWidth: panelW - 60,
    });
    infoY += which === "A5" ? 14 : 15;
  }

  // CTA line
  page.drawText("Scan the QR to open the page instantly.", {
    x: panelX + 30,
    y: panelY + panelH - 30,
    size: which === "A5" ? 9 : 10,
    font,
    color: rgb(0.35, 0.40, 0.48),
    maxWidth: panelW - 60,
  });

  // Logo (optional) top-right
  const logoImg = await embedLogoIfPresent({
    doc,
    project,
    targetPx: 900,
  });

  if (logoImg) {
    const size = which === "A5" ? 44 : 56;
    page.drawImage(logoImg, {
      x: w - headerPadX - size,
      y: h - 78,
      width: size,
      height: size,
    });
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function renderPosterA3(
  spec: PrintPackSpec,
  project: QrProjectRow
): Promise<Buffer> {
  const theme = spec.theme ?? "dark";
  const pal = premiumPalette(theme);

  const [w, h] = aSizePt("A3");
  const qrPng = await generateQrPng(project, { width: 4200 });

  const doc = await PDFDocument.create();
  const page = doc.addPage([w, h]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // cinematic gradient + vignette
  drawGradientBands({
    page,
    x: 0,
    y: 0,
    w,
    h,
    from: pal.bgFrom,
    to: pal.bgTo,
    steps: 100,
    vertical: true,
  });

  // vignette bands
  drawGradientBands({
    page,
    x: 0,
    y: 0,
    w,
    h,
    from: [0, 0, 0] as const,
    to: [0, 0, 0] as const,
    steps: 70,
    vertical: true,
    opacity: theme === "dark" ? 0.06 : 0.035,
  });

  // top accent
  page.drawRectangle({
    x: 0,
    y: h - 14,
    width: w,
    height: 14,
    color: pal.accent,
    opacity: 0.95,
  });

  const brand = safeLine(spec.brand_name) ?? project.business_name;
  page.drawText(trimForMax(brand, 56), {
    x: 62,
    y: h - 110,
    size: 42,
    font: fontBold,
    color: pal.ink,
    maxWidth: w - 124,
  });

  const tagline =
    safeLine(project.tagline ?? undefined) ??
    safeLine(spec.title) ??
    "Scan to connect";
  page.drawText(trimForMax(tagline, 96), {
    x: 62,
    y: h - 150,
    size: 16,
    font,
    color: pal.muted,
    maxWidth: w - 124,
  });

  // main panel
  const panelX = 62;
  const panelY = 72;
  const panelW = w - 124;
  const panelH = h - 260;

  drawSoftShadow({
    page,
    x: panelX,
    y: panelY,
    w: panelW,
    h: panelH,
    r: 22,
    layers: 9,
  });

  drawRoundedPanel({
    page,
    x: panelX,
    y: panelY,
    w: panelW,
    h: panelH,
    r: 22,
    fill: pal.panel,
    stroke: pal.panelStroke,
    strokeWidth: 1,
  });

  const qrImg = await doc.embedPng(qrPng);

  // QR centered, big
  const qrSize = Math.min(panelW * 0.62, panelH * 0.62);
  const qx = panelX + (panelW - qrSize) / 2;
  const qy = panelY + (panelH - qrSize) / 2 + 40;

  drawRoundedPanel({
    page,
    x: qx - 16,
    y: qy - 16,
    w: qrSize + 32,
    h: qrSize + 32,
    r: 22,
    fill: rgb(0.975, 0.985, 0.995),
    stroke: rgb(0.86, 0.89, 0.94),
    strokeWidth: 1,
  });

  page.drawImage(qrImg, { x: qx, y: qy, width: qrSize, height: qrSize });

  // info footer in panel
  const info = linesFromSpec(spec, project);
  const infoX = panelX + 44;
  let infoY = panelY + 36;

  for (const line of info) {
    page.drawText(trimForMax(line, 110), {
      x: infoX,
      y: infoY,
      size: 14,
      font,
      color: rgb(0.22, 0.26, 0.32),
      maxWidth: panelW - 88,
    });
    infoY += 19;
  }

  // logo (optional) near header right
  const logoImg = await embedLogoIfPresent({
    doc,
    project,
    targetPx: 1400,
  });

  if (logoImg) {
    const size = 72;
    page.drawImage(logoImg, {
      x: w - 62 - size,
      y: h - 160,
      width: size,
      height: size,
    });
  }

  // bottom URL outside panel
  page.drawText(trimForMax(project.url, 60), {
    x: 62,
    y: 34,
    size: 12,
    font,
    color: pal.muted,
    maxWidth: w - 124,
  });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function renderStickerSheetA4(
  spec: PrintPackSpec,
  project: QrProjectRow
): Promise<Buffer> {
  // labels: keep clean and print-friendly, but with premium badge + better spacing
  const theme: PrintPackTheme = "light";
  const pal = premiumPalette(theme);

  const [w, h] = aSizePt("A4");
  const qrPng = await generateQrPng(project, { width: 2200 });

  const doc = await PDFDocument.create();
  const page = doc.addPage([w, h]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // soft paper tone
  drawGradientBands({
    page,
    x: 0,
    y: 0,
    w,
    h,
    from: pal.bgFrom,
    to: pal.bgTo,
    steps: 60,
    vertical: true,
  });

  // header badge
  drawRoundedPanel({
    page,
    x: 28,
    y: h - 42,
    w: 150,
    h: 22,
    r: 8,
    fill: pal.accent,
    opacity: 0.95,
  });
  page.drawText("PRINT PACK LABELS", {
    x: 28 + 12,
    y: h - 35,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  const brand = safeLine(spec.brand_name) ?? project.business_name;

  const margin = 28;
  const cols = 3;
  const rows = 7;
  const gap = 10;

  const usableH = h - 60; // leave space for header
  const cellW = (w - margin * 2 - gap * (cols - 1)) / cols;
  const cellH = (usableH - margin * 2 - gap * (rows - 1)) / rows;

  const qrSize = Math.min(cellW, cellH) * 0.66;

  const qrImg = await doc.embedPng(qrPng);

  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const x = margin + col * (cellW + gap);
      const y = usableH - margin - (r + 1) * cellH - r * gap;

      // premium sticker tile
      drawRoundedPanel({
        page,
        x,
        y,
        w: cellW,
        h: cellH,
        r: 10,
        fill: rgb(1, 1, 1),
        stroke: rgb(0.86, 0.89, 0.94),
        strokeWidth: 1,
      });

      // QR centered
      const qx = x + (cellW - qrSize) / 2;
      const qy = y + (cellH - qrSize) / 2 + 6;
      page.drawImage(qrImg, { x: qx, y: qy, width: qrSize, height: qrSize });

      // brand label
      const label = brand.length > 22 ? `${brand.slice(0, 22)}…` : brand;
      page.drawText(label, {
        x: x + 10,
        y: y + 10,
        size: 8.2,
        font: fontBold,
        color: rgb(0.10, 0.12, 0.15),
        maxWidth: cellW - 20,
      });

      // tiny url
      const url = project.url.length > 30 ? `${project.url.slice(0, 30)}…` : project.url;
      page.drawText(url, {
        x: x + 10,
        y: y + 21,
        size: 6.6,
        font,
        color: rgb(0.35, 0.40, 0.48),
        maxWidth: cellW - 20,
      });
    }
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

export async function renderPrintPackPdfs(
  project: QrProjectRow,
  spec: PrintPackSpec
): Promise<RenderedFile[]> {
  const formats = Array.from(new Set(spec.formats ?? []));

  const out: RenderedFile[] = [];
  for (const f of formats) {
    if (f === "business_card") {
      out.push({
        key: f,
        filename: `printpack-v${PRINT_RENDER_VERSION}-business-card-${project.id}.pdf`,
        bytes: await renderBusinessCard(spec, project),
      });
    } else if (f === "flyer_a5") {
      out.push({
        key: f,
        filename: `printpack-v${PRINT_RENDER_VERSION}-flyer-a5-${project.id}.pdf`,
        bytes: await renderFlyer(spec, project, "A5"),
      });
    } else if (f === "flyer_a4") {
      out.push({
        key: f,
        filename: `printpack-v${PRINT_RENDER_VERSION}-flyer-a4-${project.id}.pdf`,
        bytes: await renderFlyer(spec, project, "A4"),
      });
    } else if (f === "poster_a3") {
      out.push({
        key: f,
        filename: `printpack-v${PRINT_RENDER_VERSION}-poster-a3-${project.id}.pdf`,
        bytes: await renderPosterA3(spec, project),
      });
    } else if (f === "sticker_sheet_a4") {
      out.push({
        key: f,
        filename: `printpack-v${PRINT_RENDER_VERSION}-labels-a4-${project.id}.pdf`,
        bytes: await renderStickerSheetA4(spec, project),
      });
    }
  }

  return out;
}
