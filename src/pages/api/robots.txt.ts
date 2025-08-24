// INSANYCK STEP 11 — Robots.txt with Type-Safe Env
import { NextApiRequest, NextApiResponse } from 'next';
import { env, isServerEnvReady } from '@/lib/env.server';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isServerEnvReady()) {
    console.error('[INSANYCK][Robots] Server environment not ready');
    return res.status(500).json({ error: 'Service unavailable' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const baseUrl = env.NEXT_PUBLIC_URL;

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