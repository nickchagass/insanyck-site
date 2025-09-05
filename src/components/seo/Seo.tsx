// INSANYCK STEP 4 · Lote 3 — SEO component with dynamic OG, hreflang, and schema
"use client";

import Head from "next/head";
import { useRouter } from "next/router";
import { truncateText, sanitizeHtml } from "@/lib/utils";

export interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  canonical?: string;
  schema?: Record<string, any> | Record<string, any>[];
  // INSANYCK STEP 4 · Lote 3 — Product-specific props
  price?: number;
  currency?: string;
  availability?: string;
  brand?: string;
}

export default function Seo({
  title,
  description,
  image,
  type = "website",
  noindex = false,
  canonical,
  schema,
  price,
  currency,
  availability,
  brand
}: SeoProps) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://insanyck.com';
  
  // INSANYCK STEP 4 · Lote 3 — Get current locale and generate alternates
  const currentLocale = router.locale || 'pt';
  const currentPath = router.asPath.replace(/^\/[a-z]{2}/, '') || '/';
  
  // INSANYCK STEP 4 · Lote 3 — Generate meta content
  const metaTitle = title ? `${title} | INSANYCK` : 'INSANYCK — Luxo essencial em movimento';
  const metaDescription = description 
    ? sanitizeHtml(truncateText(description, 155))
    : currentLocale === 'en'
      ? 'Essential luxury in motion. Premium pieces with precise design and magnetic presence.'
      : 'Luxo essencial em movimento. Peças premium com design preciso e presença magnética.';
  
  const metaImage = image 
    ? (image.startsWith('http') ? image : `${baseUrl}${image}`)
    : `${baseUrl}/brand/logo.svg`;
  
  // INSANYCK STEP 4 · Lote 3 — Current page URL
  const currentUrl = `${baseUrl}${router.asPath}`;
  const canonicalUrl = canonical || currentUrl;
  
  // INSANYCK STEP 4 · Lote 3 — Generate hreflang alternates
  const alternates = [
    { locale: 'pt-BR', url: `${baseUrl}/pt${currentPath}` },
    { locale: 'en', url: `${baseUrl}/en${currentPath}` },
    { locale: 'x-default', url: `${baseUrl}/pt${currentPath}` }
  ];

  // INSANYCK STEP 4 · Lote 3 — Check if we're in preview environment
  const isPreview = process.env.VERCEL_ENV === 'preview';

  return (
    <Head>
      {/* INSANYCK STEP 4 · Lote 3 — Basic meta tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* INSANYCK STEP 4 · Lote 3 — Robots and indexing */}
      {(noindex || isPreview) && (
        <meta name="robots" content="noindex,nofollow" />
      )}
      
      {/* INSANYCK STEP 4 · Lote 3 — Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* INSANYCK STEP 4 · Lote 3 — Hreflang alternates */}
      {alternates.map(({ locale, url }) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={url}
        />
      ))}
      
      {/* INSANYCK STEP 4 · Lote 3 — Open Graph */}
      <meta property="og:title" content={truncateText(metaTitle, 60)} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="INSANYCK" />
      <meta property="og:locale" content={currentLocale === 'en' ? 'en_US' : 'pt_BR'} />
      
      {/* INSANYCK STEP 4 · Lote 3 — Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={truncateText(metaTitle, 60)} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      
      {/* INSANYCK STEP 4 · Lote 3 — Product-specific meta tags */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency || 'BRL'} />
          {availability && <meta property="product:availability" content={availability} />}
          {brand && <meta property="product:brand" content={brand} />}
        </>
      )}
      
      {/* INSANYCK STEP 4 · Lote 3 — Schema.org JSON-LD */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(Array.isArray(schema) ? schema : [schema])
          }}
        />
      )}
      
      {/* INSANYCK STEP 4 · Lote 3 — Additional meta tags for better indexing */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="application-name" content="INSANYCK" />
      <meta name="apple-mobile-web-app-title" content="INSANYCK" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    </Head>
  );
}