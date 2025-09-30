// INSANYCK STEP 10 — PLP lendo DB com filtros reais
// INSANYCK STEP 5 + STEP 9 (bloom sutil) + DB integration

import Head from "next/head";
import { seoPLP } from "@/lib/seo";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import ProductGrid from "@/components/ProductGrid";

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | undefined;
  pricing: {
    minCents: number;
    maxCents: number;
    currency: string;
  };
  availability: {
    inStock: boolean;
    totalStock: number;
  };
  variantCount: number;
  isFeatured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface LojaProps {
  initialProducts: Product[];
  categories: Category[];
  totalProducts: number;
}

export default function Loja({
  initialProducts,
  categories,
  totalProducts,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation(["plp", "catalog"]);
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);

  const { category, size, color, inStock, sort = "newest" } = router.query;
  // Normalize category param for SEO
  const categorySlug = Array.isArray(category) ? category[0] : category;
  const categoryName = categories.find(c => c.slug === (categorySlug ?? ""))?.name;

  // INSANYCK STEP 10 — Normalizar tipos de query (evitar string[])
  const asStr = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : (v ?? '');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (category) params.set("category", asStr(category));
      if (size)     params.set("size",     asStr(size));
      if (color)    params.set("color",    asStr(color));
      if (inStock)  params.set("inStock",  asStr(inStock));
      if (sort)     params.set("sort",     asStr(sort));

      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [category, color, inStock, size, sort]);

  useEffect(() => {
    fetchProducts();
  }, [router.query, fetchProducts]);

  const updateFilter = (key: string, value: string | null) => {
    const newQuery = { ...router.query };
    
    if (value) {
      newQuery[key] = value;
    } else {
      delete newQuery[key];
    }

    router.push({ pathname: router.pathname, query: newQuery }, undefined, {
      shallow: true,
    });
  };

  const isFilterActive = (key: string, value: string) => {
    return router.query[key] === value;
  };

  // INSANYCK FIX — Safe mapping para suportar legacy + variants schemas
  const toCard = (product: any) => {
    // Obter minCents por ordem de preferência
    let minCents = 0;
    if (product.pricing?.minCents) {
      minCents = product.pricing.minCents;
    } else if (product.variants?.length > 0) {
      const activeVariant = product.variants.find((v: any) => v.status === 'active');
      if (activeVariant?.price?.cents) {
        minCents = activeVariant.price.cents;
      }
    }

    // Montar priceDisplay
    const priceDisplay = minCents > 0 
      ? (minCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : "Consulte";

    // inStock por ordem de preferência
    let inStock = false;
    if (product.availability?.inStock !== undefined) {
      inStock = product.availability.inStock;
    } else if (product.variants?.length > 0) {
      inStock = product.variants.some((v: any) => 
        v.status === 'active' && 
        ((v.inventory?.quantity ?? 0) > (v.inventory?.reserved ?? 0))
      );
    }

    // imageFront por ordem de preferência
    const imageFront = product.image || 
                      product.images?.[0]?.url || 
                      "/products/placeholder/front.webp";

    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: priceDisplay,
      status: inStock ? undefined : ("soldout" as const),
      images: {
        front: imageFront,
      },
      thumbs: {
        front: imageFront,
      },
    };
  };

  // INSANYCK STEP 10 — Converter produtos para formato do ProductGrid existente
  const gridProducts = products.map(toCard);

  return (
    <>
      <Head>
        {(() => {
          const seo = seoPLP({
            locale: router.locale ?? "pt",
            categorySlug: categorySlug ?? undefined,
            categoryName,
            productCount: totalProducts,
          });
          return (
            <>
              <title>{seo.title}</title>
              {seo.meta.map((tag, i) => <meta key={i} {...tag} />)}
              {seo.link.map((l, i) => <link key={i} {...l} />)}
              {seo.jsonLd.map((schema, i) => (
                <script key={i} type="application/ld+json"
                  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
              ))}
            </>
          );
        })()}
      </Head>

      {/* INSANYCK STEP 9 — bloom sutil; não altera layout/tipografia */}
      <main className="mx-auto max-w-[1200px] px-6 pt-24 pb-16 insanyck-bloom insanyck-bloom--soft">
        <h1 className="text-white/95 text-[40px] font-semibold tracking-[-0.01em]">
          {t("plp:title", "Loja INSANYCK")}
        </h1>
        <p className="mt-2 text-white/60">
          {t("plp:subtitle", `${totalProducts} produto(s) • Vidro leve • borda hairline`)}
        </p>

        {/* INSANYCK STEP 10 — Filtros reais funcionais */}
        <div className="mt-8 flex flex-wrap items-center gap-3 text-white/75">
          {/* Categorias */}
          <label htmlFor="category-filter" className="sr-only">
            {t("catalog:filters.category_label", "Filtrar por categoria")}
          </label>
          <select
            id="category-filter"
            value={Array.isArray(category) ? category[0] : (category ?? "")}
            onChange={(e) => updateFilter("category", e.target.value || null)}
            className="rounded-full px-4 py-2 border border-white/15 bg-black/50 hover:bg-white/5 text-white"
            aria-label={t("catalog:filters.category_label", "Filtrar por categoria")}
          >
            <option value="">{t("catalog:filters.all_categories", "Todas Categorias")}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Tamanhos */}
          {["P", "M", "G", "EG"].map((sizeOption) => (
            <button
              key={sizeOption}
              onClick={() =>
                updateFilter("size", isFilterActive("size", sizeOption) ? null : sizeOption)
              }
              className={`rounded-full px-3 py-2 border border-white/15 hover:bg-white/5 transition-colors ${
                isFilterActive("size", sizeOption) ? "bg-white/20 text-white" : ""
              }`}
            >
              {sizeOption}
            </button>
          ))}

          {/* Filtro de estoque */}
          <button
            onClick={() =>
              updateFilter("inStock", isFilterActive("inStock", "true") ? null : "true")
            }
            className={`rounded-full px-4 py-2 border border-white/15 hover:bg-white/5 transition-colors ${
              isFilterActive("inStock", "true") ? "bg-white/20 text-white" : ""
            }`}
          >
            {t("catalog:filters.in_stock", "Em Estoque")}
          </button>

          {/* Ordenação */}
          <label htmlFor="sort-filter" className="sr-only">
            {t("catalog:sort.label", "Ordenar por")}
          </label>
          <select
            id="sort-filter"
            value={String(sort ?? 'newest')}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="rounded-full px-4 py-2 border border-white/15 bg-black/50 hover:bg-white/5 text-white"
            aria-label={t("catalog:sort.label", "Ordenar por")}
          >
            <option value="newest">{t("catalog:sort.newest", "Mais Recentes")}</option>
            <option value="name">{t("catalog:sort.name", "Nome")}</option>
            <option value="price_asc">{t("catalog:sort.price_asc", "Menor Preço")}</option>
            <option value="price_desc">{t("catalog:sort.price_desc", "Maior Preço")}</option>
          </select>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full"></div>
            </div>
          ) : (
            <ProductGrid items={gridProducts} />
          )}
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<LojaProps> = async ({
  locale,
  query,
  res
}) => {
  // INSANYCK STEP 10 — ISR usando res.revalidate (Pages Router)
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=600, stale-while-revalidate=86400'
  );

  try {
    const { category, size, color, inStock, sort = "newest" } = query;

    // Import fallback utilities
    const { withDb } = await import('@/lib/db/prismaGuard');
    const { mockProducts, mockCategories } = await import('@/mock/products');

    // Construir filtros
    const where: any = { status: "active" };

    if (category) {
      where.category = { slug: category as string };
    }

    if (size || color || inStock === "true") {
      where.variants = {
        some: {
          status: "active",
          ...(size ? {
            options: {
              some: {
                optionValue: {
                  option: { slug: "size" },
                  value: size as string,
                },
              },
            },
          } : {}),
          ...(color ? {
            options: {
              some: {
                optionValue: {
                  option: { slug: "color" },
                  slug: color as string,
                },
              },
            },
          } : {}),
          ...(inStock === "true" ? {
            inventory: { quantity: { gt: 0 } },
          } : {}),
        },
      };
    }

    // Buscar produtos e categorias com fallback
    const [products, categories, totalProducts] = await withDb(
      async (prisma) => Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: true,
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
          orderBy: sort === "name" ? { title: "asc" } : { updatedAt: "desc" },
          take: 12,
        }),
        prisma.category.findMany({
          orderBy: { name: "asc" },
        }),
        prisma.product.count({ where }),
      ]),
      [mockProducts as any, mockCategories as any, mockProducts.length]
    );

    // Transformar produtos
    const transformedProducts = products.map((product) => {
      const activeVariants = product.variants.filter((v) => v.status === "active");
      const prices = activeVariants.map((v) => v.price?.cents || 0).filter((p) => p > 0);
      
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      
      const totalStock = activeVariants.reduce((sum, v) => {
        const available = (v.inventory?.quantity || 0) - (v.inventory?.reserved || 0);
        return sum + Math.max(0, available);
      }, 0);

      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        image: product.images[0]?.url,
        pricing: {
          minCents: minPrice,
          maxCents: maxPrice,
          currency: "BRL",
        },
        availability: {
          inStock: totalStock > 0,
          totalStock,
        },
        variantCount: activeVariants.length,
        isFeatured: product.isFeatured,
      };
    });

    return {
      props: {
        initialProducts: transformedProducts,
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        })),
        totalProducts,
        ...(await serverSideTranslations(locale ?? "pt", ["common", "nav", "plp", "catalog"])),
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      props: {
        initialProducts: [],
        categories: [],
        totalProducts: 0,
        ...(await serverSideTranslations(locale ?? "pt", ["common", "nav", "plp", "catalog"])),
      },
    };
  }
};
