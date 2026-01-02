// INSANYCK STEP H1-04 — Admin Product List
// Grid/list container with search + filters (Museum Edition)
// Client-side filtering for God View catalog
// INSANYCK STEP H1.2 — Added useDeferredValue for search, LOW_STOCK_THRESHOLD constant, onManageVariants

"use client";

import { useState, useMemo, useDeferredValue } from "react";
import AdminProductCard, { AdminProductCardData } from "./AdminProductCard";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin/constants";

interface AdminProductListProps {
  products: AdminProductCardData[];
  /** Loading state */
  isLoading?: boolean;
  /** Callback when stock updates (triggers revalidation) */
  onStockUpdate?: () => void;
  /** INSANYCK STEP H1.2 — Callback when "Manage Variants" is clicked */
  onManageVariants?: (product: AdminProductCardData) => void;
}

type FilterOption = "all" | "active" | "draft" | "lowstock" | "outofstock";

/**
 * INSANYCK H1-04 — Admin Product List
 * Features:
 * - Client-side search by title/slug
 * - Filter: All / Active / Draft / Low Stock / Out of Stock
 * - Responsive grid (2 cols desktop, 1 col mobile)
 * - Empty state (Museum Edition)
 */
export default function AdminProductList({
  products,
  isLoading = false,
  onStockUpdate,
  onManageVariants,
}: AdminProductListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");

  // INSANYCK STEP H1.2 — Defer search to avoid jank on large lists
  const deferredSearch = useDeferredValue(search);

  // INSANYCK H1-04 — Client-side filtering
  // INSANYCK STEP H1.2 — Use deferred search + LOW_STOCK_THRESHOLD constant
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

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* INSANYCK STEP H1.2 — Search with clear button */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              px-4 py-2.5
              pr-10
              text-sm text-white/90 placeholder:text-white/40
              bg-black/30
              border border-white/[0.08]
              rounded-[var(--ds-radius-md)]
              backdrop-blur-sm
              focus:outline-none
              focus:border-white/[0.16]
              focus:ring-2 focus:ring-white/[0.08]
              transition-all duration-150
            "
          />
          {search && (
            <button
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
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
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
            >
              {f.label}
            </button>
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

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredProducts.map((product) => (
            <AdminProductCard
              key={product.id}
              product={product}
              layout="grid"
              onStockUpdate={onStockUpdate}
              onManageVariants={onManageVariants}
            />
          ))}
        </div>
      ) : (
        /* Empty State (Museum Edition) */
        <div className="glass-card-museum p-12 text-center">
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
        </div>
      )}
    </div>
  );
}
