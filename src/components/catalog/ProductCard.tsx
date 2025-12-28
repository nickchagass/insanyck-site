// INSANYCK STEP G-11 HYBRID — Museum Showcase Edition: ProductCard SSR-safe
// INSANYCK STEP G-FIX-CHECKOUT-LUXURY — Micro-interações + Seleção Preditiva
"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCardData } from "@/types/product";
import OptimizedImage from "@/components/ui/OptimizedImage";
import WishlistButton from "@/components/WishlistButton";
import { useCartStore } from "@/store/cart";

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

  // Aspect ratio for image
  const aspectRatio = variant === "wide" ? "2/1" : "3/4";

  return (
    <article className="ins-museum-card ins-simple-reflection group">
      {/* INSANYCK G-11 HYBRID — Vitrine de museu com spotlight descendente */}
      <Link
        href={`/produto/${product.slug}`}
        prefetch
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-2xl"
        aria-label={`Ver detalhes de ${product.title}`}
      >
        <div className="ins-vitrine ins-spotlight">
          {/* Status badges (floating top-right) */}
          {product.status === "new" && (
            <span className="absolute top-3 right-3 z-10 text-xs rounded-full px-3 py-1 bg-white/10 text-white/80 backdrop-blur-sm">
              {t("plp:badge.new", "Novo")}
            </span>
          )}
          {product.status === "soldout" && (
            <span className="absolute top-3 right-3 z-10 text-xs rounded-full px-3 py-1 bg-red-500/15 text-red-400 border border-red-500/30 backdrop-blur-sm">
              {t("plp:badge.soldout", "Esgotado")}
            </span>
          )}

          {/* INSANYCK G-11 HYBRID — Imagem do produto (aspect 3/4 com padding) */}
          {/* INSANYCK HOTFIX G-11.2 — Removed z-10 (CSS controls z-index stack now) */}
          {/* INSANYCK STEP P0-CARDS — Bulletproof container: bg + rounded prevents "ghost" cards */}
          <div className={`relative overflow-hidden rounded-2xl bg-white/[0.02] ${
            variant === "wide" ? "aspect-[2/1]" : "aspect-[3/4]"
          }`}>
            <OptimizedImage
              src={img}
              alt={`${product.title} — ${t("common:aria.productImage", "Imagem do produto")}`}
              aspectRatio={aspectRatio}
              fallbackSrc="/products/placeholder/front.webp"
              sizes={variant === "wide"
                ? "(max-width: 768px) 90vw, (max-width: 1280px) 60vw, 50vw"
                : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              }
              className="object-contain p-6 transition-transform duration-300 group-hover:scale-[1.02]"
              loading={priority ? "eager" : "lazy"}
              priority={priority}
            />
          </div>
        </div>
      </Link>

      {/* INSANYCK G-11 HYBRID — Pedestal (nome + preço + ações) */}
      <div className="ins-pedestal">
        <h3 className="ins-pedestal__name">{product.title}</h3>
        <p className="ins-pedestal__price">{product.price}</p>

        {/* INSANYCK STEP G-FIX-CHECKOUT-LUXURY — Ações com Micro-interações */}
        <ProductCardActions
          product={product}
          img={img}
          priceCents={priceCents}
        />
      </div>
    </article>
  );
}

// INSANYCK STEP G-FIX-CHECKOUT-LUXURY — Componente de Ações (separado para clarity)
function ProductCardActions({
  product,
  img,
  priceCents,
}: {
  product: ProductCardData;
  img: string;
  priceCents: number;
}) {
  const { t } = useTranslation(["plp", "cart"]);
  const addItem = useCartStore((s) => s.addItem);
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle');

  // INSANYCK STEP G-FIX-CHECKOUT-LUXURY — Handler com feedback visual
  const handleAddToCart = async () => {
    if (!product.hasValidVariant || !product.variantId || buttonState !== 'idle') return;

    setButtonState('loading');

    try {
      addItem({
        slug: product.slug,
        title: product.title,
        priceCents,
        image: img,
        variantId: product.variantId,
        sku: product.sku,
        currency: 'BRL',
        qty: 1,
      });

      setButtonState('success');

      // Reset após animação
      setTimeout(() => setButtonState('idle'), 1500);
    } catch (error) {
      setButtonState('idle');
      console.error('[ProductCard] Add to cart failed:', error);
    }
  };

  return (
    <div className="mt-4 flex gap-2 items-center">
      {/* INSANYCK STEP G-FIX-CHECKOUT-LUXURY — CTA Condicional */}
      {product.hasValidVariant && product.variantId ? (
        // ===== CTA ATIVO: Adicionar ao Carrinho com Micro-interações =====
        <motion.button
          onClick={handleAddToCart}
          disabled={buttonState !== 'idle'}
          className={`
            group relative flex-1 py-2.5 px-3 rounded-lg font-semibold text-sm
            transition-all duration-200 ease-out
            ${buttonState === 'success'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-white text-black hover:bg-white/90 border border-transparent'
            }
            disabled:opacity-60 disabled:cursor-wait
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black
          `}
          whileHover={buttonState === 'idle' ? { scale: 1.02 } : {}}
          whileTap={buttonState === 'idle' ? { scale: 0.98 } : {}}
          aria-label={t("cart:addToCart", "Adicionar ao carrinho")}
        >
          <AnimatePresence mode="wait">
            {buttonState === 'idle' && (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center gap-1.5"
              >
                <ShoppingBagIcon />
                <span className="hidden sm:inline">{t("plp:addToCart", "Adicionar")}</span>
              </motion.span>
            )}

            {buttonState === 'loading' && (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="flex items-center justify-center"
              >
                <LoadingSpinner />
              </motion.span>
            )}

            {buttonState === 'success' && (
              <motion.span
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center gap-1.5"
              >
                <CheckIcon />
                <span className="hidden sm:inline">{t("plp:added", "Adicionado!")}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      ) : (
        // ===== CTA DEGRADADO: Ver Detalhes (Ghost Button) =====
        <Link
          href={`/produto/${product.slug}`}
          prefetch
          className={`
            group relative flex-1 text-center py-2.5 px-3 rounded-lg font-semibold text-sm
            bg-white/[0.04] border border-white/[0.12]
            text-white/80 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.20]
            transition-all duration-200 ease-out
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black
          `}
        >
          <span className="flex items-center justify-center gap-1.5">
            <EyeIcon />
            <span className="hidden sm:inline">{t("plp:viewDetails", "Ver Detalhes")}</span>
          </span>
        </Link>
      )}

      {/* Wishlist button */}
      <WishlistButton
        slug={product.slug}
        title={product.title}
        priceCents={priceCents}
        image={img}
        className="p-2.5 rounded-lg border border-white/15 text-white hover:bg-white/8 hover:border-white/25 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      />
    </div>
  );
}

// INSANYCK STEP G-FIX-CHECKOUT-LUXURY — Micro-componentes de ícones
function ShoppingBagIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
