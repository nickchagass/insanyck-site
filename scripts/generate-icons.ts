// INSANYCK STEP 3
import sharp from "sharp";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

async function run() {
  const src = join(process.cwd(), "public", "brand", "logo.png"); // se tiver PNG
  const svg = join(process.cwd(), "public", "brand", "logo.svg"); // fallback: rasterizar do SVG
  const outDir = join(process.cwd(), "public", "icons");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const base = (await sharp(existsSync(src) ? src : svg)
    .resize(800, 800, { fit: "contain", background: "#000000" })
    .png()
    .toBuffer());

  // icon-192
  await sharp({
    create: { width: 192, height: 192, channels: 3, background: "#000000" },
  })
    .composite([{ input: base, gravity: "centre" }])
    .png()
    .toFile(join(outDir, "icon-192.png"));

  // icon-512
  await sharp({
    create: { width: 512, height: 512, channels: 3, background: "#000000" },
  })
    .composite([{ input: base, gravity: "centre" }])
    .png()
    .toFile(join(outDir, "icon-512.png"));

  // maskable-512 com padding de safe area
  const padded = await sharp(base)
    .extend({ top: 64, bottom: 64, left: 64, right: 64, background: "#000000" })
    .resize(512, 512, { fit: "contain", background: "#000000" })
    .png()
    .toBuffer();

  await sharp({
    create: { width: 512, height: 512, channels: 3, background: "#000000" },
  })
    .composite([{ input: padded, gravity: "centre" }])
    .png()
    .toFile(join(outDir, "maskable-512.png"));

  console.log("✅ Ícones gerados em /public/icons");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
