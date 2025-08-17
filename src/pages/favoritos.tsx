// INSANYCK STEP 8
import { GetStaticProps } from "next";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useWishlist } from "@/store/wishlist";
import ProductGrid from "@/components/ProductGrid";
import { useTranslation } from "next-i18next";

export default function Favoritos() {
  const { t } = useTranslation(["wishlist"]);
  const { items } = useWishlist();

  // Adapta ao ProductCard: precisamos de um shape parecido com mock
  const products = items.map((it) => ({
    slug: it.slug,
    title: it.title,
    price: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(it.priceCents / 100),
    images: { front: it.image },
    thumbs: { front: it.image },
    status: "normal" as const,
  }));

  return (
    <>
      <Head>
        <title>{t("wishlist:title", "Favoritos")} — INSANYCK</title>
        <meta name="description" content="Seus itens favoritos INSANYCK" />
      </Head>
      <section className="pt-[100px] pb-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <h1 className="text-3xl font-semibold tracking-wide text-white/90">
            {t("wishlist:title", "Favoritos")}
          </h1>
          <div className="mt-6">
            {products.length === 0 ? (
              <p className="text-white/70">{t("wishlist:empty", "Nenhum item nos favoritos.")}</p>
            ) : (
              <ProductGrid products={products as any} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: await serverSideTranslations(locale ?? "pt", ["common", "nav", "wishlist"]),
  };
};
