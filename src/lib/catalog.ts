// INSANYCK STEP 11 — Catalog Utils with DB via Prisma
import { prisma } from "@/lib/prisma";

// Fallback mock data for graceful degradation during development
const mockProducts = [
  {
    id: "1",
    slug: "produto-exemplo",
    title: "Produto Exemplo",
    variants: [{ priceCents: 9900 }],
    images: [{ url: "/products/placeholder/front.webp" }],
    status: "active",
  },
];

// Product shape matching existing mock structure for 1:1 compatibility
export interface ProductCard {
  id: string;
  slug: string;
  title: string;
  price: string; // Formatted price string
  status?: "new" | "soldout";
  images?: {
    front?: string;
    back?: string;
    detail?: string;
  };
  thumbs?: {
    front?: string;
    back?: string;
    detail?: string;
  };
}

// Helper to format price from cents to BRL string
function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// Helper to map DB product to ProductCard format (maintaining 1:1 visual compatibility)
function mapProductToCard(product: any): ProductCard {
  // Get minimum variant price for display (flexible schema access)
  const variants = product.variants || [];
  const minPriceCents = variants.length > 0 
    ? Math.min(...variants.map((v: any) => v.priceCents || v.price || 9900))
    : 9900; // Default fallback

  // Extract first image or use placeholder (flexible schema access)
  const images = product.images || [];
  const frontImage = images[0]?.url || images[0]?.src;
  const backImage = images[1]?.url || images[1]?.src;

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: formatPrice(minPriceCents),
    status: product.status === 'soldout' ? 'soldout' : undefined,
    images: {
      front: frontImage,
      back: backImage,
    },
    thumbs: {
      front: frontImage,
      back: backImage,
    },
  };
}

/**
 * Get featured products for home page carousels
 */
export async function getFeaturedProducts(limit = 8): Promise<ProductCard[]> {
  try {
    const products = await prisma.product.findMany({
      take: limit,
      include: {
        images: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(mapProductToCard);
  } catch (error) {
    console.error('[INSANYCK][Catalog] Error fetching featured products:', error);
    // Graceful fallback with mock data during development
    return mockProducts.slice(0, limit).map(mapProductToCard);
  }
}

/**
 * Get new arrivals for home page
 */
export async function getNewArrivals(limit = 6): Promise<ProductCard[]> {
  try {
    const products = await prisma.product.findMany({
      take: limit,
      include: {
        images: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(mapProductToCard);
  } catch (error) {
    console.error('[INSANYCK][Catalog] Error fetching new arrivals:', error);
    return mockProducts.slice(0, limit).map(mapProductToCard);
  }
}

/**
 * Get category highlights
 */
export async function getCategoryHighlights(categorySlug: string, limit = 4): Promise<ProductCard[]> {
  try {
    const products = await prisma.product.findMany({
      take: limit,
      include: {
        images: true,
        variants: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Client-side filter by category (temporary until schema is clarified)
    const filtered = products.filter(p => 
      (p.category as any)?.slug === categorySlug
    );

    return filtered.map(mapProductToCard);
  } catch (error) {
    console.error('[INSANYCK][Catalog] Error fetching category highlights:', error);
    return mockProducts.slice(0, limit).map(mapProductToCard);
  }
}

/**
 * Search products by query string
 */
export async function searchProducts(query: string, limit = 20): Promise<ProductCard[]> {
  if (!query.trim()) return [];

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        images: true,
        variants: true,
        category: true,
      },
      orderBy: { title: 'asc' },
    });

    return products.map(mapProductToCard);
  } catch (error) {
    console.error('[INSANYCK][Catalog] Error searching products:', error);
    return mockProducts.filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase())
    ).map(mapProductToCard);
  }
}