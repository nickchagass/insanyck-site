// INSANYCK STEP 5
// src/components/ProductCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Product } from "@/data/products.mock";
import { useTranslation } from "next-i18next";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { t } = useTranslation(["plp"]);

  const img =
    product.thumbs?.front ||
    product.images?.front ||
    "/products/placeholder/front.webp";

  return (
    <motion.article
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-white/10 bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden focus-within:ring-2 focus-within:ring-white/20"
    >
      <Link
        href={`/produto/${product.slug}`}
        prefetch
        className="block group"
        aria-label={`${t("plp:viewDetails", "Ver detalhes")} — ${product.title}`}
      >
        <div className="relative w-full aspect-[4/5] overflow-hidden">
          <Image
            src={img}
            alt={product.title}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <h3 className="text-white/90 text-lg font-semibold">
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

          <div className="mt-4">
            <button
              className="rounded-xl px-4 py-2 text-sm font-semibold border border-white/15 text-white hover:bg-white/5 transition"
            >
              {t("plp:viewDetails", "Ver detalhes")}
            </button>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
