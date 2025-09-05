// INSANYCK STEP 4 · Lote 3 — Schema.org JSON-LD builders

import { truncateText, sanitizeHtml } from "@/lib/utils";

// INSANYCK STEP 4 · Lote 3 — Organization schema for site-wide use
export function createOrganizationSchema(locale: string = 'pt') {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://insanyck.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "INSANYCK",
    "description": locale === 'en' 
      ? "Essential luxury in motion. Premium pieces with precise design and magnetic presence."
      : "Luxo essencial em movimento. Peças premium com design preciso e presença magnética.",
    "url": `${baseUrl}/${locale === 'en' ? 'en' : 'pt'}`,
    "logo": `${baseUrl}/brand/logo.svg`,
    "foundingDate": "2024",
    "sameAs": [
      // Add social media URLs when available
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Portuguese", "English"]
    }
  };
}

// INSANYCK STEP 4 · Lote 3 — Product schema for PDP pages
export interface ProductSchemaProps {
  name: string;
  description?: string;
  sku?: string;
  image?: string;
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  category?: string;
  slug: string;
  locale?: string;
}

export function createProductSchema({
  name,
  description,
  sku,
  image,
  price,
  currency = 'BRL',
  availability = 'InStock',
  brand = 'INSANYCK',
  category,
  slug,
  locale = 'pt'
}: ProductSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://insanyck.com';
  const productUrl = `${baseUrl}/${locale === 'en' ? 'en' : 'pt'}/produto/${slug}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": sanitizeHtml(name),
    "description": description ? sanitizeHtml(truncateText(description, 200)) : undefined,
    "sku": sku,
    "image": image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : undefined,
    "brand": {
      "@type": "Brand",
      "name": brand
    },
    "category": category,
    "url": productUrl,
    "offers": price ? {
      "@type": "Offer",
      "price": price,
      "priceCurrency": currency,
      "availability": `https://schema.org/${availability}`,
      "url": productUrl,
      "seller": {
        "@type": "Organization",
        "name": brand
      }
    } : undefined
  };
}

// INSANYCK STEP 4 · Lote 3 — Breadcrumb schema for navigation
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://insanyck.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };
}

// INSANYCK STEP 4 · Lote 3 — FAQ schema for FAQ pages
export interface FAQItem {
  question: string;
  answer: string;
}

export function createFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": sanitizeHtml(faq.question),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": sanitizeHtml(faq.answer)
      }
    }))
  };
}

// INSANYCK STEP 4 · Lote 3 — WebSite schema with search action
export function createWebSiteSchema(locale: string = 'pt') {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://insanyck.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "INSANYCK",
    "url": `${baseUrl}/${locale === 'en' ? 'en' : 'pt'}`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/${locale === 'en' ? 'en' : 'pt'}/buscar?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}