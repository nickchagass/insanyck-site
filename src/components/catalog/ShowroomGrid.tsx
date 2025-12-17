// INSANYCK STEP G-04.2.1 — Guard console.error no frontend
// INSANYCK STEP G-05.4-B — Removed SpotlightCard (showroom consistency)
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "next-i18next";
import ProductCard from "./ProductCard";
import { ProductCardData } from "@/types/product";

interface ShowroomGridProps {
  initialProducts: ProductCardData[];
  onLoadMore?: () => Promise<ProductCardData[]>;
  hasMore?: boolean;
  loading?: boolean;
}

export default function ShowroomGrid({ 
  initialProducts, 
  onLoadMore,
  hasMore = false,
  loading = false 
}: ShowroomGridProps) {
  const { t } = useTranslation(["plp", "common"]);
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  const handleIntersection = useCallback(async (entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !isLoading && hasMore && onLoadMore) {
      setIsLoading(true);
      try {
        const newProducts = await onLoadMore();
        setProducts(prev => [...prev, ...newProducts]);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading more products:", error);
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [isLoading, hasMore, onLoadMore]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "100px",
      threshold: 0.1,
    });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [handleIntersection, hasMore]);

  // INSANYCK STEP G-05.4-B — Showroom Grid: consistent spacing, no giant spotlight
  // Layout responsivo controlado APENAS via Tailwind breakpoints:
  // - Mobile (< 768px): grid-cols-2, todos os cards 1x1
  // - Tablet (768-1279px): grid-cols-3, todos os cards 1x1
  // - Desktop (≥1280px): grid-cols-4, todos os cards 1x1
  // CHANGE: Removed spotlight 2x2 giant card, now all cards are uniform for showroom consistency
  const getGridItemClass = () => {
    // STEP G-05.4-B: All cards are now uniform 1x1 (no more giant spotlight)
    return "col-span-1 row-span-1";
  };

  const getGridClass = () => {
    // STEP G-05.4-B: Premium spacing with consistent gaps
    return "grid gap-6 auto-rows-fr " +
           "grid-cols-2 " + // Mobile: 2 cols
           "md:grid-cols-3 " + // Tablet: 3 cols
           "xl:grid-cols-4"; // Desktop: 4 cols
  };

  if (!products.length && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-ds-accentSoft">
          {t("plp:no_products", "Nenhum produto encontrado")}
        </p>
      </div>
    );
  }

  // STEP G-05.4-B — Showroom Grid: consistent card layout, no giant spotlight
  return (
    <div className="space-y-8">
      {/* Showroom Grid — STEP G-05.4-B: uniform cards, premium spacing */}
      <div
        className={getGridClass()}
        role="list"
        aria-label={t("plp:products_grid", "Grade de produtos")}
      >
        {products.map((product, index) => (
          <div
            key={product.id || product.slug}
            className={getGridItemClass()}
            role="listitem"
          >
            {/* STEP G-05.4-B: All cards use ProductCard (standard variant), no more SpotlightCard giant */}
            <ProductCard
              product={product}
              variant="standard"
              priority={index < 4}
            />
          </div>
        ))}

        {/* Loading skeletons during fetch */}
        {isLoading && Array.from({ length: 12 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="col-span-1 row-span-1">
            <div className="card-insanyck p-4 animate-pulse">
              <div className="aspect-[3/4] bg-ds-elevated rounded-lg"></div>
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-ds-elevated rounded w-4/5"></div>
                <div className="h-3 bg-ds-elevated rounded w-2/5"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="h-20 flex items-center justify-center"
        >
          <div className="animate-spin h-8 w-8 border-2 border-ds-borderSubtle border-t-ds-accent rounded-full"></div>
        </div>
      )}

      {/* End indicator */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-ds-accentSoft text-sm opacity-60">
            {t("plp:end_of_results", "Fim dos resultados")}
          </p>
        </div>
      )}
    </div>
  );
}