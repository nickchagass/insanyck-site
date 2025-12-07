// INSANYCK STEP 10 — PLP lendo DB com filtros reais
// INSANYCK STEP 5 + STEP 9 (bloom sutil) + DB integration
// INSANYCK STEP G-04.2.1 — Guard console.error no frontend

import Head from "next/head";
import { seoPLP } from "@/lib/seo";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import ShowroomGrid from "@/components/catalog/ShowroomGrid";
import FiltersDock from "@/components/catalog/FiltersDock";

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
  const [hasMore, setHasMore] = useState(totalProducts > initialProducts.length);
  const [page, setPage] = useState(1);

  const { category, size, color, inStock, sort = "newest" } = router.query;
  // Normalize category param for SEO
  const categorySlug = Array.isArray(category) ? category[0] : category;
  const categoryName = categories.find(c => c.slug === (categorySlug ?? ""))?.name;

  // INSANYCK STEP 10 — Normalizar tipos de query (evitar string[])
  const asStr = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : (v ?? '');

  const fetchProducts = useCallback(async (resetPage = true) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (category) params.set("category", asStr(category));
      if (size)     params.set("size",     asStr(size));
      if (color)    params.set("color",    asStr(color));
      if (inStock)  params.set("inStock",  asStr(inStock));
      if (sort)     params.set("sort",     asStr(sort));
      
      if (resetPage) {
        params.set("page", "1");
        setPage(1);
      }

      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (resetPage) {
          setProducts(data.products);
        } else {
          setProducts(prev => [...prev, ...data.products]);
        }
        setHasMore(data.products.length === 12); // Assuming 12 per page
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching products:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [category, color, inStock, size, sort]);

  useEffect(() => {
    fetchProducts(true);
  }, [router.query, fetchProducts]);

  // Load more function for infinite scroll
  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return [];
    
    const nextPage = page + 1;
    const params = new URLSearchParams();
    
    if (category) params.set("category", asStr(category));
    if (size)     params.set("size",     asStr(size));
    if (color)    params.set("color",    asStr(color));
    if (inStock)  params.set("inStock",  asStr(inStock));
    if (sort)     params.set("sort",     asStr(sort));
    params.set("page", nextPage.toString());

    try {
      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPage(nextPage);
        setHasMore(data.products.length === 12);
        return data.products.map(toCard);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error loading more products:", error);
      }
    }

    return [];
  }, [category, color, inStock, size, sort, page, loading, hasMore]);

  // Note: Filter functions moved to FiltersDock component

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

      {/* INSANYCK Showroom Catalog — Cinematic Hero + Premium Grid */}
      <main className="min-h-screen insanyck-bloom insanyck-bloom--soft">
        {/* Optional Hero Section */}
        <section className="relative py-16 px-6">
          <div className="max-w-[1200px] mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white/95 tracking-tight mb-4">
              {t("plp:title", "Showroom INSANYCK")}
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
              {t("plp:subtitle", "Coleção premium • Design exclusivo • Qualidade superior")}
            </p>
          </div>
        </section>

        {/* Filters Dock */}
        <FiltersDock categories={categories} totalProducts={totalProducts} />

        {/* Showroom Grid */}
        <section className="px-6 py-8">
          <div className="max-w-[1400px] mx-auto">
            {loading && products.length === 0 ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-12 w-12 border-2 border-white/20 border-t-white rounded-full"></div>
              </div>
            ) : (
              <ShowroomGrid 
                initialProducts={gridProducts}
                onLoadMore={loadMoreProducts}
                hasMore={hasMore}
                loading={loading}
              />
            )}
          </div>
        </section>
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
    const { sanitizeForNext } = await import('@/lib/json/sanitizeForNext');

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

    // GSSP Guard: Transformar produtos de forma defensiva
    const transformedProducts = (Array.isArray(products) ? products : [])
      .filter((p: any) => p && typeof p === 'object' && p.id)
      .map((product: any) => {
        const variants = Array.isArray(product.variants) ? product.variants : [];
        const activeVariants = variants.filter((v: any) => v && v.status === "active");
        
        const prices = activeVariants
          .map((v: any) => v?.price?.cents || 0)
          .filter((p: number) => typeof p === 'number' && p > 0);
        
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        
        const totalStock = activeVariants.reduce((sum: number, v: any) => {
          if (!v || !v.inventory) return sum;
          const available = (v.inventory.quantity || 0) - (v.inventory.reserved || 0);
          return sum + Math.max(0, available);
        }, 0);

        // GSSP Guard: Retornar objeto válido
        const images = Array.isArray(product.images) ? product.images : [];
        
        return sanitizeForNext({
          id: String(product.id),
          title: String(product.title || ''),
          slug: String(product.slug || ''),
          description: product.description ? String(product.description) : null,
          image: images.find((i: any) => i && i.url)?.url || undefined,
          pricing: {
            minCents: Number(minPrice),
            maxCents: Number(maxPrice),
            currency: "BRL",
          },
          availability: {
            inStock: Boolean(totalStock > 0),
            totalStock: Number(totalStock),
          },
          variantCount: Number(activeVariants.length),
          isFeatured: Boolean(product.isFeatured),
        });
    });

    return {
      props: {
        initialProducts: transformedProducts,
        categories: sanitizeForNext(
          (Array.isArray(categories) ? categories : [])
            .filter((c: any) => c && typeof c === 'object' && c.id)
            .map((cat: any) => ({
              id: String(cat.id),
              name: String(cat.name || ''),
              slug: String(cat.slug || ''),
            }))
        ),
        totalProducts: Number(totalProducts) || 0,
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
