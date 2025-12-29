// INSANYCK STEP 10 — PLP lendo DB com filtros reais
// INSANYCK STEP 5 + STEP 9 (bloom sutil) + DB integration
// INSANYCK STEP G-04.2.1 — Guard console.error no frontend
// INSANYCK STEP G-05.X — Showroom Enterprise (Desktop) + Vertical Luxury (Mobile)

import Head from "next/head";
import { seoPLP } from "@/lib/seo";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback, useRef } from "react";
import ShowroomGrid from "@/components/catalog/ShowroomGrid";
import ShowroomSidebar from "@/components/catalog/ShowroomSidebar";
import MobileFiltersSheet from "@/components/catalog/MobileFiltersSheet";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

// INSANYCK STEP G-05B — Titanium Glass V3
import DsGlass from "@/components/ds/DsGlass";

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  // INSANYCK STEP G-FIX-CHECKOUT-LUXURY — Seleção Preditiva de Variante
  // Seleciona a variante com MELHOR disponibilidade (maior estoque)
  const selectBestVariant = (variants: any[]): {
    variantId?: string;
    sku?: string;
    hasValidVariant: boolean;
  } => {
    if (!variants || variants.length === 0) {
      return { hasValidVariant: false };
    }

    // Filtrar variantes ativas
    const activeVariants = variants.filter((v: any) => v && v.status === 'active');

    if (activeVariants.length === 0) {
      return { hasValidVariant: false };
    }

    // Calcular disponibilidade: quantity - reserved
    const withAvailability = activeVariants.map((v: any) => ({
      id: v.id,
      sku: v.sku,
      available: (v.inventory?.quantity ?? 0) - (v.inventory?.reserved ?? 0),
    }));

    // Ordenar por disponibilidade (maior primeiro)
    const sorted = withAvailability.sort((a, b) => b.available - a.available);

    // Pegar a melhor variante
    const best = sorted[0];

    // Se a melhor tem estoque > 0, é válida
    const hasValidVariant = best.available > 0;

    return {
      variantId: best.id,
      sku: best.sku,
      hasValidVariant,
    };
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

    // INSANYCK STEP G-FIX-CHECKOUT-LUXURY — Selecionar melhor variante
    const bestVariant = selectBestVariant(product.variants || []);

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
      // INSANYCK STEP G-FIX-CHECKOUT-LUXURY — Injetar variante selecionada
      ...bestVariant,
    };
  };

  // INSANYCK STEP 10 — Converter produtos para formato do ProductGrid existente
  const gridProducts = products.map(toCard);

  // INSANYCK STEP G-05.X — Helper functions for topbar
  const updateFilter = (key: string, value: string | null) => {
    const newQuery = { ...router.query };
    if (value) {
      newQuery[key] = value;
    } else {
      delete newQuery[key];
    }
    router.push({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
  };

  const activeFiltersCount = [category, size, inStock].filter(Boolean).length;

  const sortOptions = [
    { value: "newest", label: t("catalog:sort.newest", "Mais Recentes") },
    { value: "name", label: t("catalog:sort.name", "Nome") },
    { value: "price_asc", label: t("catalog:sort.price_asc", "Menor Preço") },
    { value: "price_desc", label: t("catalog:sort.price_desc", "Maior Preço") },
  ];

  const [sortPopoverOpen, setSortPopoverOpen] = useState(false);

  // INSANYCK STEP G-EXEC-P0 — Click-outside detection refs for sort popover
  const sortRootRefDesktop = useRef<HTMLDivElement>(null);
  const sortRootRefMobile = useRef<HTMLDivElement>(null);

  // INSANYCK STEP G-EXEC-P0 — Click-outside handler for sort popover
  useEffect(() => {
    if (!sortPopoverOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideDesktop = sortRootRefDesktop.current && !sortRootRefDesktop.current.contains(target);
      const clickedOutsideMobile = sortRootRefMobile.current && !sortRootRefMobile.current.contains(target);

      if (clickedOutsideDesktop || clickedOutsideMobile) {
        setSortPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sortPopoverOpen]);

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

      {/* INSANYCK STEP G-05.X — Showroom Enterprise (Desktop) + Vertical Luxury (Mobile) */}
      {/* INSANYCK HOTFIX G-05.X — pt-24/32 para evitar colisão com navbar */}
      {/* INSANYCK STEP MUSEUM-VAULT — plp-scope enables all scoped PLP tokens/classes */}
      <main className="plp-scope min-h-screen pt-24 lg:pt-32">

        {/* MOBILE: Compact Atmospheric Header (NO figurative image) */}
        <section className="lg:hidden relative py-12 px-6 border-b border-white/10">
          <div className="max-w-[1200px] mx-auto text-center">
            <h1 className="text-3xl font-bold text-white/95 tracking-tight mb-2">
              {t("plp:title", "Showroom INSANYCK")}
            </h1>
            <p className="text-sm text-white/70">
              {t("plp:subtitle", "Coleção premium • Design exclusivo")}
            </p>
          </div>
        </section>

        {/* DESKTOP: Showroom Layout (Sidebar + Main) */}
        {/* INSANYCK HOTFIX G-05.X — Centralização elegante em monitores grandes */}
        <div className="hidden lg:block">
          <div className="max-w-[1400px] xl:max-w-[1520px] mx-auto px-6 py-8">
            <div className="flex gap-8">
              {/* DESKTOP SIDEBAR — Filters */}
              <ShowroomSidebar categories={categories} />

              {/* DESKTOP MAIN AREA */}
              <div className="flex-1 min-w-0">
                {/* INSANYCK STEP G-11 — Museum Ambient Container (blur pesado) */}
                <DsGlass tone="ambient" padding="p-6 lg:p-8">
                  {/* Compact Header */}
                  <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white/95 tracking-tight mb-2">
                      {t("plp:title", "Showroom INSANYCK")}
                    </h1>
                    <p className="text-lg text-white/70">
                      {t("plp:subtitle", "Coleção premium • Design exclusivo • Qualidade superior")}
                    </p>
                  </div>

                  {/* Topbar: Product count + Sort */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <span className="text-sm text-white/60">
                    {totalProducts} {t("plp:products_count", "produtos")}
                  </span>

                  {/* Sort dropdown */}
                  {/* INSANYCK STEP P0-SORT — cursor-pointer para UX clicável */}
                  <div ref={sortRootRefDesktop} className="relative">
                    <button
                      onClick={() => setSortPopoverOpen(!sortPopoverOpen)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cold-ray-ring)]"
                    >
                      <span>{sortOptions.find(opt => opt.value === sort)?.label}</span>
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    </button>

                    {sortPopoverOpen && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/15 rounded-xl shadow-xl z-50">
                        <div className="p-2">
                          {sortOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                updateFilter("sort", option.value);
                                setSortPopoverOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cold-ray-ring)] ${
                                sort === option.value
                                  ? "bg-white/15 text-white"
                                  : "text-white/80 hover:bg-white/10"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                  {/* Desktop Grid */}
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
                </DsGlass>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE: Content (Filters pill + Grid) */}
        <div className="lg:hidden px-6 py-6">
          {/* Mobile: Floating Filters Pill + Sort */}
          {/* INSANYCK STEP P0-SORT — cursor-pointer para UX clicável */}
          <div className="flex gap-3 mb-6 sticky top-24 z-40 bg-black/40 backdrop-blur-md -mx-6 px-6 py-3 border-b border-white/10">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cold-ray-ring)]"
            >
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              <span>{t("catalog:filters.label", "Filtros")}</span>
              {activeFiltersCount > 0 && (
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort pill */}
            <div ref={sortRootRefMobile} className="relative flex-1">
              <button
                onClick={() => setSortPopoverOpen(!sortPopoverOpen)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cold-ray-ring)]"
              >
                <span className="truncate">{sortOptions.find(opt => opt.value === sort)?.label}</span>
                <ChevronDown className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              </button>

              {sortPopoverOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/15 rounded-xl shadow-xl z-50">
                  <div className="p-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          updateFilter("sort", option.value);
                          setSortPopoverOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cold-ray-ring)] ${
                          sort === option.value
                            ? "bg-white/15 text-white"
                            : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* INSANYCK STEP G-11 — Museum Ambient Container (Mobile) */}
          <DsGlass tone="ambient" padding="p-4">
            {/* Mobile Grid */}
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
          </DsGlass>
        </div>

        {/* Mobile Filters Sheet */}
        <MobileFiltersSheet
          categories={categories}
          isOpen={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
        />
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
