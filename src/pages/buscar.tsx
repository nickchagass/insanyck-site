// INSANYCK STEP 8
import { GetStaticProps } from "next";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import ProductGrid from "@/components/ProductGrid";
import { products } from "@/data/products.mock";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";

export default function BuscarPage() {
  const { t } = useTranslation(["search", "plp"]);
  const router = useRouter();
  const q = (router.query.q as string) ?? "";

  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return products;
    return products.filter((p) => p.title.toLowerCase().includes(term));
  }, [q]);

  return (
    <>
      <Head>
        <title>{t("search:title", "Buscar")} — INSANYCK</title>
      </Head>
      <section className="pt-[100px] pb-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <h1 className="text-3xl font-semibold tracking-wide text-white/90">{t("search:title", "Buscar")}</h1>

          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/buscar?q=${encodeURIComponent(q)}`);
            }}
          >
            <input
              defaultValue={q}
              name="q"
              className="w-full bg-transparent border border-white/15 rounded-lg px-3 py-2 outline-none text-white placeholder:text-white/40 focus:border-white/30"
              placeholder={t("search:placeholder", "Busque por produtos")}
            />
          </form>

          <div className="mt-6">
            <ProductGrid products={filtered as any} />
          </div>
        </div>
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: await serverSideTranslations(locale ?? "pt", ["common", "nav", "search", "plp"]),
  };
};
