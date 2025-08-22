// INSANYCK STEP 9 — Favoritos com bloom + skeleton e mapeamento correto pro ProductGrid
import Head from "next/head";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import ProductGrid from "@/components/ProductGrid";
import Skeleton from "@/components/Skeleton";
import { useWishlist } from "@/store/wishlist";

export default function FavoritosPage() {
  const { t } = useTranslation(["wishlist", "plp"]);
  const [hydrated, setHydrated] = useState(false);
  const items = useWishlist((s) => s.items);

  useEffect(() => setHydrated(true), []);

  // Adapta ao ProductCard/Grid (mesmo shape dos mocks)
  const products = items.map((it) => ({
    slug: it.slug,
    title: it.title,
    price: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      (it.priceCents || 0) / 100
    ),
    images: { front: it.image },
    thumbs: { front: it.image },
    status: "normal" as const,
  }));

  return (
    <>
      <Head>
        <title>{t("wishlist:title", "Favoritos")} — INSANYCK</title>
        <meta name="description" content={t("wishlist:description", "Seus produtos favoritos")} />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: items.map((p, idx) => ({
                "@type": "ListItem",
                position: idx + 1,
                url: `/produto/${p.slug}`,
                name: p.title,
                image: p.image || "",
              })),
            }),
          }}
        />
      </Head>

      <main className="pt-[120px] insanyck-bloom insanyck-bloom--soft">
        <div className="mx-auto max-w-[1280px] px-6">
          <h1 className="text-white/90 text-2xl font-semibold">
            {t("wishlist:title", "Favoritos")} {hydrated ? <span className="text-white/50">({items.length})</span> : null}
          </h1>

          {!hydrated ? (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <article key={i} className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <Skeleton.Thumb />
                  <div className="mt-3 space-y-2">
                    <Skeleton.TextLg className="w-4/5" />
                    <Skeleton.Text className="w-2/5" />
                  </div>
                </article>
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="mt-8 text-white/70">{t("wishlist:empty", "Nenhum favorito ainda.")}</p>
          ) : (
            <div className="mt-8">
              <ProductGrid products={products as any} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "pt", [
        "common",
        "nav",
        "plp",
        "wishlist",
        "ui"
      ])),
      revalidate: 60,
    },
  };
};
