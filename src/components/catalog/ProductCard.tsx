"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { ProductCardData } from "@/types/product";
import OptimizedImage from "@/components/ui/OptimizedImage";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";

interface ProductCardProps {
  product: ProductCardData;
  variant?: "standard" | "wide";
  priority?: boolean;
}

export default function ProductCard({ 
  product, 
  variant = "standard", 
  priority = false 
}: ProductCardProps) {
  const { t } = useTranslation(["plp", "cart", "common"]);
  const cardRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [showCTAs, setShowCTAs] = useState(false);

  const img = product.thumbs?.front || product.images?.front || "/products/placeholder/front.webp";
  
  // Convert price to cents for wishlist
  const priceCents = typeof product.price === "number"
    ? Math.round(product.price * 100)
    : (() => {
        const val = Number(
          String(product.price)
            .replace(/[^\d,.-]/g, "")
            .replace(/\./g, "")
            .replace(",", ".")
        );
        return Number.isFinite(val) ? Math.round(val * 100) : 0;
      })();

  // Micro-tilt mouse tracking
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
      const maxTilt = 3;
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
    setShowCTAs(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowCTAs(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleFocus = () => {
    setShowCTAs(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Only hide CTAs if focus is moving outside the card
    if (!cardRef.current?.contains(e.relatedTarget as Node)) {
      setShowCTAs(false);
    }
  };

  // Transform styles for micro-tilt
  const tiltStyle = {
    transform: `perspective(800px) rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
    transition: isHovered ? 'transform 0.25s var(--ease-premium)' : 'transform 0.4s var(--ease-premium)',
    willChange: 'transform',
  };

  // Reduced motion override
  const cardStyle = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? { transform: 'none', transition: 'none' }
    : tiltStyle;

  const aspectRatio = variant === "wide" ? "2/1" : "3/4";
  
  return (
    <article
      ref={cardRef}
      className={`product-card card-insanyck group relative overflow-hidden h-full ${variant === "wide" ? "wide-card" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={cardStyle}
    >
      {/* Micro-elevation shadow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--ds-surface-soft)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      
      {/* Image container */}
      <div className={`relative overflow-hidden rounded-t-[18px] ${variant === "wide" ? "aspect-[2/1]" : "aspect-[3/4]"}`}>
        <Link
          href={`/produto/${product.slug}`}
          className="block h-full group/link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ds-surface)] rounded-t-[18px]"
          aria-label={`Ver detalhes de ${product.title}`}
        >
          <OptimizedImage
            src={img}
            alt={`${product.title} — ${t("common:aria.productImage", "Imagem do produto")}`}
            aspectRatio={aspectRatio}
            fallbackSrc="/products/placeholder/front.webp"
            sizes={variant === "wide" 
              ? "(max-width: 768px) 90vw, (max-width: 1280px) 60vw, 50vw"
              : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            }
            className="transition-transform duration-300 group-hover/link:scale-[1.02]"
            loading={priority ? "eager" : "lazy"}
            priority={priority}
          />
        </Link>

        {/* Status badges */}
        {product.status === "new" && (
          <div className="absolute top-3 right-3">
            <span className="ins-chip text-xs">
              {t("plp:badge.new", "Novo")}
            </span>
          </div>
        )}
        
        {product.status === "soldout" && (
          <div className="absolute top-3 right-3">
            <span className="ins-chip bg-[color:var(--ds-danger-soft)] text-[color:var(--ds-danger)] border-[color:var(--ds-danger)] text-xs">
              {t("plp:badge.soldout", "Esgotado")}
            </span>
          </div>
        )}

      </div>

      {/* Content section */}
      <div className="p-4 flex flex-col h-full">
        <div className="flex-1">
          <h3 className="font-semibold text-ds-accent mb-1 line-clamp-2">
            {product.title}
          </h3>

          <div className="text-ds-accentSoft font-medium">
            {product.price}
          </div>
        </div>

        {/* CTAs - INSANYCK FASE G-03.1 UX-01 — Mobile First: sempre visível em mobile, hover em desktop */}
        <div
          className={`
            mt-4 transition-all duration-300
            opacity-100 translate-y-0 pointer-events-auto
            md:opacity-0 md:translate-y-2 md:pointer-events-none
            ${showCTAs ? 'md:opacity-100 md:translate-y-0 md:pointer-events-auto' : ''}
          `}
        >
          <div className="flex gap-2">
            <Link
              href={`/produto/${product.slug}`}
              className="flex-1 text-center text-sm font-semibold py-2 px-3 rounded-lg border border-ds-borderSubtle text-ds-accent hover:bg-ds-elevated hover:border-ds-borderStrong transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
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
                className="flex-1 text-sm font-semibold py-2 px-3 rounded-lg border border-ds-borderSubtle text-ds-accent hover:bg-ds-elevated hover:border-ds-borderStrong transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
              >
                {t("cart:addToCart", "Adicionar")}
              </AddToCartButton>
            )}
            
            {/* Wishlist button */}
            <WishlistButton
              slug={product.slug}
              title={product.title}
              priceCents={priceCents}
              image={img}
              className="p-2 rounded-lg border border-ds-borderSubtle text-ds-accent hover:bg-ds-elevated hover:border-ds-borderStrong transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
            />
          </div>
        </div>
      </div>
    </article>
  );
}