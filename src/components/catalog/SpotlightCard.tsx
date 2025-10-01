"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { ProductCardData } from "@/types/product";
import OptimizedImage from "@/components/ui/OptimizedImage";
import AddToCartButton from "@/components/AddToCartButton";

interface SpotlightCardProps {
  product: ProductCardData;
  priority?: boolean;
}

export default function SpotlightCard({ product, priority = false }: SpotlightCardProps) {
  const { t } = useTranslation(["plp", "cart", "common"]);
  const cardRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const img = product.thumbs?.front || product.images?.front || "/products/placeholder/front.webp";

  // Parallax mouse tracking (reduced motion aware)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current || !isHovered) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate relative position (-1 to 1)
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      
      // Limit to max 4-6 degrees as specified
      const maxTilt = 4;
      setMousePosition({
        x: Math.max(-1, Math.min(1, x)) * maxTilt,
        y: Math.max(-1, Math.min(1, y)) * maxTilt
      });
    };

    if (isHovered) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  // Transform styles for parallax
  const parallaxStyle = {
    transform: `perspective(800px) rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
    transition: isHovered ? 'transform 0.25s var(--ease-premium)' : 'transform 0.4s var(--ease-premium)',
  };

  // Reduced motion override
  const reducedMotionStyle = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? { transform: 'none', transition: 'none' }
    : parallaxStyle;

  return (
    <article
      ref={cardRef}
      className="spotlight-card card-insanyck group relative overflow-hidden h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={reducedMotionStyle}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Image container with 2.5D effect */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[18px]">
        <Link
          href={`/produto/${product.slug}`}
          className="block h-full group/link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-t-[18px]"
          aria-label={`Ver detalhes de ${product.title}`}
        >
          {/* Pedestal shadow effect */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-4 bg-black/20 rounded-full blur-sm opacity-60" />
          
          {/* Main product image */}
          <OptimizedImage
            src={img}
            alt={`${product.title} — ${t("common:aria.productImage", "Imagem do produto destacada")}`}
            aspectRatio="4/5"
            fallbackSrc="/products/placeholder/front.webp"
            sizes="(max-width: 768px) 90vw, (max-width: 1280px) 60vw, 50vw"
            className="transition-transform duration-500 group-hover/link:scale-105"
            priority={priority}
            style={{
              transform: `translate3d(${mousePosition.x * 2}px, ${mousePosition.y * 2}px, 0)`,
              transition: 'transform 0.25s var(--ease-premium)',
            }}
          />
          
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </Link>

        {/* Status badges */}
        {product.status === "new" && (
          <div className="absolute top-4 right-4">
            <span className="ins-chip bg-white/15 text-white/90 backdrop-blur-sm">
              {t("plp:badge.new", "Novo")}
            </span>
          </div>
        )}
        
        {product.status === "soldout" && (
          <div className="absolute top-4 right-4">
            <span className="ins-chip bg-red-500/20 text-red-300 backdrop-blur-sm border-red-500/30">
              {t("plp:badge.soldout", "Esgotado")}
            </span>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-6 flex flex-col h-full">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-white/95 mb-2 leading-tight">
            {product.title}
          </h2>
          
          <div className="text-lg md:text-xl font-semibold text-white/80">
            {product.price}
          </div>
          
          {/* Product description hint if available */}
          {product.description && (
            <p className="mt-3 text-sm text-white/60 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* CTAs - always visible on spotlight */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/produto/${product.slug}`}
            className="btn-insanyck--primary flex-1 text-center py-3 rounded-xl font-semibold transition-all duration-200"
          >
            {t("plp:viewDetails", "Ver detalhes")}
          </Link>
          
          {product.status !== "soldout" && (
            <AddToCartButton
              product={{
                slug: product.slug,
                title: product.title,
                image: img,
                price: product.price,
              }}
              className="btn-insanyck--ghost flex-1 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              {t("cart:addToCart", "Adicionar")}
            </AddToCartButton>
          )}
        </div>
      </div>
    </article>
  );
}