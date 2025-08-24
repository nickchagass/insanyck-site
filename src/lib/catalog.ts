// INSANYCK STEP 11 — Catalog Utils with Real Prisma Integration
import { prisma } from "@/lib/prisma";
import { ProductCardData, productToCardData } from "@/types/product";
import { env } from "@/lib/env.server";

// Fallback mock data for graceful degradation during development
const mockProducts: ProductCardData[] = [
  {
    id: "1",
    slug: "produto-exemplo",
    title: "Produto Exemplo",
    price: "R$ 99,00",
    images: {
      front: "/products/placeholder/front.webp"
    },
    thumbs: {
      front: "/products/placeholder/front.webp"
    },
  },
];

/**
 * Get featured products for home page carousels
 */
export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'active' },
      take: limit,
      include: {
        images: true,
        variants: {
          include: {
            price: true,
            inventory: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(productToCardData);
  } catch (error) {
    console.error('[INSANYCK][Catalog] Error fetching featured products:', error);
    // Graceful fallback with mock data during development
    if (env.NODE_ENV === 'development') {
      console.log('[INSANYCK][Catalog] Using fallback mock data');
    }
    return mockProducts.slice(0, limit);
  }
}

/**
 * Get new arrivals for home page
 */
export async function getNewArrivals(limit = 6): Promise<ProductCardData[]> {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'active' },
      take: limit,
      include: {
        images: true,
        variants: {
          include: {
            price: true,
            inventory: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(productToCardData);
  } catch (error) {
    console.error('[INSANYCK][Catalog] Error fetching new arrivals:', error);
    if (env.NODE_ENV === 'development') {
      console.log('[INSANYCK][Catalog] Using fallback mock data');
    }
    return mockProducts.slice(0, limit);
  }
}

/**
 * Get category highlights
 */
export async function getCategoryHighlights(categorySlug: string, limit = 4): Promise<ProductCardData[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        category: { is: { slug: categorySlug } }
      },
      take: limit,
      include: {
        images: true,
        variants: {
          include: {
            price: true,
            inventory: true,
          }
        },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(productToCardData);
  } catch (error) {
    console.error('[INSANYCK][Catalog] Error fetching category highlights:', error);
    if (env.NODE_ENV === 'development') {
      console.log('[INSANYCK][Catalog] Using fallback mock data');
    }
    return mockProducts.slice(0, limit);
  }
}

/**
 * Search products by query string
 */
export async function searchProducts(query: string, limit = 20): Promise<ProductCardData[]> {
  if (!query.trim()) return [];

  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        images: true,
        variants: {
          include: {
            price: true,
            inventory: true,
          }
        },
        category: true,
      },
      orderBy: { title: 'asc' },
    });

    return products.map(productToCardData);
  } catch (error) {
    console.error('[INSANYCK][Catalog] Error searching products:', error);
    if (env.NODE_ENV === 'development') {
      console.log('[INSANYCK][Catalog] Using fallback mock data for search');
    }
    return mockProducts.filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase())
    );
  }
}

/**
 * Get all products for PLP with filtering/sorting
 */
export async function getAllProducts(options: {
  categorySlug?: string;
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'title';
  limit?: number;
  offset?: number;
} = {}): Promise<ProductCardData[]> {
  const { categorySlug, sortBy = 'newest', limit = 20, offset = 0 } = options;

  try {
    // Build where clause
    const where: any = { status: 'active' };
    if (categorySlug) {
      where.category = { is: { slug: categorySlug } };
    }

    // Build orderBy clause
    let orderBy: any;
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'title':
        orderBy = { title: 'asc' };
        break;
      case 'price_asc':
      case 'price_desc':
        // For price sorting, we'll sort after fetching based on variant pricing
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      take: limit,
      skip: offset,
      include: {
        images: true,
        variants: {
          include: {
            price: true,
            inventory: true,
          }
        },
        category: true,
      },
      orderBy,
    });

    // INSANYCK STEP 11 — Robust price sorting with minCents (no string parsing)
    const getMinCents = (prod: any) => {
      const vals = (prod.variants ?? [])
        .map((v: any) => v?.price?.cents ?? 0)
        .filter((n: number) => Number.isFinite(n) && n > 0);
      return vals.length ? Math.min(...vals) : 0;
    };

    if (sortBy === 'price_asc' || sortBy === 'price_desc') {
      products.sort((a: any, b: any) => {
        const A = getMinCents(a);
        const B = getMinCents(b);
        return sortBy === 'price_asc' ? A - B : B - A;
      });
    }

    // Map depois da ordenação
    const result = products.map(productToCardData);
    return result;
  } catch (error) {
    console.error('[INSANYCK][Catalog] Error fetching all products:', error);
    if (env.NODE_ENV === 'development') {
      console.log('[INSANYCK][Catalog] Using fallback mock data');
    }
    return mockProducts.slice(offset, offset + limit);
  }
}