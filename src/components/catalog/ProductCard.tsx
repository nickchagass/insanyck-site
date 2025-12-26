// INSANYCK STEP G-11 HYBRID — Museum Showcase Edition: ProductCard SSR-safe
"use client";

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
          <div className={`relative overflow-hidden ${
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

        {/* Ações (Ver detalhes + Carrinho + Wishlist) */}
        <div className="mt-4 flex gap-2 items-center">
          <Link
            href={`/produto/${product.slug}`}
            prefetch
            className="flex-1 text-center rounded-lg px-3 py-2 text-sm font-semibold border border-white/15 text-white hover:bg-white/8 hover:border-white/25 active:bg-white/12 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
          )}

          {/* Wishlist button */}
          <WishlistButton
            slug={product.slug}
            title={product.title}
            priceCents={priceCents}
            image={img}
            className="p-2 rounded-lg border border-white/15 text-white hover:bg-white/8 hover:border-white/25 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          />
        </div>
      </div>
    </article>
  );
}
