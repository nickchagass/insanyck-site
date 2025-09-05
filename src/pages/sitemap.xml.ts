// INSANYCK STEP 4 · Lote 3 — Dynamic sitemap with hreflang alternates
import { GetServerSideProps } from 'next';
import { prisma } from '@/lib/prisma';

// INSANYCK STEP 4 · Lote 3 — Static routes configuration
const STATIC_ROUTES = [
  { path: '', priority: 1.0, changefreq: 'daily' },
  { path: '/loja', priority: 0.9, changefreq: 'daily' },
  { path: '/favoritos', priority: 0.5, changefreq: 'weekly' },
  { path: '/sobre', priority: 0.6, changefreq: 'monthly' },
  { path: '/faq', priority: 0.4, changefreq: 'monthly' },
];

// INSANYCK STEP 4 · Lote 3 — Routes to exclude from sitemap
const EXCLUDED_ROUTES = [
  '/conta',
  '/checkout',
  '/api',
  '/admin',
  '/login',
  '/cadastro'
];

function generateSitemapXML(urls: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;
}

function generateUrlEntry({
  loc,
  lastmod,
  changefreq = 'weekly',
  priority = 0.7,
  alternates = []
}: {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  alternates?: { hreflang: string; href: string }[];
}): string {
  return `  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    ${alternates.map(alt => 
      `<xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`
    ).join('\n    ')}
  </url>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://insanyck.com';
    const lastmod = new Date().toISOString().split('T')[0];
    const urls: string[] = [];

    // INSANYCK STEP 4 · Lote 3 — Static routes with locales and alternates
    for (const route of STATIC_ROUTES) {
      const ptPath = `/pt${route.path}`;
      const enPath = `/en${route.path}`;
      
      // PT version
      urls.push(generateUrlEntry({
        loc: `${baseUrl}${ptPath}`,
        lastmod,
        changefreq: route.changefreq,
        priority: route.priority,
        alternates: [
          { hreflang: 'pt-BR', href: `${baseUrl}${ptPath}` },
          { hreflang: 'en', href: `${baseUrl}${enPath}` },
          { hreflang: 'x-default', href: `${baseUrl}${ptPath}` }
        ]
      }));
      
      // EN version
      urls.push(generateUrlEntry({
        loc: `${baseUrl}${enPath}`,
        lastmod,
        changefreq: route.changefreq,
        priority: route.priority * 0.9, // Slightly lower priority for EN
        alternates: [
          { hreflang: 'pt-BR', href: `${baseUrl}${ptPath}` },
          { hreflang: 'en', href: `${baseUrl}${enPath}` },
          { hreflang: 'x-default', href: `${baseUrl}${ptPath}` }
        ]
      }));
    }

    // INSANYCK STEP 4 · Lote 3 — Dynamic product routes
    try {
      const products = await prisma.product.findMany({
        where: { 
          published: true,
          // Only include products with valid slugs
          slug: {
            not: null
          }
        },
        select: {
          slug: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' }
      });

      for (const product of products) {
        if (product.slug) {
          const productLastmod = product.updatedAt?.toISOString().split('T')[0] || lastmod;
          const ptPath = `/pt/produto/${product.slug}`;
          const enPath = `/en/produto/${product.slug}`;
          
          // PT version
          urls.push(generateUrlEntry({
            loc: `${baseUrl}${ptPath}`,
            lastmod: productLastmod,
            changefreq: 'weekly',
            priority: 0.8,
            alternates: [
              { hreflang: 'pt-BR', href: `${baseUrl}${ptPath}` },
              { hreflang: 'en', href: `${baseUrl}${enPath}` },
              { hreflang: 'x-default', href: `${baseUrl}${ptPath}` }
            ]
          }));
          
          // EN version
          urls.push(generateUrlEntry({
            loc: `${baseUrl}${enPath}`,
            lastmod: productLastmod,
            changefreq: 'weekly',
            priority: 0.7,
            alternates: [
              { hreflang: 'pt-BR', href: `${baseUrl}${ptPath}` },
              { hreflang: 'en', href: `${baseUrl}${enPath}` },
              { hreflang: 'x-default', href: `${baseUrl}${ptPath}` }
            ]
          }));
        }
      }
    } catch (dbError) {
      console.warn('Database error in sitemap generation:', dbError);
      // Continue without dynamic routes if DB is unavailable
    }

    // INSANYCK STEP 4 · Lote 3 — Generate and return sitemap
    const sitemap = generateSitemapXML(urls);

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
    res.write(sitemap);
    res.end();

    return { props: {} };
  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    // INSANYCK STEP 4 · Lote 3 — Minimal fallback sitemap
    const fallbackSitemap = generateSitemapXML([
      generateUrlEntry({
        loc: `${process.env.NEXT_PUBLIC_URL || 'https://insanyck.com'}/pt`,
        lastmod: new Date().toISOString().split('T')[0],
        priority: 1.0
      })
    ]);
    
    res.setHeader('Content-Type', 'text/xml');
    res.write(fallbackSitemap);
    res.end();

    return { props: {} };
  }
};

// INSANYCK STEP 4 · Lote 3 — Component never renders (SSR only)
export default function Sitemap() {
  return null;
}