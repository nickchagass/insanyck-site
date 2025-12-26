// INSANYCK STEP G-11 — Museum Showcase Edition: ProductCard as jewelry vitrine
"use client";

import Link from "next/link";
import { ProductCardData } from "@/types/product";
import { useTranslation } from "next-i18next";
// INSANYCK STEP 4 · Lote 3 — Import OptimizedImage for zero CLS
import OptimizedImage from "@/components/ui/OptimizedImage";

// INSANYCK STEP 6 — botão de carrinho
import AddToCartButton from "@/components/AddToCartButton";

// INSANYCK STEP 8 — botão de favoritos
import WishlistButton from "@/components/WishlistButton";

type Props = { product: ProductCardData };

export default function ProductCard({ product }: Props) {
  const { t } = useTranslation(["plp", "cart", "common"]);

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
    <article className="ins-simple-reflection group">
      {/* INSANYCK G-11 — Vitrine de museu com spotlight descendente */}
      <Link
        href={`/produto/${product.slug}`}
        prefetch
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-2xl"
        aria-label={`Ver detalhes de ${product.title}`}
      >
        <div className="ins-vitrine ins-spotlight">
          {/* Status badge (floating top-right) */}
          {product.status === "new" && (
            <span className="absolute top-3 right-3 z-10 text-xs rounded-full px-3 py-1 bg-white/10 text-white/80 backdrop-blur-sm">
              {t("plp:badge.new", "Novo")}
            </span>
          )}
          {product.status === "soldout" && (
            <span className="absolute top-3 right-3 z-10 ins-chip">
              {t("plp:badge.soldout", "Esgotado")}
            </span>
          )}

          {/* INSANYCK G-11 — Imagem do produto (aspect 3/4 com padding) */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <OptimizedImage
              src={img}
              alt={`${product.title} — ${t("common:aria.productImage", "Imagem do produto")}`}
              aspectRatio="3/4"
              fallbackSrc="/products/placeholder/front.webp"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-6 transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        </div>
      </Link>

      {/* INSANYCK G-11 — Pedestal (nome + preço + ações) */}
      <div className="ins-pedestal">
        <h3 className="ins-pedestal__name">{product.title}</h3>
        <p className="ins-pedestal__price">{product.price}</p>

        {/* Ações (Ver detalhes + Carrinho + Wishlist) */}
        <div className="mt-4 flex gap-2 items-center">
          <Link
            href={`/produto/${product.slug}`}
            prefetch
            className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold border border-white/15 text-white hover:bg-white/8 hover:border-white/25 active:bg-white/12 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black text-center"
          >
            {t("plp:viewDetails", "Ver detalhes")}
          </Link>

          {/* INSANYCK STEP 6 — botão de adicionar ao carrinho */}
          <AddToCartButton
            product={{
              slug: product.slug,
              title: product.title,
              image: img,
              price: product.price,
            }}
            className="rounded-lg px-3 py-2 text-sm font-semibold border border-white/15 text-white hover:bg-white/8 hover:border-white/25 active:bg-white/12 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label={t("cart:addToCart", "Adicionar ao carrinho")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </AddToCartButton>

          {/* INSANYCK STEP 8 — Wishlist inline */}
          <WishlistButton
            slug={product.slug}
            title={product.title}
            priceCents={priceCents}
            image={img}
          />
        </div>
      </div>
    </article>
  );
}
