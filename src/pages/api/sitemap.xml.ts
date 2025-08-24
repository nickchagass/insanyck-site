// INSANYCK STEP 11 — Sitemap with Type-Safe Env and Prisma
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { env, isServerEnvReady } from '@/lib/env.server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isServerEnvReady()) {
    console.error('[INSANYCK][Sitemap] Server environment not ready');
    return res.status(500).json({ error: 'Service unavailable' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const baseUrl = env.NEXT_PUBLIC_URL;

    // Páginas estáticas
    const staticPages = [
      '',
      '/loja',
      '/conta',
      '/favoritos',
      '/login',
    ];

    // Buscar produtos ativos
    const products = await prisma.product.findMany({
      where: { status: 'active' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    // Buscar categorias
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map((page) => {
      return `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    })
    .join('')}
  ${products
    .map((product) => {
      return `
  <url>
    <loc>${baseUrl}/produto/${product.slug}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    })
    .join('')}
  ${categories
    .map((category) => {
      return `
  <url>
    <loc>${baseUrl}/loja?categoria=${category.slug}</loc>
    <lastmod>${category.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}