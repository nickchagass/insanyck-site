// INSANYCK STEP 4 · Lote 3 — Dynamic OG image generation
import { NextApiRequest, NextApiResponse } from 'next';
import { sanitizeHtml, truncateText } from '@/lib/utils';

// INSANYCK STEP 4 · Lote 3 — Simple SVG OG image generator (fallback without external deps)
function generateOGImageSVG({
  title,
  description,
  type = 'website'
}: {
  title: string;
  description?: string;
  type?: string;
}) {
  const cleanTitle = sanitizeHtml(truncateText(title, 60));
  const cleanDescription = description ? sanitizeHtml(truncateText(description, 110)) : '';
  
  // INSANYCK STEP 4 · Lote 3 — SVG with INSANYCK branding
  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Subtle pattern -->
  <g opacity="0.05">
    <circle cx="200" cy="150" r="100" fill="white"/>
    <circle cx="1000" cy="480" r="80" fill="white"/>
  </g>
  
  <!-- INSANYCK Logo/Brand -->
  <text x="100" y="120" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="white" opacity="0.9">
    INSANYCK
  </text>
  
  <!-- Main Title -->
  <text x="100" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="800" fill="white" filter="url(#glow)">
    ${cleanTitle.length > 40 ? `${cleanTitle.substring(0, 40)}...` : cleanTitle}
  </text>
  
  ${cleanDescription ? `
  <!-- Description -->
  <text x="100" y="350" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="400" fill="white" opacity="0.8">
    ${cleanDescription.length > 80 ? `${cleanDescription.substring(0, 80)}...` : cleanDescription}
  </text>
  ` : ''}
  
  <!-- Type indicator -->
  <rect x="100" y="450" width="120" height="40" rx="20" fill="white" opacity="0.1"/>
  <text x="160" y="475" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="white" opacity="0.7" text-anchor="middle">
    ${type.toUpperCase()}
  </text>
  
  <!-- Subtle border -->
  <rect x="2" y="2" width="1196" height="626" fill="none" stroke="white" stroke-width="2" opacity="0.1" rx="8"/>
</svg>`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { route } = req.query;
    const routePath = Array.isArray(route) ? route.join('/') : route || '';
    
    // INSANYCK STEP 4 · Lote 3 — Extract parameters from query or route
    const {
      title = 'INSANYCK',
      description,
      type = 'website'
    } = req.query;
    
    // INSANYCK STEP 4 · Lote 3 — Generate dynamic content based on route
    let ogTitle = title as string;
    let ogDescription = description as string;
    let ogType = type as string;
    
    // Route-specific content
    if (routePath.includes('produto')) {
      ogType = 'product';
      if (!ogDescription) {
        ogDescription = 'Descubra peças exclusivas que definem seu estilo único';
      }
    } else if (routePath.includes('loja')) {
      ogTitle = ogTitle === 'INSANYCK' ? 'Coleção INSANYCK' : ogTitle;
      ogDescription = ogDescription || 'Explore nossa coleção de luxo essencial';
    } else if (routePath === '' || routePath === 'home') {
      ogTitle = 'INSANYCK — Luxo essencial em movimento';
      ogDescription = 'Peças premium com design preciso e presença magnética';
    }
    
    // INSANYCK STEP 4 · Lote 3 — Generate SVG
    const svg = generateOGImageSVG({
      title: ogTitle,
      description: ogDescription,
      type: ogType
    });
    
    // INSANYCK STEP 4 · Lote 3 — Return SVG as response
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, s-maxage=31536000, immutable');
    res.status(200).send(svg);
    
  } catch (error) {
    console.error('OG Image generation error:', error);
    
    // INSANYCK STEP 4 · Lote 3 — Fallback SVG on error
    const fallbackSvg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#000"/>
  <text x="600" y="315" font-family="system-ui" font-size="48" font-weight="800" fill="white" text-anchor="middle">
    INSANYCK
  </text>
</svg>`;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(fallbackSvg);
  }
}