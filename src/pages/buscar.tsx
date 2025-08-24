// INSANYCK STEP 11 — Search Page with DB Integration
import Head from "next/head";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import ProductGrid from "@/components/ProductGrid";
import { ProductCardData } from "@/types/product";

export default function BuscarPage() {
  const { t } = useTranslation(["search", "ui"]);
  const router = useRouter();
  const q = typeof router.query.q === "string" ? router.query.q.trim() : "";

  const [hydrated, setHydrated] = useState(false);
  const [results, setResults] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => setHydrated(true), []);

  // INSANYCK STEP 11 — Search products via API
  useEffect(() => {
    if (!hydrated) return;
    
    const performSearch = async () => {
      if (!q) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('[Search] Error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [q, hydrated]);

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
        <title>{q ? `${t("search:resultsFor", "Resultados para")} "${q}" — INSANYCK` : `Buscar — INSANYCK`}</title>
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

          <div className="mt-8">
            {/* INSANYCK STEP 11 — DB-powered search with premium skeleton fallback */}
            <ProductGrid 
              items={results} 
              showSkeleton={!hydrated || loading}
              skeletonCount={8}
            />
          </div>
          
          {hydrated && !loading && results.length === 0 && q && (
            <div className="mt-8 text-center py-12">
              <p className="text-white/70">{t("search:noResults", "Nenhum resultado encontrado")}</p>
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
