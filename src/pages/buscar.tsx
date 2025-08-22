// INSANYCK STEP 9
// Página de busca com bloom, skeleton e JSON-LD ItemList. Mantém estilo do grid.

import Head from "next/head";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import ProductGrid from "@/components/ProductGrid";
import { products } from "@/data/products.mock";
import Skeleton from "@/components/Skeleton";

export default function BuscarPage() {
  const { t } = useTranslation(["search", "ui"]);
  const router = useRouter();
  const q = typeof router.query.q === "string" ? router.query.q.trim() : "";

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const results = useMemo(() => {
    if (!q) return products;
    const query = q.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.slug?.toLowerCase().includes(query) ?? false)
    );
  }, [q]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: results.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `/produto/${p.slug}`,
      name: p.title,
      image: p.images?.front || "",
    })),
  };

  return (
    <>
      <Head>
        <title>
          {q ? `${t("search:resultsFor", "Resultados para")} “${q}” — INSANYCK` : `Buscar — INSANYCK`}
        </title>
        <meta name="description" content={t("search:description", "Busca INSANYCK")} />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <main className="pt-[120px] insanyck-bloom insanyck-bloom--soft">
        <div className="mx-auto max-w-[1280px] px-6">
          <h1 className="text-white/90 text-2xl font-semibold">
            {t("search:title", "Buscar")}
          </h1>
          {q ? (
            <p className="text-white/60 mt-2">
              {t("search:showing", "Exibindo resultados para")} “{q}”
            </p>
          ) : null}

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
          ) : (
            <div className="mt-8">
              <ProductGrid products={results} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "pt", ["common", "nav", "plp", "search", "ui"])),
    },
  };
};
