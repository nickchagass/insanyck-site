// INSANYCK STEP 5 — PDP com hero cinematográfico + thumbs
// src/pages/produto/[slug].tsx
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

import ProductHeroImageKit from "@/components/ProductHeroImageKit";
import { products, Product } from "@/data/products.mock";
import AddToCartButton from "@/components/AddToCartButton";

// INSANYCK STEP 8 — botão de favoritos (adição)
import WishlistButton from "@/components/WishlistButton"; // INSANYCK STEP 8

type Props = { product: Product };

export default function PDP({ product }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const { t, i18n } = useTranslation(["pdp", "common", "cart"]);
  const [view, setView] = useState<"front" | "back" | "detail">("front");

  const currentImage = useMemo(() => {
    return (
      product.images?.[view] ||
      product.images?.front ||
      "/products/placeholder/front.webp"
    );
  }, [product.images, view]);

  const title = product.title;
  const subtitle = t("pdp:subtitle", "Drop-shoulder • 100% algodão premium");
  const price = product.price;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    image: Object.values(product.images || {}).filter(Boolean),
    brand: { "@type": "Brand", name: "INSANYCK" },
    offers: {
      "@type": "Offer",
      priceCurrency: i18n.language?.startsWith("en") ? "USD" : "BRL",
      price: price.replace(/[^\d,]/g, "").replace(",", "."),
      availability: "https://schema.org/InStock",
      url: `https://insanyck.com/produto/${product.slug}`,
    },
  };

  return (
    <>
      <Head>
        <title>{product.title} — INSANYCK</title>
        <meta name="description" content={subtitle} />
        <meta property="og:title" content={`${product.title} — INSANYCK`} />
        <meta property="og:description" content={subtitle} />
        <meta property="og:image" content={product.images?.front || ""} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      {/* HERO */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <ProductHeroImageKit
              title={title}
              subtitle={subtitle}
              price={price}
              image={currentImage}
              imageAlt={`${title} – ${t(`pdp:${view}`, view)}`}
              right={
                <div className="hidden lg:flex items-center justify-end gap-3 pr-2 text-white/50">
                  <span className="text-xs tracking-wide">60 FPS</span>
                </div>
              }
              left={
                // Troca “Comprar agora” por AddToCartButton (mesmo look)
                <div className="text-center lg:text-left">
                  <h1
                    id="pdp-hero-title"
                    className="text-white/95 text-[44px] leading-tight font-semibold tracking-[-0.01em]"
                  >
                    {title}
                  </h1>
                  <p className="mt-3 text-white/70 text-lg">{subtitle}</p>
                  <div className="mt-5 text-white/85 text-xl font-semibold">{price}</div>
                  <div className="mt-6 flex items-center gap-3 justify-center lg:justify-start">
                    <AddToCartButton
                      product={{
                        slug: product.slug,
                        title: product.title,
                        image: product.images?.front,
                        price: product.price,
                      }}
                      className="bg-white text-black rounded-xl px-6 py-3 font-semibold hover:brightness-95 transition"
                    >
                      {t("cart:addToCart", "Adicionar ao carrinho")}
                    </AddToCartButton>

                    <Link
                      href="#detalhes"
                      className="rounded-xl px-6 py-3 font-semibold border border-white/20 text-white hover:bg-white/5 transition"
                    >
                      {t("pdp:ctaDetails", "Ver detalhes")}
                    </Link>

                    {/* INSANYCK STEP 8 — botão de favoritos no hero (glow sutil cinematográfico) */}
                    <div className="ml-2 inline-flex align-middle drop-shadow-[0_0_14px_rgba(255,255,255,0.08)] hover:drop-shadow-[0_0_22px_rgba(255,255,255,0.14)] transition-all">
                      <WishlistButton
                        slug={product.slug}
                        title={product.title}
                        priceCents={
                          Math.round(
                            Number((product.price ?? "0").replace(/[^\d,]/g, "").replace(",", ".")) * 100
                          ) || 0
                        }
                        image={product.images?.front}
                      />
                    </div>
                    {/* FIM INSANYCK STEP 8 */}
                  </div>
                </div>
              }
            />
          </motion.div>
        </AnimatePresence>

        {/* Miniaturas */}
        <div className="mx-auto max-w-[1200px] px-6 mt-6 lg:mt-2">
          <div className="flex items-center justify-end gap-3">
            {(["front", "back", "detail"] as const).map((v) => {
              const src =
                product.thumbs?.[v] ??
                product.images?.[v] ??
                product.images?.front;
              if (!src) return null;
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`w-16 h-16 rounded-xl border overflow-hidden transition ${
                    view === v
                      ? "border-white/40 ring-2 ring-white/20"
                      : "border-white/15 hover:border-white/25"
                  }`}
                  aria-label={t(`pdp:${v}`, v)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={t(`pdp:${v}`, v)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Voltar loja */}
      <div className="mx-auto max-w-[1200px] px-6 my-14">
        <Link
          href="/loja"
          prefetch
          className="text-white/80 underline underline-offset-4 hover:text-white"
          onMouseEnter={() => router.prefetch("/loja")}
        >
          {t("pdp:backToStore", "Voltar à loja")}
        </Link>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = products.map((p) => ({ params: { slug: p.slug } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const slug = String(params?.slug);
  const product = products.find((p) => p.slug === slug);
  if (!product) return { notFound: true };
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "pt", ["common", "nav", "pdp", "cart"])),
      product,
    },
  };
};
