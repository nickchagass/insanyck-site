// INSANYCK STEP 11 — Sitemap with Type-Safe Env and Prisma
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { env, isServerEnvReady } from '@/lib/env.server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1) Base URL: usa env se existir; senão, deriva do request (robusto para qualquer porta/preview)
    const rawBase = (() => {
      try {
        return isServerEnvReady() ? (env.NEXT_PUBLIC_URL || "").trim().replace(/\/$/, "") : "";
      } catch {
        return "";
      }
    })();
    const derivedBase = (() => {
      const host = req.headers.host || "localhost:3000";
      const proto = (req.headers["x-forwarded-proto"] as string) || (host.includes("localhost") ? "http" : "https");
      return `${proto}://${host}`;
    })();
    const baseUrl = rawBase || derivedBase;
    if (!rawBase && process.env.NODE_ENV !== "production") {
      console.warn("[INSANYCK][Sitemap] NEXT_PUBLIC_URL ausente; usando base derivada:", baseUrl);
    }

    // 2) Permitir GET e HEAD
    if (req.method !== "GET" && req.method !== "HEAD") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({ select: { slug: true, updatedAt: true }, where: { status: "active" } }),
      prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    const now = new Date();
    const staticUrls = [
      { loc: "/", lastmod: now, priority: "1.0" },
      { loc: "/loja", lastmod: now, priority: "0.8" }
    ];

    const categoryUrls = (categories ?? []).map(c => ({
      loc: `/loja?category=${encodeURIComponent(c.slug)}`,
      lastmod: c.updatedAt ?? now,
      priority: "0.7"
    }));

    const productUrls = (products ?? []).map(p => ({
      loc: `/produto/${encodeURIComponent(p.slug)}`,
      lastmod: p.updatedAt ?? now,
      priority: "0.6"
    }));

    const allUrls = [...staticUrls, ...categoryUrls, ...productUrls];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${baseUrl}${url.loc.startsWith("/") ? url.loc : "/" + url.loc}</loc>
    <lastmod>${url.lastmod.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).send(sitemap);
  } catch (e) {
    console.error("[INSANYCK][Sitemap] Fallback mode:", e);
    const host = req.headers.host || "localhost:3000";
    const proto = (req.headers["x-forwarded-proto"] as string) || (host.includes("localhost") ? "http" : "https");
    const fallbackBase = `${proto}://${host}`;
    const now = new Date().toISOString();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${fallbackBase}/</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${fallbackBase}/loja</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>
</urlset>`;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).send(xml);
  }
}