// INSANYCK STEP H1.1 GOLDEN BRUSH — Admin Product Card (THE CELL · GOD TIER)
// Visual-first card for God View catalog (Museum Edition)
// Multi-layer shadows, breathing animation, premium hover states

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import DsBadge from "@/components/ds/DsBadge";
import InlineStockEditor from "./InlineStockEditor";
import MobileSwipeActions from "./MobileSwipeActions";
import AdminVitrineThumb from "./AdminVitrineThumb";

// INSANYCK H1-04 — Product type (matches API response)
export interface AdminProductCardData {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "active" | "archived";
  updatedAt: string;
  images: Array<{ url: string; alt?: string | null }>;
  variants: Array<{
    id: string;
    sku: string;
    inventory: {
      quantity: number;
      reserved: number;
    } | null;
  }>;
}

interface AdminProductCardProps {
  product: AdminProductCardData;
  /** Layout mode */
  layout?: "grid" | "list";
  /** Enable mobile swipe actions (default: true on mobile) */
  enableSwipe?: boolean;
  /** Callback when stock updates */
  onStockUpdate?: (productId: string) => void;
  /** INSANYCK STEP H1.1 GOLDEN BRUSH — Callback when "Manage Variants" is clicked */
  onManageVariants?: (product: AdminProductCardData) => void;
  /** INSANYCK STEP H1.1 GOLDEN BRUSH — Enable breathing animation (when low stock filter is active) */
  isLowStockBreathing?: boolean;
}

/**
 * INSANYCK STEP H1.1 GOLDEN BRUSH — Admin Product Card (THE CELL)
 * Features:
 * - Multi-layer shadow system (museum vitrine depth)
 * - Premium hover state (translateY -3px + shadow expansion)
 * - Breathing animation when low stock filter is active
 * - Specular highlight overlay
 * - Stock controls with micro-feedback
 */
export default function AdminProductCard({
  product,
  layout = "grid",
  enableSwipe = true,
  onStockUpdate,
  onManageVariants,
  isLowStockBreathing = false,
}: AdminProductCardProps) {
  const [localQuantity, setLocalQuantity] = useState<number | null>(null);

  // INSANYCK H1-04 — Calculate total stock across all variants
  const totalStock = product.variants.reduce((sum, v) => {
    if (!v.inventory) return sum;
    return sum + (v.inventory.quantity - v.inventory.reserved);
  }, 0);

  const totalQuantity = product.variants.reduce((sum, v) => {
    return sum + (v.inventory?.quantity ?? 0);
  }, 0);

  // Primary image (first or fallback)
  const primaryImage = product.images[0] || null;

  // INSANYCK H1-04 — For inline editing, only support single-variant products
  const isSingleVariant = product.variants.length === 1;
  const firstVariant = product.variants[0];

  // Status badge variant
  const statusVariant: "default" | "soldout" | "new" =
    product.status === "active" ? "new" :
    product.status === "archived" ? "soldout" :
    "default";

  const statusLabel =
    product.status === "active" ? "Active" :
    product.status === "draft" ? "Draft" :
    "Archived";

  // INSANYCK H1-04 — Mobile swipe handlers
  const handleIncrement = () => {
    if (!isSingleVariant || !firstVariant.inventory) return;
    // Optimistically update local state
    setLocalQuantity((firstVariant.inventory.quantity ?? 0) + 1);
  };

  const handleDecrement = () => {
    if (!isSingleVariant || !firstVariant.inventory) return;
    const current = firstVariant.inventory.quantity ?? 0;
    if (current > 0) {
      setLocalQuantity(current - 1);
    }
  };

  const CardContent = (
    <motion.div
      className={`
        admin-card p-4 sm:p-5 group
        ${isLowStockBreathing && totalStock > 0 && totalStock <= 10 ? 'stock-badge-breathing' : ''}
      `}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Specular Highlight (Museum Edition) */}
      <div
        className="absolute top-0 left-[10%] right-[10%] h-px rounded-t-[20px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)',
        }}
      />

      <div className={`flex ${layout === "grid" ? "flex-col" : "flex-row"} gap-4`}>
        {/* INSANYCK STEP H1.1 — Mini Vitrine Thumbnail */}
        {primaryImage ? (
          <AdminVitrineThumb
            src={primaryImage.url}
            alt={primaryImage.alt || product.title}
            size={layout === "grid" ? "full" : "md"}
          />
        ) : (
          // Fallback for no image (using same visual style)
          <div className={`relative ${layout === "grid" ? "w-full" : "w-24 sm:w-32"} flex-shrink-0`}>
            <div className="relative aspect-square rounded-[var(--ds-radius-md)] overflow-hidden bg-black/30 border border-white/[0.08]">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Title + Status */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <Link
                href={`/produtos/${product.slug}`}
                target="_blank"
                className="text-base font-semibold text-white/95 hover:text-white/100 line-clamp-2 transition-colors"
              >
                {product.title}
              </Link>
              <DsBadge variant={statusVariant}>{statusLabel}</DsBadge>
            </div>
            <div className="text-xs text-white/45 font-mono">
              /{product.slug}
            </div>
          </div>

          {/* Stock Info */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
            <div className="flex flex-col gap-1">
              <span className="text-[0.6875rem] text-white/45 uppercase tracking-wider font-medium">
                Stock
              </span>
              <div className="text-sm font-semibold text-white/80">
                {totalStock} available
                {product.variants.length > 1 && (
                  <span className="text-xs text-white/40 ml-1.5">
                    ({product.variants.length} variants)
                  </span>
                )}
              </div>
            </div>

            {/* Inline Stock Editor (only for single-variant products) */}
            {isSingleVariant && firstVariant.inventory && (
              <div className="flex-shrink-0">
                <InlineStockEditor
                  variantId={firstVariant.id}
                  quantity={localQuantity ?? firstVariant.inventory.quantity}
                  reserved={firstVariant.inventory.reserved}
                  onUpdate={(newQty) => {
                    setLocalQuantity(newQty);
                    onStockUpdate?.(product.id);
                  }}
                />
              </div>
            )}

            {/* INSANYCK STEP H1.1 GOLDEN BRUSH — Multi-variant indicator (opens drawer) */}
            {!isSingleVariant && (
              <motion.button
                type="button"
                onClick={() => onManageVariants?.(product)}
                className="
                  px-3 py-1.5
                  text-xs font-medium text-white/60
                  border border-white/[0.08]
                  rounded-md
                  hover:border-white/[0.16] hover:text-white/80
                  hover:bg-white/[0.03]
                  transition-all duration-150
                  focus:outline-none
                  focus:ring-2 focus:ring-white/[0.08]
                "
                whileTap={{ scale: 0.98 }}
              >
                Manage Variants
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // INSANYCK H1-04 — Wrap with swipe actions on mobile (if enabled + single variant)
  if (enableSwipe && isSingleVariant && firstVariant.inventory) {
    return (
      <div className="block sm:hidden">
        <MobileSwipeActions
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
        >
          {CardContent}
        </MobileSwipeActions>
      </div>
    );
  }

  return CardContent;
}
