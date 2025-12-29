// INSANYCK STEP MUSEUM-VAULT — ShowroomGrid Gallery Edition
// INSANYCK STEP G-04.2.1 — Guard console.error no frontend
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

  // INSANYCK STEP MUSEUM-VAULT — Empty state with personality
  if (!products.length && !loading) {
    return (
      <div className="plp-empty">
        {/* Icon SVG */}
        <svg
          className="plp-empty__icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h2 className="plp-empty__title">
          {t("plp:empty.title", "Nenhuma peça encontrada")}
        </h2>
        <p className="plp-empty__text">
          {t("plp:empty.subtitle", "Tente ajustar os filtros ou explore nossa coleção completa")}
        </p>
      </div>
    );
  }

  // INSANYCK STEP MUSEUM-VAULT — Gallery Grid with uniform cards
  return (
    <div className="space-y-8">
      {/* Museum Grid */}
      <div
        className="plp-grid"
        role="list"
        aria-label={t("plp:products_grid", "Grade de produtos")}
      >
        {products.map((product, index) => (
          <div
            key={product.id || product.slug}
            role="listitem"
          >
            <ProductCard
              product={product}
              variant="standard"
              priority={index < 4}
            />
          </div>
        ))}

        {/* INSANYCK STEP MUSEUM-VAULT — Loading skeletons */}
        {isLoading && Array.from({ length: 12 }).map((_, i) => (
          <div key={`skeleton-${i}`}>
            <div className="plp-gallery-card">
              <div className="plp-image-stage">
                <div className="plp-skeleton plp-skeleton--image" />
              </div>
              <div className="plp-content-pedestal">
                <div className="plp-skeleton plp-skeleton--title" />
                <div className="plp-skeleton plp-skeleton--price" />
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
          <div className="animate-spin h-8 w-8 border-2 border-white/15 border-t-white/90 rounded-full"></div>
        </div>
      )}

      {/* End indicator */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-white/40 text-sm">
            {t("plp:end_of_results", "Fim dos resultados")}
          </p>
        </div>
      )}
    </div>
  );
}
