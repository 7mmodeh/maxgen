import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import toIco from "to-ico";

const root = process.cwd();
const inputPng = path.join(root, "public", "logo.png");

// Output paths (Next App Router picks these up automatically)
const outAppIcon = path.join(root, "app", "icon.png");
const outAppleIcon = path.join(root, "app", "apple-icon.png");
const outFaviconIco = path.join(root, "app", "favicon.ico");

// Ensure logo exists
if (!fs.existsSync(inputPng)) {
  console.error(`Missing: ${inputPng}`);
  process.exit(1);
}

// We’ll render icons on a clean transparent background.
// If your logo is not square, sharp will “contain” it and preserve aspect ratio.
async function main() {
  const base = sharp(inputPng).ensureAlpha();

  // app/icon.png (recommended 64x64 for crispness)
  await base
    .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outAppIcon);

  // app/apple-icon.png (180x180)
  await base
    .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outAppleIcon);

  // favicon.ico (bundle common sizes)
  const sizes = [16, 32, 48, 64].map((s) =>
    base
      .resize(s, s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
  );

  const buffers = await Promise.all(sizes);
  const ico = await toIco(buffers);
  fs.writeFileSync(outFaviconIco, ico);

  console.log("Icons generated:");
  console.log(" - app/icon.png");
  console.log(" - app/apple-icon.png");
  console.log(" - app/favicon.ico");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
