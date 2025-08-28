// INSANYCK STEP 11 — Robots.txt with Type-Safe Env
import { NextApiRequest, NextApiResponse } from 'next';
import { env, isServerEnvReady } from '@/lib/env.server';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isServerEnvReady()) {
    console.error('[INSANYCK][Robots] Server environment not ready');
    return res.status(500).json({ error: 'Service unavailable' });
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBase = (() => {
    try {
      return isServerEnvReady() ? (env.NEXT_PUBLIC_URL || "").trim().replace(/\/$/, "") : "";
    } catch { return ""; }
  })();
  const derivedBase = (() => {
    const host = req.headers.host || "localhost:3000";
    const proto = (req.headers["x-forwarded-proto"] as string) || (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  })();
  const baseUrl = rawBase || derivedBase;
  if (!rawBase && process.env.NODE_ENV !== "production") {
    console.warn("[INSANYCK][Robots] NEXT_PUBLIC_URL ausente; usando base derivada:", baseUrl);
  }

  const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/api/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.status(200).send(robots);
}