// INSANYCK STEP 10 — Robots.txt dinâmico bloqueando admin
// src/pages/api/robots.txt.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'https://insanyck.com';

  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /conta/
Disallow: /api/
Disallow: /sacola
Disallow: /checkout
Disallow: /pedido/

# INSANYCK STEP 10 — Permitir produtos e loja
Allow: /produto/
Allow: /loja

Sitemap: ${baseUrl}/api/sitemap.xml

# Crawl-delay para não sobrecarregar
Crawl-delay: 1`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=86400');
  res.status(200).send(robots);
}