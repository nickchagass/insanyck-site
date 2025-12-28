// INSANYCK SEO Core Library
// Handles meta tags, Open Graph, Twitter Cards, hreflang, and JSON-LD
import React from 'react';
import { PUBLIC_URL, getPublicBaseUrl } from './env.public';

type LinkTag = React.DetailedHTMLProps<
  React.LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement
>;

// Base configuration
export const baseTitle = 'INSANYCK';
export const baseDescription = 'Luxury fashion • Vidro leve • Borda hairline';

// Helper to get base URL with development fallback
export const getBaseUrl = (): string => {
  // No cliente, sempre a origem atual (evita URL errada atrás de proxy)
  if (typeof window !== 'undefined') return window.location.origin;
  // No server, usar PUBLIC_URL seguro (nunca lança)
  return PUBLIC_URL || getPublicBaseUrl();
};

// Build page title with INSANYCK suffix
export const buildTitle = (pageTitle?: string): string => {
  if (!pageTitle) return baseTitle;
  return `${pageTitle} • ${baseTitle}`;
};

// Interface for meta tags configuration
interface MetaTagsConfig {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  locale?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
}

// Generate complete meta tags object
export const metaTags = (config: MetaTagsConfig) => {
  const {
    title,
    description = baseDescription,
    canonical,
    image,
    locale = 'pt-BR',
    type = 'website',
    noIndex = false
  } = config;

  const baseUrl = getBaseUrl();
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl;
  const ogImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/brand/logo.svg`;

  const meta = [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:url', content: fullCanonical },
    { property: 'og:image', content: ogImage },
    { property: 'og:locale', content: locale },
    { property: 'og:site_name', content: baseTitle },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: ogImage },
  ];

  if (noIndex) {
    meta.push({ name: 'robots', content: 'noindex, nofollow' });
  }

  const link: LinkTag[] = [
    { rel: 'canonical', href: fullCanonical },
  ];

  // Add hreflang alternates
  if (!noIndex) {
    link.push(
      { rel: 'alternate', href: fullCanonical, hrefLang: 'pt-BR' },
      { rel: 'alternate', href: fullCanonical.replace('/pt/', '/en/'), hrefLang: 'en' },
      { rel: 'alternate', href: fullCanonical, hrefLang: 'x-default' }
    );
  }

  return {
    title,
    meta,
    link
  };
};

// JSON-LD Schema generators
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: baseTitle,
  url: getBaseUrl(),
  logo: `${getBaseUrl()}/logo.png`,
  description: baseDescription,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    areaServed: 'BR',
    availableLanguage: ['Portuguese', 'English']
  }
});

export const generateWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: baseTitle,
  url: getBaseUrl(),
  potentialAction: {
    '@type': 'SearchAction',
    target: `${getBaseUrl()}/buscar?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${getBaseUrl()}${item.url}`
  }))
});

interface ProductSchemaData {
  name: string;
  description?: string;
  image: string[];
  brand?: string;
  sku?: string;
  price: number;
  currency?: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  url: string;
}

export const generateProductSchema = (product: ProductSchemaData) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description || baseDescription,
  image: product.image,
  brand: {
    '@type': 'Brand',
    name: product.brand || baseTitle
  },
  sku: product.sku,
  offers: {
    '@type': 'Offer',
    priceCurrency: product.currency || 'BRL',
    price: product.price,
    availability: `https://schema.org/${product.availability}`,
    url: `${getBaseUrl()}${product.url}`
  }
});

// Page-specific SEO generators
export const seoHome = (locale: string = 'pt-BR') => {
  const title = buildTitle();
  const description = locale === 'en' 
    ? 'Luxury fashion • Light glass • Hairline border'
    : 'Moda luxury • Vidro leve • Borda hairline';

  return {
    ...metaTags({
      title,
      description,
      canonical: '/',
      locale
    }),
    jsonLd: [
      generateOrganizationSchema(),
      generateWebSiteSchema()
    ]
  };
};

