// src/lib/qr/print-render.ts
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFPage,
  type PDFFont,
} from "pdf-lib";
import sharp from "sharp";
import { supabaseServer } from "@/src/lib/supabase/server";
import { generateQrPng, type QrProjectRow } from "@/src/lib/qr/render";

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

type ThemeColors = {
  bg0: { r: number; g: number; b: number };
  bg1: { r: number; g: number; b: number };
  accent: { r: number; g: number; b: number };

  text: ReturnType<typeof rgb>;
  muted: ReturnType<typeof rgb>;

  plate: ReturnType<typeof rgb>;
  plateBorder: ReturnType<typeof rgb>;

  panel: ReturnType<typeof rgb>;
  panelBorder: ReturnType<typeof rgb>;

  inkOnPlate: ReturnType<typeof rgb>;
  mutedOnPlate: ReturnType<typeof rgb>;
};

function mmToPt(mm: number): number {
  return (mm / 25.4) * 72;
}

function aSizePt(which: "A5" | "A4" | "A3"): [number, number] {
  if (which === "A5") return [mmToPt(148), mmToPt(210)];
  if (which === "A4") return [mmToPt(210), mmToPt(297)];
  return [mmToPt(297), mmToPt(420)];
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function safeLine(v: string | undefined): string | null {
  const s = (v ?? "").trim();
  return s.length ? s : null;
}

function normalizeWebsite(v: string): string {
  const s = v.trim();
  if (!s) return s;
  return s.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

function themeColors(theme: PrintPackTheme): ThemeColors {
  const accent = { r: 37, g: 99, b: 235 }; // ~ #2563EB

  if (theme === "dark") {
    return {
      bg0: { r: 10, g: 14, b: 26 },
      bg1: { r: 11, g: 18, b: 32 },
      accent,

      text: rgb(1, 1, 1),
      muted: rgb(0.78, 0.82, 0.9),

      plate: rgb(1, 1, 1),
      plateBorder: rgb(0.86, 0.88, 0.92),

      panel: rgb(0.07, 0.1, 0.16),
      panelBorder: rgb(0.18, 0.22, 0.32),

      inkOnPlate: rgb(0.06, 0.08, 0.12),
      mutedOnPlate: rgb(0.25, 0.3, 0.38),
    };
  }

  return {
    bg0: { r: 248, g: 250, b: 252 },
    bg1: { r: 241, g: 245, b: 249 },
    accent,

    text: rgb(0.06, 0.08, 0.12),
    muted: rgb(0.25, 0.3, 0.38),

    plate: rgb(1, 1, 1),
    plateBorder: rgb(0.86, 0.88, 0.92),

    panel: rgb(1, 1, 1),
    panelBorder: rgb(0.85, 0.87, 0.9),

    inkOnPlate: rgb(0.06, 0.08, 0.12),
    mutedOnPlate: rgb(0.25, 0.3, 0.38),
  };
}

async function createPremiumBackgroundPng(args: {
  widthPt: number;
  heightPt: number;
  theme: PrintPackTheme;
  dpi?: number;
}): Promise<Buffer> {
  const dpi = args.dpi ?? 150;
  const widthPx = Math.max(64, Math.round((args.widthPt / 72) * dpi));
  const heightPx = Math.max(64, Math.round((args.heightPt / 72) * dpi));

  const c = themeColors(args.theme);
  const buf = Buffer.alloc(widthPx * heightPx * 4);

  for (let y = 0; y < heightPx; y++) {
    for (let x = 0; x < widthPx; x++) {
      const tY = y / Math.max(1, heightPx - 1);
      const tX = x / Math.max(1, widthPx - 1);
      const t = clamp(0.75 * tY + 0.25 * tX, 0, 1);

      const baseR = Math.round(c.bg0.r + (c.bg1.r - c.bg0.r) * t);
      const baseG = Math.round(c.bg0.g + (c.bg1.g - c.bg0.g) * t);
      const baseB = Math.round(c.bg0.b + (c.bg1.b - c.bg0.b) * t);

      const n = Math.floor((Math.random() - 0.5) * 10); // [-5..+5]
      const r = clamp(baseR + n, 0, 255);
      const g = clamp(baseG + n, 0, 255);
      const b = clamp(baseB + n, 0, 255);

      const i = (y * widthPx + x) * 4;
      buf[i] = r;
      buf[i + 1] = g;
      buf[i + 2] = b;
      buf[i + 3] = 255;
    }
  }

  return sharp(buf, { raw: { width: widthPx, height: heightPx, channels: 4 } })
    .blur(0.3)
    .png()
    .toBuffer();
}

function measureWidth(font: PDFFont, text: string, size: number): number {
  return font.widthOfTextAtSize(text, size);
}

function fitSingleLineText(args: {
  font: PDFFont;
  text: string;
  size: number;
  maxWidth: number;
  minSize?: number;
}): { text: string; size: number } {
  const minSize = args.minSize ?? Math.max(6, args.size - 6);
  const clean = args.text.trim();

  for (let s = args.size; s >= minSize; s -= 0.5) {
    if (measureWidth(args.font, clean, s) <= args.maxWidth) {
      return { text: clean, size: s };
    }
  }

  const ell = "…";
  if (measureWidth(args.font, clean, minSize) <= args.maxWidth) {
    return { text: clean, size: minSize };
  }

  let lo = 0;
  let hi = clean.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const candidate = clean.slice(0, mid) + ell;
    if (measureWidth(args.font, candidate, minSize) <= args.maxWidth) lo = mid;
    else hi = mid - 1;
  }

  return { text: clean.slice(0, Math.max(0, lo)) + ell, size: minSize };
}

function linesFromSpec(spec: PrintPackSpec, project: QrProjectRow): string[] {
  const out: string[] = [];

  const person = safeLine(spec.person_name);
  const title = safeLine(spec.title);
  if (person && title) out.push(`${person} · ${title}`);
  else if (person) out.push(person);
  else if (title) out.push(title);

  const phone = safeLine(spec.phone);
  const email = safeLine(spec.email);
  if (phone) out.push(phone);
  if (email) out.push(email);

  const websiteRaw = safeLine(spec.website) ?? project.url;
  const website = websiteRaw ? normalizeWebsite(websiteRaw) : null;
  if (website) out.push(website);

  const address = safeLine(spec.address);
  if (address) out.push(address);

  return out.slice(0, 6);
}

async function fetchLogoBytes(logoPath: string): Promise<Buffer> {
  const sb = await supabaseServer();
  const { data, error } = await sb.storage
    .from("qr-logos")
    .createSignedUrl(logoPath, 60);

  if (error || !data?.signedUrl) throw new Error("Failed to create signed logo URL");

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

async function drawPremiumBackground(doc: PDFDocument, page: PDFPage, theme: PrintPackTheme): Promise<void> {
  const w = page.getWidth();
  const h = page.getHeight();

  const png = await createPremiumBackgroundPng({ widthPt: w, heightPt: h, theme, dpi: 150 });
  const img = await doc.embedPng(png);

  page.drawImage(img, { x: 0, y: 0, width: w, height: h });
}

function drawAccentLine(page: PDFPage, args: { x: number; y: number; w: number; h: number; c: ThemeColors }): void {
  page.drawRectangle({
    x: args.x,
    y: args.y,
    width: args.w,
    height: args.h,
    color: rgb(args.c.accent.r / 255, args.c.accent.g / 255, args.c.accent.b / 255),
  });
}

function drawPlate(page: PDFPage, args: { x: number; y: number; w: number; h: number; c: ThemeColors; borderWidth?: number }): void {
  page.drawRectangle({
    x: args.x,
    y: args.y,
    width: args.w,
    height: args.h,
    color: args.c.plate,
    borderColor: args.c.plateBorder,
    borderWidth: args.borderWidth ?? 1,
  });
}

function drawPanel(page: PDFPage, args: { x: number; y: number; w: number; h: number; c: ThemeColors; borderWidth?: number }): void {
  page.drawRectangle({
    x: args.x,
    y: args.y,
    width: args.w,
    height: args.h,
    color: args.c.panel,
    borderColor: args.c.panelBorder,
    borderWidth: args.borderWidth ?? 1,
  });
}

async function renderBusinessCard(spec: PrintPackSpec, project: QrProjectRow): Promise<Buffer> {
  const theme = spec.theme ?? "dark";
  const c = themeColors(theme);

  const w = mmToPt(85);
  const h = mmToPt(55);

  const qrPng = await generateQrPng(project, { width: 2400 });

  const doc = await PDFDocument.create();
  const page = doc.addPage([w, h]);

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  await drawPremiumBackground(doc, page, theme);

  const outerPad = 6;
  drawPanel(page, {
    x: outerPad,
    y: outerPad,
    w: w - outerPad * 2,
    h: h - outerPad * 2,
    c,
    borderWidth: 1,
  });

  drawAccentLine(page, {
    x: outerPad,
    y: h - outerPad - 2.2,
    w: w - outerPad * 2,
    h: 2.2,
    c,
  });

  const brand = safeLine(spec.brand_name) ?? project.business_name;
  const info = linesFromSpec(spec, project);

  const leftX = outerPad + 10;
  const leftW = w * 0.56;
  const rightX = outerPad + leftW + 8;
  const rightW = w - rightX - outerPad - 10;

  const platePad = 6;
  const plateSize = Math.min(rightW, h - outerPad * 2 - 16);
  const plateX = rightX + (rightW - plateSize) / 2;
  const plateY = outerPad + (h - outerPad * 2 - plateSize) / 2;

  drawPlate(page, { x: plateX, y: plateY, w: plateSize, h: plateSize, c, borderWidth: 1 });

  const qrImg = await doc.embedPng(qrPng);
  const qrSize = plateSize - platePad * 2;
  page.drawImage(qrImg, { x: plateX + platePad, y: plateY + platePad, width: qrSize, height: qrSize });

  if (project.logo_path) {
    try {
      const raw = await fetchLogoBytes(project.logo_path);
      const png = await logoToPng(raw, 520);
      const img = await doc.embedPng(png);

      const s = 18;
      const px = leftX;
      const py = outerPad + 10;

      drawPlate(page, { x: px - 2, y: py - 2, w: s + 4, h: s + 4, c, borderWidth: 1 });
      page.drawImage(img, { x: px, y: py, width: s, height: s });
    } catch (e: unknown) {
      console.warn("[print-pack] logo embed failed:", e);
    }
  }

  const brandFit = fitSingleLineText({
    font: fontBold,
    text: brand,
    size: 11,
    maxWidth: leftW - 6,
    minSize: 8,
  });

  page.drawText(brandFit.text, {
    x: leftX,
    y: h - outerPad - 18,
    size: brandFit.size,
    font: fontBold,
    color: c.text,
    maxWidth: leftW - 6,
  });

  let y = h - outerPad - 32;
  for (const line of info) {
    const fit = fitSingleLineText({
      font,
      text: line,
      size: 7.6,
      maxWidth: leftW - 6,
      minSize: 6.2,
    });

    page.drawText(fit.text, {
      x: leftX,
      y,
      size: fit.size,
      font,
      color: c.muted,
      maxWidth: leftW - 6,
    });

    y -= 9;
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function renderFlyer(spec: PrintPackSpec, project: QrProjectRow, which: "A5" | "A4"): Promise<Buffer> {
  const theme = spec.theme ?? "dark";
  const c = themeColors(theme);

  const [w, h] = aSizePt(which);
  const qrPng = await generateQrPng(project, { width: which === "A5" ? 3200 : 3600 });

  const doc = await PDFDocument.create();
  const page = doc.addPage([w, h]);

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  await drawPremiumBackground(doc, page, theme);

  const margin = which === "A5" ? 28 : 36;
  const headerH = which === "A5" ? 78 : 92;

  drawPanel(page, {
    x: margin,
    y: h - margin - headerH,
    w: w - margin * 2,
    h: headerH,
    c,
    borderWidth: 1,
  });

  drawAccentLine(page, { x: margin, y: h - margin - 3, w: w - margin * 2, h: 3, c });

  const brand = safeLine(spec.brand_name) ?? project.business_name;

  const brandFit = fitSingleLineText({
    font: fontBold,
    text: brand,
    size: which === "A5" ? 22 : 28,
    maxWidth: w - margin * 2 - 80,
    minSize: which === "A5" ? 16 : 18,
  });

  page.drawText(brandFit.text, {
    x: margin + 18,
    y: h - margin - (which === "A5" ? 38 : 44),
    size: brandFit.size,
    font: fontBold,
    color: c.text,
    maxWidth: w - margin * 2 - 80,
  });

  const subtitle =
    safeLine(spec.title) ??
    safeLine(project.tagline ?? undefined) ??
    "Scan the code to connect instantly";

  const subFit = fitSingleLineText({
    font,
    text: subtitle,
    size: which === "A5" ? 11 : 12,
    maxWidth: w - margin * 2 - 80,
    minSize: 9,
  });

  page.drawText(subFit.text, {
    x: margin + 18,
    y: h - margin - (which === "A5" ? 60 : 68),
    size: subFit.size,
    font,
    color: c.muted,
    maxWidth: w - margin * 2 - 80,
  });

  if (project.logo_path) {
    try {
      const raw = await fetchLogoBytes(project.logo_path);
      const png = await logoToPng(raw, 900);
      const img = await doc.embedPng(png);

      const s = which === "A5" ? 42 : 52;
      const px = w - margin - 18 - s;
      const py = h - margin - 18 - s;

      drawPlate(page, { x: px - 4, y: py - 4, w: s + 8, h: s + 8, c, borderWidth: 1 });
      page.drawImage(img, { x: px, y: py, width: s, height: s });
    } catch (e: unknown) {
      console.warn("[print-pack] logo embed failed:", e);
    }
  }

  const contentY = margin;
  const contentTop = h - margin - headerH - 18;
  const contentH = contentTop - contentY;

  drawPanel(page, {
    x: margin,
    y: contentY,
    w: w - margin * 2,
    h: contentH,
    c,
    borderWidth: 1,
  });

  const qrImg = await doc.embedPng(qrPng);

  const panelW = w - margin * 2;
  const panelH = contentH;

  const qrPlateSize = Math.min(panelW * 0.58, panelH * 0.62);
  const plateX = margin + (panelW - qrPlateSize) / 2;
  const plateY = contentY + (panelH - qrPlateSize) / 2 + (which === "A5" ? 18 : 26);

  drawPlate(page, { x: plateX, y: plateY, w: qrPlateSize, h: qrPlateSize, c, borderWidth: 1 });

  const qrPad = qrPlateSize * 0.06;
  const qrSize = qrPlateSize - qrPad * 2;
  page.drawImage(qrImg, { x: plateX + qrPad, y: plateY + qrPad, width: qrSize, height: qrSize });

  const cta = "Scan to open your page";
  const ctaFit = fitSingleLineText({
    font: fontBold,
    text: cta,
    size: which === "A5" ? 12 : 13,
    maxWidth: panelW - 60,
    minSize: 10,
  });

  page.drawText(ctaFit.text, {
    x: margin + (panelW - measureWidth(fontBold, ctaFit.text, ctaFit.size)) / 2,
    y: plateY - (which === "A5" ? 20 : 22),
    size: ctaFit.size,
    font: fontBold,
    color: c.text,
  });

  const info = linesFromSpec(spec, project);
  const bottomPad = which === "A5" ? 18 : 22;
  let y = contentY + bottomPad;

  for (const line of info) {
    const fit = fitSingleLineText({
      font,
      text: line,
      size: which === "A5" ? 10.5 : 11,
      maxWidth: panelW - 48,
      minSize: 9,
    });

    page.drawText(fit.text, {
      x: margin + 24,
      y,
      size: fit.size,
      font,
      color: c.muted,
      maxWidth: panelW - 48,
    });

    y += which === "A5" ? 14 : 15;
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function renderPosterA3(spec: PrintPackSpec, project: QrProjectRow): Promise<Buffer> {
  const theme = spec.theme ?? "dark";
  const c = themeColors(theme);

  const [w, h] = aSizePt("A3");
  const qrPng = await generateQrPng(project, { width: 4200 });

  const doc = await PDFDocument.create();
  const page = doc.addPage([w, h]);

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  await drawPremiumBackground(doc, page, theme);

  const margin = 56;

  const headerH = 140;
  drawPanel(page, {
    x: margin,
    y: h - margin - headerH,
    w: w - margin * 2,
    h: headerH,
    c,
    borderWidth: 1,
  });

  drawAccentLine(page, { x: margin, y: h - margin - 4, w: w - margin * 2, h: 4, c });

  const brand = safeLine(spec.brand_name) ?? project.business_name;
  const brandFit = fitSingleLineText({
    font: fontBold,
    text: brand,
    size: 46,
    maxWidth: w - margin * 2 - 120,
    minSize: 28,
  });

  page.drawText(brandFit.text, {
    x: margin + 26,
    y: h - margin - 66,
    size: brandFit.size,
    font: fontBold,
    color: c.text,
    maxWidth: w - margin * 2 - 120,
  });

  const tagline =
    safeLine(spec.title) ??
    safeLine(project.tagline ?? undefined) ??
    "Scan to connect instantly";

  const tagFit = fitSingleLineText({
    font,
    text: tagline,
    size: 18,
    maxWidth: w - margin * 2 - 120,
    minSize: 12,
  });

  page.drawText(tagFit.text, {
    x: margin + 26,
    y: h - margin - 98,
    size: tagFit.size,
    font,
    color: c.muted,
    maxWidth: w - margin * 2 - 120,
  });

  if (project.logo_path) {
    try {
      const raw = await fetchLogoBytes(project.logo_path);
      const png = await logoToPng(raw, 1200);
      const img = await doc.embedPng(png);

      const s = 78;
      const px = w - margin - 26 - s;
      const py = h - margin - 26 - s;

      drawPlate(page, { x: px - 6, y: py - 6, w: s + 12, h: s + 12, c, borderWidth: 1 });
      page.drawImage(img, { x: px, y: py, width: s, height: s });
    } catch (e: unknown) {
      console.warn("[print-pack] logo embed failed:", e);
    }
  }

  const panelY = margin;
  const panelTop = h - margin - headerH - 26;
  const panelH = panelTop - panelY;

  drawPanel(page, { x: margin, y: panelY, w: w - margin * 2, h: panelH, c, borderWidth: 1 });

  const qrImg = await doc.embedPng(qrPng);

  const qrPlateSize = Math.min((w - margin * 2) * 0.64, panelH * 0.68);
  const plateX = margin + ((w - margin * 2) - qrPlateSize) / 2;
  const plateY = panelY + (panelH - qrPlateSize) / 2 + 48;

  drawPlate(page, { x: plateX, y: plateY, w: qrPlateSize, h: qrPlateSize, c, borderWidth: 1 });

  const qrPad = qrPlateSize * 0.06;
  const qrSize = qrPlateSize - qrPad * 2;
  page.drawImage(qrImg, { x: plateX + qrPad, y: plateY + qrPad, width: qrSize, height: qrSize });

  const cta = "Scan to open the link";
  const ctaFit = fitSingleLineText({
    font: fontBold,
    text: cta,
    size: 18,
    maxWidth: w - margin * 2 - 100,
    minSize: 14,
  });

  page.drawText(ctaFit.text, {
    x: margin + ((w - margin * 2) - measureWidth(fontBold, ctaFit.text, ctaFit.size)) / 2,
    y: plateY - 30,
    size: ctaFit.size,
    font: fontBold,
    color: c.text,
  });

  const info = linesFromSpec(spec, project);
  let y = panelY + 36;
  for (const line of info) {
    const fit = fitSingleLineText({
      font,
      text: line,
      size: 15,
      maxWidth: w - margin * 2 - 80,
      minSize: 12,
    });

    page.drawText(fit.text, {
      x: margin + 40,
      y,
      size: fit.size,
      font,
      color: c.muted,
      maxWidth: w - margin * 2 - 80,
    });

    y += 20;
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function renderStickerSheetA4(spec: PrintPackSpec, project: QrProjectRow): Promise<Buffer> {
  // Keep white sheet for print practicality, but each sticker “premium”
  const [w, h] = aSizePt("A4");
  const qrPng = await generateQrPng(project, { width: 2000 });

  const doc = await PDFDocument.create();
  const page = doc.addPage([w, h]);

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({ x: 0, y: 0, width: w, height: h, color: rgb(1, 1, 1) });

  const brand = safeLine(spec.brand_name) ?? project.business_name;
  const website = normalizeWebsite(project.url);

  const margin = 28;
  const cols = 3;
  const rows = 7;
  const gap = 10;

  const cellW = (w - margin * 2 - gap * (cols - 1)) / cols;
  const cellH = (h - margin * 2 - gap * (rows - 1)) / rows;

  const qrImg = await doc.embedPng(qrPng);

  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const x = margin + col * (cellW + gap);
      const y = h - margin - (r + 1) * cellH - r * gap;

      page.drawRectangle({
        x,
        y,
        width: cellW,
        height: cellH,
        borderWidth: 0.6,
        borderColor: rgb(0.85, 0.87, 0.9),
      });

      const innerPad = 6;
      const bx = x + innerPad;
      const by = y + innerPad;
      const bw = cellW - innerPad * 2;
      const bh = cellH - innerPad * 2;

      const labelPanel = rgb(0.06, 0.08, 0.12);
      page.drawRectangle({
        x: bx,
        y: by,
        width: bw,
        height: bh,
        color: labelPanel,
        borderWidth: 1,
        borderColor: rgb(0.2, 0.25, 0.32),
      });

      const acc = rgb(37 / 255, 99 / 255, 235 / 255);
      page.drawRectangle({ x: bx, y: by + bh - 2, width: bw, height: 2, color: acc });

      const qrPlateSize = Math.min(bw * 0.72, bh * 0.66);
      const px = bx + (bw - qrPlateSize) / 2;
      const py = by + (bh - qrPlateSize) / 2 + 6;

      page.drawRectangle({
        x: px,
        y: py,
        width: qrPlateSize,
        height: qrPlateSize,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.86, 0.88, 0.92),
        borderWidth: 1,
      });

      const pad = qrPlateSize * 0.07;
      const qs = qrPlateSize - pad * 2;
      page.drawImage(qrImg, { x: px + pad, y: py + pad, width: qs, height: qs });

      const brandFit = fitSingleLineText({
        font: fontBold,
        text: brand,
        size: 8.2,
        maxWidth: bw - 10,
        minSize: 6.6,
      });

      page.drawText(brandFit.text, {
        x: bx + 6,
        y: by + 10,
        size: brandFit.size,
        font: fontBold,
        color: rgb(1, 1, 1),
        maxWidth: bw - 12,
      });

      const webFit = fitSingleLineText({
        font,
        text: website,
        size: 6.7,
        maxWidth: bw - 10,
        minSize: 5.8,
      });

      page.drawText(webFit.text, {
        x: bx + 6,
        y: by + 20,
        size: webFit.size,
        font,
        color: rgb(0.78, 0.82, 0.9),
        maxWidth: bw - 12,
      });
    }
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

export async function renderPrintPackPdfs(project: QrProjectRow, spec: PrintPackSpec): Promise<RenderedFile[]> {
  const formats = Array.from(new Set(spec.formats ?? []));
  const out: RenderedFile[] = [];

  for (const f of formats) {
    if (f === "business_card") {
      out.push({
        key: f,
        filename: `printpack-business-card-${project.id}.pdf`,
        bytes: await renderBusinessCard(spec, project),
      });
    } else if (f === "flyer_a5") {
      out.push({
        key: f,
        filename: `printpack-flyer-a5-${project.id}.pdf`,
        bytes: await renderFlyer(spec, project, "A5"),
      });
    } else if (f === "flyer_a4") {
      out.push({
        key: f,
        filename: `printpack-flyer-a4-${project.id}.pdf`,
        bytes: await renderFlyer(spec, project, "A4"),
      });
    } else if (f === "poster_a3") {
      out.push({
        key: f,
        filename: `printpack-poster-a3-${project.id}.pdf`,
        bytes: await renderPosterA3(spec, project),
      });
    } else if (f === "sticker_sheet_a4") {
      out.push({
        key: f,
        filename: `printpack-stickers-a4-${project.id}.pdf`,
        bytes: await renderStickerSheetA4(spec, project),
      });
    }
  }

  return out;
}
