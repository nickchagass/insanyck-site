// INSANYCK STEP H1.1 GOLDEN BRUSH — Admin Product List (THE LIQUID GRID · GOD TIER)
// Grid/list container with AnimatePresence, LayoutGroup, and stagger entrance
// Museum Edition visual excellence with premium loading skeleton

"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import AdminProductCard, { AdminProductCardData } from "./AdminProductCard";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin/constants";
import { LIQUID_SPRING, STAGGER_CONFIG } from "@/lib/admin/physics";

interface AdminProductListProps {
  products: AdminProductCardData[];
  /** Loading state */
  isLoading?: boolean;
  /** Callback when stock updates (triggers revalidation) */
  onStockUpdate?: () => void;
  /** INSANYCK STEP H1.1 GOLDEN BRUSH — Callback when "Manage Variants" is clicked */
  onManageVariants?: (product: AdminProductCardData) => void;
  /** INSANYCK STEP H1.1 GOLDEN BRUSH — Enable breathing animation (when low stock filter is active) */
  isLowStockFilterActive?: boolean;
}

type FilterOption = "all" | "active" | "draft" | "lowstock" | "outofstock";

/**
 * INSANYCK STEP H1.1 GOLDEN BRUSH — Admin Product List (THE LIQUID GRID)
 * Features:
 * - Liquid grid animations with LIQUID_SPRING physics
 * - Stagger entrance with STAGGER_CONFIG
 * - AnimatePresence for smooth filter transitions
 * - LayoutGroup for organic card movement
 * - Premium loading skeleton with shimmer
 * - Elegant empty state
 */
export default function AdminProductList({
  products,
  isLoading = false,
  onStockUpdate,
  onManageVariants,
  isLowStockFilterActive = false,
}: AdminProductListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");

  // INSANYCK STEP H1.1 — Defer search to avoid jank on large lists
  const deferredSearch = useDeferredValue(search);

  // INSANYCK STEP H1.1 — Client-side filtering
  const filteredProducts = useMemo(() => {
    let result = products;

    // Search filter (using deferred value)
    if (deferredSearch.trim()) {
      const query = deferredSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query)
      );
    }

    // Status/stock filter
    if (filter !== "all") {
      result = result.filter((p) => {
        if (filter === "active") return p.status === "active";
        if (filter === "draft") return p.status === "draft";

        // Calculate total stock
        const totalStock = p.variants.reduce((sum, v) => {
          if (!v.inventory) return sum;
          return sum + (v.inventory.quantity - v.inventory.reserved);
        }, 0);

        if (filter === "outofstock") return totalStock === 0;
        if (filter === "lowstock") return totalStock > 0 && totalStock <= LOW_STOCK_THRESHOLD;

        return true;
      });
    }

    return result;
  }, [products, deferredSearch, filter]);

  // Filter buttons config
  const filters: Array<{ value: FilterOption; label: string }> = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "lowstock", label: "Low Stock" },
    { value: "outofstock", label: "Out of Stock" },
  ];

  // INSANYCK STEP H1.1 GOLDEN BRUSH — Animation variants
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: STAGGER_CONFIG,
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      scale: 0.92,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: LIQUID_SPRING,
    },
    exit: {
      opacity: 0,
      scale: 0.88,
      y: -10,
      transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* INSANYCK STEP H1.1 GOLDEN BRUSH — Search with cold ray glow */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              search-input-cold-ray
              w-full
              px-4 py-2.5
              pr-10
              text-sm text-white/90 placeholder:text-white/40
              bg-black/30
              border border-white/[0.08]
              rounded-[var(--ds-radius-md)]
              backdrop-blur-sm
              transition-all duration-150
            "
          />
          {search && (
            <motion.button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                w-6 h-6
                flex items-center justify-center
                rounded
                text-white/40
                hover:text-white/70
                hover:bg-white/[0.06]
                transition-all duration-150
              "
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <motion.button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`
                px-3 py-1.5
                text-xs font-medium
                rounded-full
                border
                whitespace-nowrap
                transition-all duration-150
                ${
                  filter === f.value
                    ? "bg-white/[0.10] text-white/90 border-white/[0.20]"
                    : "bg-white/[0.02] text-white/50 border-white/[0.08] hover:border-white/[0.12]"
                }
              `}
              whileTap={{ scale: 0.95 }}
            >
              {f.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-white/45">
        <span>
          {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
          {deferredSearch && ` matching "${deferredSearch}"`}
        </span>
        {isLoading && (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </span>
        )}
      </div>

      {/* INSANYCK STEP H1.1 GOLDEN BRUSH — Liquid Product Grid */}
      {isLoading ? (
        /* Premium Loading Skeleton */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="skeleton-shimmer rounded-[16px] h-64 border border-white/[0.06]"
            />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <LayoutGroup>
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={LIQUID_SPRING}
                >
                  <AdminProductCard
                    product={product}
                    layout="grid"
                    onStockUpdate={onStockUpdate}
                    onManageVariants={onManageVariants}
                    isLowStockBreathing={isLowStockFilterActive}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      ) : (
        /* Empty State (Museum Edition) */
        <motion.div
          className="glass-card-museum p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg
            className="mx-auto h-12 w-12 text-white/20 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="text-lg font-semibold text-white/70 mb-2">
            No products found
          </h3>
          <p className="text-sm text-white/45">
            {deferredSearch
              ? `No products match "${deferredSearch}"`
              : "Try adjusting your filters"}
          </p>
        </motion.div>
      )}
    </div>
  );
}
