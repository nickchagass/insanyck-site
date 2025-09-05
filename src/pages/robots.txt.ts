// INSANYCK STEP 4 · Lote 3 — Dynamic robots.txt
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://insanyck.com';
  const isProduction = process.env.NODE_ENV === 'production';
  const isPreview = process.env.VERCEL_ENV === 'preview';
  
  // INSANYCK STEP 4 · Lote 3 — Robots configuration based on environment
  const robots = isProduction && !isPreview
    ? `# INSANYCK Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /conta/
Disallow: /checkout/
Disallow: /admin/
Disallow: /_next/
Disallow: /auth/

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1`
    : `# INSANYCK Robots.txt - Development/Preview
User-agent: *
Disallow: /

# No sitemaps for non-production environments`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=86400');
  res.write(robots);
  res.end();

  return { props: {} };
};

// INSANYCK STEP 4 · Lote 3 — Component never renders (SSR only)
export default function RobotsTxt() {
  return null;
}