// INSANYCK FASE G-05 — Página de novidades (produtos recém-lançados)
// 100% token-based, premium UX, DsEmptyState quando sem produtos

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { Package, Sparkles } from "lucide-react";

import Layout from "@/components/Layout";
import ShowroomGrid from "@/components/catalog/ShowroomGrid";
import DsEmptyState from "@/components/ds/DsEmptyState";
import DsButton from "@/components/ds/DsButton";
import { ProductCardData } from "@/types/product";
import prisma from "@/lib/prisma";

interface NovidadesProps {
  newProducts: ProductCardData[];
}

export default function Novidades({ newProducts }: NovidadesProps) {
  const { t } = useTranslation(["plp", "common", "nav"]);

  return (
    <>
      <Head>
        <title>{t("nav:new", "Novidades")} — INSANYCK</title>
        <meta
          name="description"
          content={t(
            "plp:new.description",
            "Confira os lançamentos mais recentes da INSANYCK. Peças exclusivas de streetwear de luxo."
          )}
        />
      </Head>

      <Layout>
        <div className="min-h-screen bg-[color:var(--ins-bg-base)]">
          {/* INSANYCK FASE G-05 — Hero premium tokenizado */}
          <section className="relative pt-24 pb-12 px-6 overflow-hidden">
            {/* Glassmorphism backdrop */}
            <div className="absolute inset-0 bg-gradient-to-b from-ds-elevated/30 to-transparent backdrop-blur-[2px] -z-10" />

            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-[color:var(--ds-accent)]" aria-hidden="true" />
                <h1 className="text-4xl md:text-5xl font-bold text-ds-accent">
                  {t("plp:new.title", "Novidades")}
                </h1>
              </div>

              <p className="text-lg text-ds-accentSoft max-w-2xl">
                {t(
                  "plp:new.subtitle",
                  "Peças recém-lançadas. Exclusividade, design premium e edição limitada."
                )}
              </p>
            </div>
          </section>

          {/* INSANYCK FASE G-05 — Grid de produtos ou DsEmptyState */}
          <section className="px-6 pb-24">
            <div className="max-w-6xl mx-auto">
              {newProducts.length > 0 ? (
                <ShowroomGrid
                  initialProducts={newProducts}
                  hasMore={false}
                  loading={false}
                />
              ) : (
                <DsEmptyState
                  icon={<Package className="w-16 h-16" />}
                  title={t("plp:new.emptyTitle", "Nenhuma novidade no momento")}
                  description={t(
                    "plp:new.emptyDescription",
                    "Estamos preparando lançamentos exclusivos. Volte em breve para conferir as novidades."
                  )}
                  primaryAction={
                    <Link href="/loja">
                      <DsButton variant="primary" size="lg">
                        {t("plp:new.browseAll", "Ver todo o catálogo")}
                      </DsButton>
                    </Link>
                  }
                  secondaryAction={
                    <Link
                      href="/"
                      className="text-sm text-ds-accentSoft hover:text-ds-accent transition-colors"
                    >
                      {t("common:backHome", "Voltar ao início")}
                    </Link>
                  }
                />
              )}
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<NovidadesProps> = async (ctx) => {
  // INSANYCK FASE G-05 — Buscar produtos marcados como "novidade" (se existir flag isFeatured ou createdAt recente)
  // Por enquanto, busca produtos recentes (últimos 30 dias) ou com isFeatured=true
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const products = await prisma.product.findMany({
      where: {
        status: "active",
        OR: [
          { isFeatured: true },
          { createdAt: { gte: thirtyDaysAgo } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        images: {
          where: { order: 1 },
          take: 1,
        },
        variants: {
          where: { status: "active" },
          include: {
            price: true,
            inventory: true,
          },
        },
      },
    });

    // Transform to ProductCardData format
    const newProducts: ProductCardData[] = products.map((p) => {
      const activeVariants = p.variants.filter((v) => v.status === "active");

      // Get prices from active variants
      const prices = activeVariants
        .map((v) => v.price?.cents || 0)
        .filter((price) => price > 0);

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

      // Calculate total stock
      const totalStock = activeVariants.reduce((sum, v) => {
        if (!v.inventory) return sum;
        const available = (v.inventory.quantity || 0) - (v.inventory.reserved || 0);
        return sum + Math.max(0, available);
      }, 0);

      // Get first image URL
      const imageUrl = p.images.length > 0 ? p.images[0].url : undefined;

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: `R$ ${(minPrice / 100).toFixed(2).replace(".", ",")}`,
        images: imageUrl ? { front: imageUrl } : undefined,
        thumbs: imageUrl ? { front: imageUrl } : undefined,
        status: totalStock === 0 ? "soldout" : p.createdAt > thirtyDaysAgo ? "new" : undefined,
      };
    });

    return {
      props: {
        newProducts,
        ...(await serverSideTranslations(ctx.locale ?? "pt", ["common", "nav", "plp"])),
      },
    };
  } catch (error) {
    console.error("Error fetching new products:", error);
    return {
      props: {
        newProducts: [],
        ...(await serverSideTranslations(ctx.locale ?? "pt", ["common", "nav", "plp"])),
      },
    };
  }
};
