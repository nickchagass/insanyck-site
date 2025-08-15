// INSANYCK STEP 6 — Botão Add to Cart
// src/components/AddToCartButton.tsx
"use client";

import { useCartStore } from "@/store/cart";
import { parseToCents } from "@/lib/price";
import { useTranslation } from "next-i18next";
import { ReactNode } from "react";

type MinimalProduct = {
  slug: string;
  title: string;
  image?: string;
  price?: string | number;
  priceCents?: number;
  variant?: string;
};

type Props = {
  product: MinimalProduct;
  qty?: number;
  openMiniCart?: boolean;
  className?: string;
  children?: ReactNode; // permite manter seu visual existente
};

export default function AddToCartButton({
  product,
  qty = 1,
  openMiniCart = true,
  className,
  children,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useCartStore((s) => s.toggle);
  const { t } = useTranslation(["cart"]);

  const handle = () => {
    const priceCents =
      typeof product.priceCents === "number"
        ? product.priceCents
        : parseToCents(product.price ?? 0);

    addItem({
      slug: product.slug,
      title: product.title,
      image: product.image,
      priceCents,
      qty,
      variant: product.variant,
    });

    if (openMiniCart) toggle(true);
  };

  return (
    <button
      type="button"
      onClick={handle}
      className={
        className ||
        "bg-white text-black rounded-xl px-6 py-3 font-semibold hover:brightness-95 transition"
      }
      aria-label={t("cart:addToCart", "Adicionar ao carrinho")}
    >
      {children || t("cart:addToCart", "Adicionar ao carrinho")}
    </button>
  );
}
