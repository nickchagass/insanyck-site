// INSANYCK STEP 6 — Botão Add to Cart
// src/components/AddToCartButton.tsx
"use client";

import { useCartStore } from "@/store/cart";
import { parseToCents } from "@/lib/price";
import { useTranslation } from "next-i18next";
import { ReactNode, useState } from "react";
// INSANYCK STEP 4 · Lote 3 — Enhanced button with micro-interactions
import { motion } from "framer-motion";

type MinimalProduct = {
  slug: string;
  title: string;
  image?: string;
  price?: string | number;
  priceCents?: number;
  variant?: string;
  // INSANYCK STEP 10 — Novos campos para integração com variantes
  variantId?: string;
  sku?: string;
  currency?: string;
};

type Props = {
  product: MinimalProduct;
  qty?: number;
  openMiniCart?: boolean;
  className?: string;
  children?: ReactNode; // permite manter seu visual existente
  disabled?: boolean; // INSANYCK STEP 10 — Para desabilitar quando sem estoque
  // INSANYCK STEP 4 · Lote 3 — Loading state support
  loading?: boolean;
};

export default function AddToCartButton({
  product,
  qty = 1,
  openMiniCart = true,
  className,
  children,
  disabled = false,
  loading = false,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useCartStore((s) => s.toggle);
  const { t } = useTranslation(["cart"]);
  // INSANYCK STEP 4 · Lote 3 — Internal loading state for smooth UX
  const [isAdding, setIsAdding] = useState(false);

  const handle = async () => {
    if (isAdding || loading) return;
    
    setIsAdding(true);
    
    try {
      const priceCents =
        typeof product.priceCents === "number"
          ? product.priceCents
          : parseToCents(product.price ?? 0);

      addItem({
        slug: product.slug,
        title: product.title,
        image: product.image,
        priceCents,
        currency: 'BRL',
        qty,
        // INSANYCK STEP 10 — Novos campos
        variantId: product.variantId,
        sku: product.sku,
        options: product.variant ? { variant: product.variant } : undefined,
      });

      if (openMiniCart) toggle(true);
      
      // INSANYCK STEP 4 · Lote 3 — Brief delay for better UX feedback
      await new Promise(resolve => setTimeout(resolve, 150));
    } finally {
      setIsAdding(false);
    }
  };

  const isDisabled = disabled || loading || isAdding;

  return (
    <motion.button
      type="button"
      onClick={handle}
      disabled={isDisabled}
      className={
        className ||
        "bg-white text-black rounded-xl px-6 py-3 font-semibold hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      }
      aria-label={t("cart:addToCart", "Adicionar ao carrinho")}
      aria-busy={isAdding || loading}
      data-state={isAdding || loading ? "loading" : "idle"}
      // INSANYCK STEP 4 · Lote 3 — Subtle micro-interactions
      whileHover={!isDisabled ? { scale: 1.015 } : undefined}
      whileTap={!isDisabled ? { scale: 0.985 } : undefined}
      transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
    >
      {(isAdding || loading) && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children || t("cart:addToCart", "Adicionar ao carrinho")}
    </motion.button>
  );
}
