// INSANYCK STEP 11 — Catalog Utils with Real Prisma Integration
// INSANYCK STEP C-fix — uso do helper centralizado
import { isBackendDisabled } from "./env.server";
import { prisma } from "@/lib/prisma";
import { ProductCardData, productToCardData } from "@/types/product";

const PLACEHOLDER = "/thumbs/placeholder.webp";
const backendDisabled = isBackendDisabled();

const mockProducts: ProductCardData[] = [
  { id:"m1", slug:"tee-oversized-preta", title:"Oversized Tee Preta", price:"R$ 149,00",
    images:{ front: PLACEHOLDER }, thumbs:{ front: PLACEHOLDER } },
  { id:"m2", slug:"tee-classic-branca", title:"Classic Tee Branca", price:"R$ 139,00",
    images:{ front: PLACEHOLDER }, thumbs:{ front: PLACEHOLDER } },
  { id:"m3", slug:"regata-essential-preta", title:"Regata Essential Preta", price:"R$ 99,00",
    images:{ front: PLACEHOLDER }, thumbs:{ front: PLACEHOLDER } },
  { id:"m4", slug:"drop-zero-limited", title:"Drop Zero Limited", price:"R$ 199,00",
    images:{ front: PLACEHOLDER }, thumbs:{ front: PLACEHOLDER } },
  { id:"m5", slug:"acessorio-bucket-preto", title:"Bucket Hat Preto", price:"R$ 119,00",
    images:{ front: PLACEHOLDER }, thumbs:{ front: PLACEHOLDER } },
  { id:"m6", slug:"moletom-classic-cinza", title:"Moletom Classic Cinza", price:"R$ 249,00",
    images:{ front: PLACEHOLDER }, thumbs:{ front: PLACEHOLDER } },
  { id:"m7", slug:"oversized-classic-off", title:"Oversized Classic Off", price:"R$ 159,00",
    images:{ front: PLACEHOLDER }, thumbs:{ front: PLACEHOLDER } },
  { id:"m8", slug:"regatas-verao-pack", title:"Pack Regatas Verão", price:"R$ 179,00",
    images:{ front: PLACEHOLDER }, thumbs:{ front: PLACEHOLDER } },
];

/**
 * Get featured products for home page carousels
 */
export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  if (backendDisabled) return mockProducts.slice(0, limit);
  
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
    if (!backendDisabled) console.error('[INSANYCK][Catalog] featured:', error);
    return mockProducts.slice(0, limit);
  }
}

/**
 * Get new arrivals for home page
 */
export async function getNewArrivals(limit = 6): Promise<ProductCardData[]> {
  if (backendDisabled) return mockProducts.slice(0, limit);
  
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
    if (!backendDisabled) console.error('[INSANYCK][Catalog] new arrivals:', error);
    return mockProducts.slice(0, limit);
  }
}

/**
 * Get category highlights
 */
export async function getCategoryHighlights(categorySlug: string, limit = 4): Promise<ProductCardData[]> {
  if (backendDisabled) return mockProducts.slice(0, limit);
  
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
    if (!backendDisabled) console.error('[INSANYCK][Catalog] cat highlights:', error);
    return mockProducts.slice(0, limit);
  }
}

/**
 * Search products by query string
 */
export async function searchProducts(query: string, limit = 20): Promise<ProductCardData[]> {
  if (!query.trim()) return [];
  
  if (backendDisabled) {
    return mockProducts
      .filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
  }

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
    if (!backendDisabled) console.error('[INSANYCK][Catalog] search:', error);
    return mockProducts
      .filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
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

  if (backendDisabled) return mockProducts.slice(offset, offset + limit);

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
    if (!backendDisabled) console.error('[INSANYCK][Catalog] all products:', error);
    return mockProducts.slice(offset, offset + limit);
  }
}