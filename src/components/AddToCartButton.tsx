// INSANYCK STEP 6 — Botão Add to Cart
// src/components/AddToCartButton.tsx
"use client";

import { useCartStore } from "@/store/cart";
import { parseToCents } from "@/lib/price";
import { useTranslation } from "next-i18next";
import { ReactNode, useState } from "react";
// INSANYCK FASE G-03.1 UX-10 — Toast de luxo
import { toast } from "react-toastify";
// INSANYCK FASE G-04.1 — Design System
import DsButton from "@/components/ds/DsButton";

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

      // INSANYCK FASE G-03.1 UX-10 — Toast de luxo ao adicionar ao carrinho
      const currentLang = typeof window !== 'undefined'
        ? document.documentElement.lang || 'pt'
        : 'pt';
      const toastMsg = currentLang.startsWith('en')
        ? 'Product added to cart'
        : 'Produto adicionado ao carrinho';

      toast.success(toastMsg, {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
      });

      if (openMiniCart) toggle(true);

      // INSANYCK STEP 4 · Lote 3 — Brief delay for better UX feedback
      await new Promise(resolve => setTimeout(resolve, 150));
    } finally {
      setIsAdding(false);
    }
  };

  const isDisabled = disabled || loading || isAdding;

  // INSANYCK FASE G-04.1 — Usar DsButton do Design System
  // Se className foi fornecida, usar o botão customizado (retrocompatibilidade)
  // Senão, usar DsButton padrão
  if (className) {
    // Retrocompatibilidade: manter comportamento antigo quando className é fornecida
    return (
      <button
        type="button"
        onClick={handle}
        disabled={isDisabled}
        className={className}
        aria-label={t("cart:addToCart", "Adicionar ao carrinho")}
        aria-busy={isAdding || loading}
        data-state={isAdding || loading ? "loading" : "idle"}
      >
        {children || t("cart:addToCart", "Adicionar ao carrinho")}
      </button>
    );
  }

  // INSANYCK FASE G-04.1 — Novo padrão usando DsButton
  return (
    <DsButton
      onClick={handle}
      disabled={isDisabled}
      variant="primary"
      size="lg"
      state={isAdding || loading ? "loading" : "default"}
      label={t("cart:addToCart", "Adicionar ao carrinho")}
    >
      {children || t("cart:addToCart", "Adicionar ao carrinho")}
    </DsButton>
  );
}
