// INSANYCK STEP 5
// scripts/to-webp.ts
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd(), "public", "products");

async function walk(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.(png|jpg|jpeg)$/i.test(e.name)) {
      const out = p.replace(/\.(png|jpg|jpeg)$/i, ".webp");
      await sharp(p)
        .webp({ quality: 88, nearLossless: true })
        .toFile(out);
      console.log("→", out);
    }
  }
}

walk(ROOT).catch((e) => {
  console.error(e);
  process.exit(1);
});
