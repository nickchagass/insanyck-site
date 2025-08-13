// INSANYCK STEP 5
// src/pages/produto/[slug].tsx
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

import ProductHeroImageKit from "@/components/ProductHeroImageKit"; // INSANYCK STEP 5
import { products, Product } from "@/data/products.mock";           // INSANYCK STEP 5

// 3D fica preservado atrás da flag
const Product3DView = dynamic(
  () => import("@/components/Product3DView").catch(() => ({ default: () => null })),
  { ssr: false }
); // INSANYCK STEP 5

const USE_IMAGE_KIT = true; // trocar para false quando quiser ativar o 3D futuramente // INSANYCK STEP 5

type Props = { product: Product };

export default function PDP({ product }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const { t } = useTranslation(["pdp", "common"]);
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
      priceCurrency: "BRL",
      price: product.price?.replace(/[^\d,]/g, "")?.replace(",", ".") || "0",
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
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      {/* HERO */}
      {USE_IMAGE_KIT ? (
        <div className="relative">
          {/* Crossfade cinematográfico entre views */}
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
                // CTAs – mantêm estilo; textos vêm do i18n no componente
                ctaBuy={() => alert(t("pdp:ctaBuy", "Comprar agora"))}
                ctaDetails={() => alert(t("pdp:ctaDetails", "Ver detalhes"))}
                // INSANYCK STEP 5
                right={
                  <div className="hidden lg:flex items-center justify-end gap-3 pr-2 text-white/50">
                    <span className="text-xs tracking-wide">60 FPS</span>
                  </div>
                }
              />
            </motion.div>
          </AnimatePresence>

          {/* Miniaturas – trocam a view sem reload */}
          {/* INSANYCK STEP 5 */}
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
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        // 3D PRESERVADO – não remover
        <Product3DView product={product as any} />
      )}

      {/* Navegação auxiliar */}
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

// SSG
export const getStaticPaths: GetStaticPaths = async () => {
  const paths = products.map((p) => ({ params: { slug: p.slug } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const slug = String(params?.slug);
  const product = products.find((p) => p.slug === slug);
  if (!product) {
    return { notFound: true };
  }
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "pt", ["common", "nav", "pdp"])),
      product,
    },
  };
};