interface PLPParams {
  title?: string;
  categorySlug?: string;
  categoryName?: string;
  productCount?: number;
  locale?: string;
}

export const seoPLP = (params: PLPParams = {}) => {
  const { title: pageTitle, categorySlug, categoryName, productCount, locale = 'pt-BR' } = params;
  
  let title = pageTitle || 'Loja';
  if (categoryName) {
    title = categoryName;
  }
  
  let description = baseDescription;
  if (productCount) {
    description = locale === 'en'
      ? `${productCount} luxury products • Light glass • Hairline border`
      : `${productCount} produtos luxury • Vidro leve • Borda hairline`;
  }

  const canonical = categorySlug ? `/loja?category=${categorySlug}` : '/loja';
  
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Loja', url: '/loja' }
  ];
  
  if (categoryName) {
    breadcrumbItems.push({ name: categoryName, url: canonical });
  }

  return {
    ...metaTags({
      title: buildTitle(title),
      description,
      canonical,
      locale
    }),
    jsonLd: [
      generateBreadcrumbSchema(breadcrumbItems)
    ]
  };
};

interface PDPProduct {
  title: string;
  description?: string;
  images: string[];
  slug: string;
  price: number;
  currency?: string;
  inStock: boolean;
  sku?: string;
  category?: string;
}

export const seoPDP = (product: PDPProduct, locale: string = 'pt-BR') => {
  const title = buildTitle(product.title);
  const description = product.description || baseDescription;
  const canonical = `/produto/${product.slug}`;
  const image = product.images[0];
  
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Loja', url: '/loja' }
  ];
  
  if (product.category) {
    breadcrumbItems.push({ name: product.category, url: `/loja?category=${product.category}` });
  }
  
  breadcrumbItems.push({ name: product.title, url: canonical });

  return {
    ...metaTags({
      title,
      description,
      canonical,
      image,
      locale,
      type: 'product'
    }),
    jsonLd: [
      generateBreadcrumbSchema(breadcrumbItems),
      generateProductSchema({
        name: product.title,
        description,
        image: product.images,
        sku: product.sku,
        price: product.price,
        currency: product.currency || 'BRL',
        availability: product.inStock ? 'InStock' : 'OutOfStock',
        url: canonical
      })
    ]
  };
};

export const seoCart = (locale: string = 'pt-BR') => {
  const title = locale === 'en' ? 'Shopping Cart' : 'Sacola';
  const description = locale === 'en'
    ? 'Review your luxury items • Light glass • Hairline border'
    : 'Revise seus itens luxury • Vidro leve • Borda hairline';

  return {
    ...metaTags({
      title: buildTitle(title),
      description,
      canonical: '/sacola',
      locale,
      noIndex: true
    }),
    jsonLd: []
  };
};

export const seoCheckout = (locale: string = 'pt-BR') => {
  const title = locale === 'en' ? 'Checkout' : 'Finalizar Compra';
  const description = locale === 'en'
    ? 'Secure checkout • Luxury fashion • INSANYCK'
    : 'Checkout seguro • Moda luxury • INSANYCK';

  return {
    ...metaTags({
      title: buildTitle(title),
      description,
      canonical: '/checkout',
      locale,
      noIndex: true
    }),
    jsonLd: []
  };
};

export const seoAccount = (locale: string = 'pt-BR') => {
  const title = locale === 'en' ? 'My Account' : 'Minha Conta';
  const description = locale === 'en'
    ? 'Manage your orders, addresses and personal information • INSANYCK'
    : 'Gerencie seus pedidos, endereços e informações pessoais • INSANYCK';

  return {
    ...metaTags({
      title: buildTitle(title),
      description,
      canonical: '/conta',
      locale,
      noIndex: true
    }),
    jsonLd: []
  };
};

