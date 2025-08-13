// INSANYCK STEP 5
// src/pages/loja.tsx
import Head from "next/head";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import ProductGrid from "@/components/ProductGrid";
import { products } from "@/data/products.mock";

type Props = {};

export default function Loja(_props: InferGetStaticPropsType<typeof getStaticProps>) {
  const { t } = useTranslation(["plp"]);

  return (
    <>
      <Head>
        <title>{t("plp:title", "Loja INSANYCK")}</title>
        <meta
          name="description"
          content={t("plp:subtitle", "Vidro leve • borda hairline")}
        />
      </Head>

      <main className="mx-auto max-w-[1200px] px-6 pt-24 pb-16">
        <h1 className="text-white/95 text-[40px] font-semibold tracking-[-0.01em]">
          {t("plp:title", "Loja INSANYCK")}
        </h1>
        <p className="mt-2 text-white/60">
          {t("plp:subtitle", "6 produto(s) • Vidro leve • borda hairline")}
        </p>

        {/* Filtros fakes – UI apenas */}
        <div className="mt-8 flex flex-wrap items-center gap-3 text-white/75">
          <button className="rounded-full px-4 py-2 border border-white/15 hover:bg-white/5">
            {t("plp:filters.category", "Categoria")}
          </button>
          <button className="rounded-full px-3 py-2 border border-white/15 hover:bg-white/5">
            P
          </button>
          <button className="rounded-full px-3 py-2 border border-white/15 hover:bg-white/5">
            M
          </button>
          <button className="rounded-full px-3 py-2 border border-white/15 hover:bg-white/5">
            G
          </button>
          <button className="rounded-full px-3 py-2 border border-white/15 hover:bg-white/5">
            EG
          </button>
          <button className="rounded-full px-4 py-2 border border-white/15 hover:bg-white/5">
            {t("plp:filters.price", "Preço")}
          </button>
          <button className="rounded-full px-4 py-2 border border-white/15 hover:bg-white/5">
            {t("plp:filters.sort", "Relevância")}
          </button>
        </div>

        <div className="mt-8">
          <ProductGrid items={products} />
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "pt", ["common", "nav", "plp"])),
    },
  };
};
