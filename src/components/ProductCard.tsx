// INSANYCK STEP 11 — ProductCard with Real Prisma Types
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ProductCardData } from "@/types/product";
import { useTranslation } from "next-i18next";

// INSANYCK STEP 6 — botão de carrinho
import AddToCartButton from "@/components/AddToCartButton";

// INSANYCK STEP 8 — botão de favoritos
import WishlistButton from "@/components/WishlistButton"; // INSANYCK STEP 8

type Props = { product: ProductCardData };

export default function ProductCard({ product }: Props) {
  const { t } = useTranslation(["plp", "cart"]);

  const img =
    product.thumbs?.front ||
    product.images?.front ||
    "/products/placeholder/front.webp";

  // INSANYCK STEP 11 — converte preço para centavos (aceita string "R$ 199,90" ou number)
  const priceCents =
    typeof product.price === "number"
      ? Math.round(product.price * 100)
      : (() => {
          const val = Number(
            String(product.price)
              .replace(/[^\d,.-]/g, "") // remove símbolos e espaços
              .replace(/\./g, "")        // remove separadores de milhar
              .replace(",", ".")         // vírgula -> ponto decimal
          );
          return Number.isFinite(val) ? Math.round(val * 100) : 0;
        })();

  return (
    <motion.article
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-white/10 bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden focus-within:ring-2 focus-within:ring-white/20"
    >
      {/* Área clicável (imagem + título) */}
      <Link
        href={`/produto/${product.slug}`}
        prefetch
        className="block group"
        aria-label={`${t("plp:viewDetails", "Ver detalhes")} — ${product.title}`}
      >
        {/* INSANYCK STEP A — aspect 3/4 para consistência PLP */}
        <div className="relative w-full aspect-[3/4] overflow-hidden">
          <Image
            src={img}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Conteúdo textual + ações */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-white/90 text-lg font-semibold insanyck-reset-text">
            {product.title}
          </h3>
          {product.status === "new" ? (
            <span className="ml-3 text-xs rounded-full px-2 py-1 bg-white/10 text-white/80">
              {t("plp:badge.new", "Novo")}
            </span>
          ) : null}
          {product.status === "soldout" ? (
            <span className="ml-3 text-xs rounded-full px-2 py-1 bg-white/5 text-white/50 border border-white/10">
              {t("plp:badge.soldout", "Esgotado")}
            </span>
          ) : null}
        </div>

        <div className="mt-2 text-white/70">{product.price}</div>

        {/* Ações – mantém visual; adiciona carrinho sem alterar layout */}
        <div className="mt-4 flex gap-3 items-center">
          <Link
            href={`/produto/${product.slug}`}
            prefetch
            className="rounded-xl px-4 py-2 text-sm font-semibold border border-white/15 text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition"
          >
            {t("plp:viewDetails", "Ver detalhes")}
          </Link>

          {/* INSANYCK STEP 6 — botão de adicionar ao carrinho */}
          <AddToCartButton
            product={{
              slug: product.slug,
              title: product.title,
              image: img,
              price: product.price, // componente converte se for string
            }}
            className="rounded-xl px-4 py-2 text-sm font-semibold border border-white/15 text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition"
          >
            {t("cart:addToCart", "Adicionar ao carrinho")}
          </AddToCartButton>

          {/* INSANYCK STEP 8 — Wishlist inline (ao lado dos CTAs) */}
          <WishlistButton
            slug={product.slug}
            title={product.title}
            priceCents={priceCents}
            image={img}
          />
        </div>
      </div>
    </motion.article>
  );
}