export const seoAccountLogin = (locale: string = 'pt-BR') => {
  const title = locale === 'en' ? 'Sign In' : 'Entrar';
  const description = locale === 'en'
    ? 'Access your INSANYCK account • Premium fashion • Secure login'
    : 'Acesse sua conta INSANYCK • Moda premium • Login seguro';

  return {
    ...metaTags({
      title: buildTitle(title),
      description,
      canonical: '/conta/login',
      locale,
      noIndex: true
    }),
    jsonLd: []
  };
};

export const seoAccountSignup = (locale: string = 'pt-BR') => {
  const title = locale === 'en' ? 'Create Account' : 'Criar Conta';
  const description = locale === 'en'
    ? 'Join INSANYCK • Premium fashion • Create your account'
    : 'Junte-se à INSANYCK • Moda premium • Crie sua conta';

  return {
    ...metaTags({
      title: buildTitle(title),
      description,
      canonical: '/conta/cadastro',
      locale,
      noIndex: true
    }),
    jsonLd: []
  };
};

export const seoWishlist = (locale: string = 'pt-BR') => {
  const title = locale === 'en' ? 'Wishlist' : 'Favoritos';
  const description = locale === 'en'
    ? 'Your favorite pieces from the INSANYCK collection • Premium fashion'
    : 'Suas peças favoritas da coleção INSANYCK • Moda premium';

  return {
    ...metaTags({
      title: buildTitle(title),
      description,
      canonical: '/favoritos',
      locale,
      noIndex: true
    }),
    jsonLd: []
  };
};

export const seoSearch = (locale: string = 'pt-BR', query?: string) => {
  const title = query
    ? (locale === 'en' ? `Search results for "${query}"` : `Resultados para "${query}"`)
    : (locale === 'en' ? 'Search' : 'Buscar');
  const description = locale === 'en'
    ? 'Find the perfect INSANYCK pieces • Premium fashion search'
    : 'Encontre as peças INSANYCK perfeitas • Busca de moda premium';

  return {
    ...metaTags({
      title: buildTitle(title),
      description,
      canonical: query ? `/buscar?q=${encodeURIComponent(query)}` : '/buscar',
      locale,
      noIndex: true
    }),
    jsonLd: []
  };
};

// INSANYCK LEGAL-COMPLIANCE-MUSEUM — SEO for Legal Pages

export const seoPrivacy = (locale: string = 'pt-BR') => {
  const title = locale === 'en' ? 'Privacy Policy' : 'Política de Privacidade';
  const description = locale === 'en'
    ? 'Learn how INSANYCK collects, uses, and protects your personal data. Transparency and security are our pillars.'
    : 'Saiba como a INSANYCK coleta, usa e protege seus dados pessoais. Transparência e segurança são nossos pilares.';

  return {
    ...metaTags({
      title: buildTitle(title),
      description,
      canonical: '/privacidade',
      locale,
      noIndex: false
    }),
    jsonLd: []
  };
};

export const seoTerms = (locale: string = 'pt-BR') => {
  const title = locale === 'en' ? 'Terms of Service' : 'Termos de Uso';
  const description = locale === 'en'
    ? 'Read INSANYCK terms and conditions. Transparency in purchase, delivery, and return policies.'
    : 'Leia os termos e condições da INSANYCK. Transparência nas regras de compra, entrega e devolução.';

  return {
    ...metaTags({
      title: buildTitle(title),
      description,
      canonical: '/termos',
      locale,
      noIndex: false
    }),
    jsonLd: []
  };
};

export const seoNews = (locale: string = 'pt-BR') => {
  const title = locale === 'en' ? 'News & Updates' : 'Novidades';
  const description = locale === 'en'
    ? 'Latest INSANYCK updates, new collections, and editorial content. Premium luxury fashion news.'
    : 'Últimas atualizações INSANYCK, novas coleções e conteúdo editorial. Novidades de moda luxury premium.';

  return {
    ...metaTags({
      title: buildTitle(title),
      description,
      canonical: '/novidades',
      locale,
      noIndex: false
    }),
    jsonLd: [
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: title, url: '/novidades' }
      ])
    ]
  };
};