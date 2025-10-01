// INSANYCK STEP 11 — Real Product Types from Prisma Schema
import { Product as PrismaProduct, ProductImage, Variant, Price, Inventory, Category, VariantOption, OptionValue, Option } from '@prisma/client';

// Extended Product type with all relations we typically need
export type Product = PrismaProduct & {
  category?: Category | null;
  images?: ProductImage[];
  variants?: (Variant & {
    price?: Price | null;
    inventory?: Inventory | null;
    options?: (VariantOption & {
      optionValue: OptionValue & {
        option: Option;
      };
    })[];
  })[];
};

// Simplified Product for cards/grids (matches mock interface for compatibility)
export type ProductCardData = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  price: string | number; // display price, calculated from variants
  thumbs?: {
    front?: string;
  };
  images?: {
    front?: string;
  };
  status?: "new" | "soldout" | string;
};

// Product for API responses
export type ProductWithVariants = Product;

// Helper to convert Prisma Product to Card format
export function productToCardData(product: Product): ProductCardData {
  // Get first image
  const firstImage = product.images?.[0]?.url || "/products/placeholder/front.webp";
  
  // Get price from first active variant
  const activeVariant = product.variants?.find(v => v.status === 'active');
  const priceCents = activeVariant?.price?.cents || 0;
  const priceDisplay = priceCents > 0 
    ? `R$ ${(priceCents / 100).toFixed(2).replace('.', ',')}`
    : "Consulte";

  // Check if sold out (no inventory or all variants out of stock)
  const isSoldOut = !product.variants?.some(v => 
    v.status === 'active' && 
    (v.inventory?.quantity || 0) > (v.inventory?.reserved || 0)
  );

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    price: priceDisplay,
    thumbs: {
      front: firstImage
    },
    images: {
      front: firstImage
    },
    status: isSoldOut ? "soldout" : (product.status === "active" ? undefined : "new")
  };
}