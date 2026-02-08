// src/lib/qr/print-render.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
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

function mmToPt(mm: number): number {
  // 1 inch = 25.4mm; 1pt = 1/72 inch
  return (mm / 25.4) * 72;
}

function aSizePt(which: "A5" | "A4" | "A3"): [number, number] {
  // ISO A sizes in mm
  if (which === "A5") return [mmToPt(148), mmToPt(210)];
  if (which === "A4") return [mmToPt(210), mmToPt(297)];
  return [mmToPt(297), mmToPt(420)]; // A3
}

function safeLine(v: string | undefined): string | null {
  const s = (v ?? "").trim();
  return s.length ? s : null;
}

async function fetchLogoBytes(logoPath: string): Promise<Buffer> {
  const sb = await supabaseServer();
  const { data, error } = await sb.storage.from("qr-logos").createSignedUrl(logoPath, 60);
  if (error || !data?.signedUrl) throw new Error("Failed to create signed logo URL");

  const res = await fetch(data.signedUrl);
  if (!res.ok) throw new Error("Failed to fetch logo bytes");
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function logoToPng(logoBytes: Buffer, targetPx: number): Promise<Buffer> {
  // normalize any image into PNG for pdf-lib embedding
  return sharp(logoBytes)
    .resize(targetPx, targetPx, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();
}

function themeColors(theme: PrintPackTheme) {
  // keep it scanner-safe: QR always sits on white panel
  if (theme === "dark") {
    return {
      bg: rgb(0.043, 0.071, 0.125), // ~ #0B1220
      panel: rgb(1, 1, 1),
      text: rgb(1, 1, 1),
      muted: rgb(1, 1, 1),
      line: rgb(0.2, 0.39, 0.92), // blue accent-ish
      panelText: rgb(0.05, 0.07, 0.1),
      panelMuted: rgb(0.2, 0.25, 0.32),
    };
  }

  // light
  return {
    bg: rgb(1, 1, 1),
    panel: rgb(1, 1, 1),
    text: rgb(0.05, 0.07, 0.1),
    muted: rgb(0.25, 0.3, 0.38),
    line: rgb(0.2, 0.39, 0.92),
    panelText: rgb(0.05, 0.07, 0.1),
    panelMuted: rgb(0.25, 0.3, 0.38),
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

async function renderBusinessCard(spec: PrintPackSpec, project: QrProjectRow): Promise<Buffer> {
  const theme = spec.theme ?? "dark";
  const c = themeColors(theme);

  // EU business card: 85 x 55 mm, landscape
  const w = mmToPt(85);
  const h = mmToPt(55);

  // QR: high-res raster to ensure ultra sharp print.
  // 2400px QR is heavy but gives very crisp edges even on small placement.
  const qrPng = await generateQrPng(project, { width: 2400 });

  const doc = await PDFDocument.create();
  const page = doc.addPage([w, h]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // background
  page.drawRectangle({ x: 0, y: 0, width: w, height: h, color: c.bg });

  // right white QR panel
  const panelW = w * 0.42;
  page.drawRectangle({ x: w - panelW, y: 0, width: panelW, height: h, color: c.panel });

  // accent line
  page.drawRectangle({ x: 0, y: h - 3, width: w, height: 3, color: c.line });

  const brand = safeLine(spec.brand_name) ?? project.business_name;

  // brand left
  page.drawText(brand, {
    x: 10,
    y: h - 18,
    size: 10,
    font: fontBold,
    color: c.text,
    maxWidth: w - panelW - 18,
  });

  const info = linesFromSpec(spec, project);
  let y = h - 34;
  for (const line of info) {
    page.drawText(line, {
      x: 10,
      y,
      size: 7.3,
      font,
      color: c.muted,
      maxWidth: w - panelW - 18,
    });
    y -= 9;
  }

  // optional logo (top-left), small and premium
  if (project.logo_path) {
    try {
      const raw = await fetchLogoBytes(project.logo_path);
      const png = await logoToPng(raw, 420);
      const img = await doc.embedPng(png);

      const logoSize = 22; // points
      const lx = 10;
      const ly = 10;
      // place bottom-left area
      page.drawImage(img, { x: lx, y: ly, width: logoSize, height: logoSize });
    } catch (e) {
      console.warn("[print-pack] logo embed failed:", e);
    }
  }

  // QR image in panel
  const qrImg = await doc.embedPng(qrPng);
  const qrSize = Math.min(panelW - 14, h - 14);
  const qx = w - panelW + (panelW - qrSize) / 2;
  const qy = (h - qrSize) / 2;
  page.drawImage(qrImg, { x: qx, y: qy, width: qrSize, height: qrSize });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function renderFlyer(spec: PrintPackSpec, project: QrProjectRow, which: "A5" | "A4"): Promise<Buffer> {
  const theme = spec.theme ?? "dark";
  const c = themeColors(theme);

  const [w, h] = aSizePt(which);

  const qrPng = await generateQrPng(project, { width: 3000 });

  const doc = await PDFDocument.create();
  const page = doc.addPage([w, h]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({ x: 0, y: 0, width: w, height: h, color: c.bg });

  // header band
  page.drawRectangle({ x: 0, y: h - 60, width: w, height: 60, color: c.bg });
  page.drawRectangle({ x: 0, y: h - 6, width: w, height: 6, color: c.line });

  const brand = safeLine(spec.brand_name) ?? project.business_name;
  page.drawText(brand, { x: 28, y: h - 36, size: 20, font: fontBold, color: c.text, maxWidth: w - 56 });

  const subtitle = safeLine(spec.title) ?? "Scan to connect";
  page.drawText(subtitle, { x: 28, y: h - 54, size: 10, font, color: c.muted, maxWidth: w - 56 });

  // QR panel
  const panelPad = 28;
  const panelW = w - panelPad * 2;
  const panelH = h - 140 - panelPad;
  page.drawRectangle({
    x: panelPad,
    y: panelPad + 60,
    width: panelW,
    height: panelH,
    color: c.panel,
  });

  const qrImg = await doc.embedPng(qrPng);
  const qrSize = Math.min(panelW * 0.62, panelH * 0.62);
  const qx = panelPad + (panelW - qrSize) / 2;
  const qy = panelPad + 60 + (panelH - qrSize) / 2 + 16;

  page.drawImage(qrImg, { x: qx, y: qy, width: qrSize, height: qrSize });

  // bottom info in panel
  const info = linesFromSpec(spec, project);
  let y = panelPad + 80;
  for (const line of info) {
    page.drawText(line, {
      x: panelPad + 24,
      y,
      size: 10,
      font,
      color: c.panelMuted,
      maxWidth: panelW - 48,
    });
    y += 14;
  }

  // logo top-right (optional)
  if (project.logo_path) {
    try {
      const raw = await fetchLogoBytes(project.logo_path);
      const png = await logoToPng(raw, 650);
      const img = await doc.embedPng(png);

      const size = 46;
      page.drawImage(img, { x: w - 28 - size, y: h - 54, width: size, height: size });
    } catch (e) {
      console.warn("[print-pack] logo embed failed:", e);
    }
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function renderPosterA3(spec: PrintPackSpec, project: QrProjectRow): Promise<Buffer> {
  const theme = spec.theme ?? "dark";
  const c = themeColors(theme);

  const [w, h] = aSizePt("A3");

  const qrPng = await generateQrPng(project, { width: 3600 });

  const doc = await PDFDocument.create();
  const page = doc.addPage([w, h]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({ x: 0, y: 0, width: w, height: h, color: c.bg });
  page.drawRectangle({ x: 0, y: h - 10, width: w, height: 10, color: c.line });

  const brand = safeLine(spec.brand_name) ?? project.business_name;
  page.drawText(brand, { x: 50, y: h - 80, size: 34, font: fontBold, color: c.text });

  const tagline = safeLine(project.tagline ?? undefined) ?? "Scan to connect";
  page.drawText(tagline, { x: 50, y: h - 115, size: 14, font, color: c.muted });

  const panelPad = 50;
  const panelTop = h - 160;
  const panelH = panelTop - panelPad;
  page.drawRectangle({ x: panelPad, y: panelPad, width: w - panelPad * 2, height: panelH, color: c.panel });

  const qrImg = await doc.embedPng(qrPng);
  const qrSize = Math.min((w - panelPad * 2) * 0.62, panelH * 0.62);
  const qx = panelPad + ((w - panelPad * 2) - qrSize) / 2;
  const qy = panelPad + (panelH - qrSize) / 2 + 40;
  page.drawImage(qrImg, { x: qx, y: qy, width: qrSize, height: qrSize });

  const info = linesFromSpec(spec, project);
  let y = panelPad + 40;
  for (const line of info) {
    page.drawText(line, {
      x: panelPad + 30,
      y,
      size: 14,
      font,
      color: c.panelMuted,
      maxWidth: w - panelPad * 2 - 60,
    });
    y += 18;
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function renderStickerSheetA4(spec: PrintPackSpec, project: QrProjectRow): Promise<Buffer> {
  const theme: PrintPackTheme = "light"; // stickers: keep printable/simple
  const c = themeColors(theme);

  const [w, h] = aSizePt("A4");
  const qrPng = await generateQrPng(project, { width: 1800 });

  const doc = await PDFDocument.create();
  const page = doc.addPage([w, h]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // white background
  page.drawRectangle({ x: 0, y: 0, width: w, height: h, color: c.bg });

  const brand = safeLine(spec.brand_name) ?? project.business_name;

  // grid 3 columns x 7 rows (21 stickers), conservative margins
  const margin = 28;
  const cols = 3;
  const rows = 7;
  const gap = 10;

  const cellW = (w - margin * 2 - gap * (cols - 1)) / cols;
  const cellH = (h - margin * 2 - gap * (rows - 1)) / rows;

  const qrSize = Math.min(cellW, cellH) * 0.68;

  const qrImg = await doc.embedPng(qrPng);

  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const x = margin + col * (cellW + gap);
      const y = h - margin - (r + 1) * cellH - r * gap;

      // cut guide (very light)
      page.drawRectangle({
        x,
        y,
        width: cellW,
        height: cellH,
        borderWidth: 0.6,
        borderColor: rgb(0.85, 0.87, 0.9),
      });

      // QR centered
      const qx = x + (cellW - qrSize) / 2;
      const qy = y + (cellH - qrSize) / 2 + 6;
      page.drawImage(qrImg, { x: qx, y: qy, width: qrSize, height: qrSize });

      // brand label
      const label = brand.length > 20 ? `${brand.slice(0, 20)}…` : brand;
      page.drawText(label, {
        x: x + 6,
        y: y + 6,
        size: 8,
        font: fontBold,
        color: c.text,
        maxWidth: cellW - 12,
      });

      // tiny url
      const url = project.url.length > 28 ? `${project.url.slice(0, 28)}…` : project.url;
      page.drawText(url, {
        x: x + 6,
        y: y + 16,
        size: 6.5,
        font,
        color: c.muted,
        maxWidth: cellW - 12,
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
