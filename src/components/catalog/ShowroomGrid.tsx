"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "next-i18next";
import SpotlightCard from "./SpotlightCard";
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
        console.error("Error loading more products:", error);
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

  // Grid layout calculation
  const getGridItemClass = (index: number) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1280;
    
    if (isMobile) {
      // Mobile: all cards 1x1
      return "col-span-1 row-span-1";
    }
    
    if (isTablet) {
      // Tablet: 3 cols, spotlight becomes 2 col/auto-rows
      if (index === 0) return "col-span-2 row-span-2"; // First card spotlight
      return "col-span-1 row-span-1";
    }
    
    // Desktop: 4 cols pattern
    if (index === 0) return "col-span-2 row-span-2"; // First card spotlight (2x2)
    if ((index + 5) % 6 === 0) return "col-span-2 row-span-1"; // Every 6th card wide (2x1)
    return "col-span-1 row-span-1"; // Regular cards (1x1)
  };

  const getGridClass = () => {
    return "grid gap-6 auto-rows-fr " +
           "grid-cols-2 " + // Mobile: 2 cols
           "md:grid-cols-3 " + // Tablet: 3 cols  
           "xl:grid-cols-4"; // Desktop: 4 cols
  };

  if (!products.length && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">
          {t("plp:no_products", "Nenhum produto encontrado")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Showroom Grid */}
      <div 
        className={getGridClass()}
        role="list"
        aria-label={t("plp:products_grid", "Grade de produtos")}
      >
        {products.map((product, index) => {
          const isSpotlight = index === 0;
          const isWide = !isSpotlight && (index + 5) % 6 === 0;
          const gridClass = getGridItemClass(index);

          return (
            <div
              key={product.id || product.slug}
              className={gridClass}
              role="listitem"
            >
              {isSpotlight ? (
                <SpotlightCard 
                  product={product}
                  priority={true}
                />
              ) : (
                <ProductCard 
                  product={product}
                  variant={isWide ? "wide" : "standard"}
                  priority={index < 4}
                />
              )}
            </div>
          );
        })}

        {/* Loading skeletons during fetch */}
        {isLoading && Array.from({ length: 12 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="col-span-1 row-span-1">
            <div className="card-insanyck p-4 animate-pulse">
              <div className="aspect-[3/4] bg-white/10 rounded-lg"></div>
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-white/10 rounded w-4/5"></div>
                <div className="h-3 bg-white/10 rounded w-2/5"></div>
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
          <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full"></div>
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