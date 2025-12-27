// INSANYCK HOTFIX CART-02 + FASE G-01 + FASE G-02 + ISR PERF-01 + STEP G-12 + G-12.1 — PDP Museum Edition
import Head from "next/head";
import type { GetStaticProps, GetStaticPaths, NextPage } from "next";
import { ParsedUrlQuery } from "querystring";
import { useCartStore } from "@/store/cart";
import { formatBRL, safeSerialize } from "@/lib/price";
import { useTranslation } from "next-i18next"; // INSANYCK G-12.1 — i18n
import { serverSideTranslations } from "next-i18next/serverSideTranslations"; // INSANYCK G-12.1 — i18n

// INSANYCK FASE G-02 PERF-04 — ProductStage com SSR para melhorar LCP da PDP
import ProductStage from "@/components/pdp/ProductStage";

type Variant = {
  id: string;
  sku?: string;
  title?: string;
  price?: { cents: number; currency?: string };
  inventory?: { quantity?: number; reserved?: number };
  options?: any[];
};

type Product = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  images: { url: string; alt?: string }[];
  variants: Variant[];
};

interface Params extends ParsedUrlQuery { slug: string; }

const PDP: NextPage<{ product: Product }> = ({ product }) => {
  // INSANYCK G-12.1 — i18n
  const { t } = useTranslation('pdp');

  // INSANYCK HOTFIX CART-02 — usar store oficial do Zustand
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useCartStore((s) => s.toggle);

  const v0 = product.variants?.[0];
  const price = formatBRL(v0?.price?.cents ?? 0); // INSANYCK FASE G-01 — helper centralizado
  const image = product.images?.[0]?.url || "/products/placeholder/front.webp";

  // INSANYCK HOTFIX CART-02 — delega para a store oficial
  const handleAdd = () => {
    addItem({
      slug: product.slug,
      title: product.title,
      priceCents: v0?.price?.cents ?? 0,
      currency: (v0?.price?.currency as "BRL") ?? "BRL",
      qty: 1,
      image,
      variantId: v0?.id,
      sku: v0?.sku,
    });
    // abre o drawer automaticamente (já é chamado dentro de addItem, mas deixo explícito)
    toggle(true);
  };

  // INSANYCK HOTFIX CART-02 — buyNow adiciona e redireciona
  const handleBuyNow = () => {
    addItem({
      slug: product.slug,
      title: product.title,
      priceCents: v0?.price?.cents ?? 0,
      currency: (v0?.price?.currency as "BRL") ?? "BRL",
      qty: 1,
      image,
      variantId: v0?.id,
      sku: v0?.sku,
    });
    // redireciona direto para checkout (sem abrir o drawer)
    if (typeof window !== "undefined") {
      window.location.href = "/checkout";
    }
  };

  return (
    <>
      <Head>
        <title>{product.title} • INSANYCK</title>
      </Head>

      {/* INSANYCK STEP G-12 — Museum Private Viewing Room: European breathing (160px) */}
      <main className="ins-pdp-container insanyck-section mx-auto max-w-[1360px] px-4 lg:px-6">
        <div className="grid grid-cols-12 gap-6 lg:gap-10">
          {/* INSANYCK G-12 — Museum Stage (spotlight from top + floor reflection) */}
          <section className="col-span-12 lg:col-span-7">
            <ProductStage
              imageUrl={image}
              alt={product.title}
              hint="Arraste para girar — passe o mouse"
            />
          </section>

          {/* INSANYCK G-12 — Museum Glass Pedestal (NO backdrop-filter, gradient-only) */}
          <aside className="col-span-12 lg:col-span-5">
            <div className="ins-panel ins-panel--sticky">
              <h1 className="ins-panel__title">{product.title}</h1>

              {product.description && (
                <p className="ins-panel__description">{product.description}</p>
              )}

              <div className="ins-panel__price">{price}</div>

              {/* INSANYCK G-12.1 — Variant selector (editorial refinement: removed redundant label) */}
              <div className="ins-panel__section">
                <button
                  type="button"
                  disabled={!product.variants || product.variants.length <= 1}
                  className="ins-selector ins-selector__btn w-full"
                >
                  {t('selectOptions', 'Escolha tamanho e cor')}
                </button>
              </div>

              {/* INSANYCK G-12 — Premium museum buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleBuyNow}
                  className="ins-panel__btn-primary flex-1"
                >
                  {t('ctaBuy', 'Comprar agora')}
                </button>
                <button
                  onClick={handleAdd}
                  className="ins-panel__btn-secondary px-6"
                  aria-label="Adicionar ao carrinho"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </button>
              </div>

              {/* INSANYCK G-12.1 — Trust badges (editorial refinement: icons + i18n) */}
              <div className="ins-panel__trust-list">
                <div className="ins-panel__trust-item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>{t('trust.secure', 'Pagamento seguro')}</span>
                </div>
                <div className="ins-panel__trust-item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  <span>{t('trust.exchange', 'Troca em até 30 dias')}</span>
                </div>
                <div className="ins-panel__trust-item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  <span>{t('trust.authentic', 'Autenticidade garantida')}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
};

// INSANYCK ISR PERF-01 — getStaticPaths: Pre-build top 20 produtos mais populares
export const getStaticPaths: GetStaticPaths = async () => {
  let paths: { params: { slug: string } }[] = [];

  try {
    const { prisma } = await import("@/lib/prisma");
    const products = await prisma.product.findMany({
      select: { slug: true },
      take: 20,
      orderBy: { createdAt: 'desc' }, // ou orderBy: { viewCount: 'desc' } se tiver tracking
    });
    paths = products.map(p => ({ params: { slug: p.slug } }));
  } catch (err) {
    console.error("[INSANYCK][getStaticPaths] DB offline, usando fallback:", err);
    // Se DB offline, usa mock dos top produtos
    const { mockProducts } = await import("@/mock/products");
    paths = (mockProducts as unknown as any[])
      .slice(0, 20)
      .map(p => ({ params: { slug: p.slug } }));
  }

  return {
    paths,
    fallback: 'blocking', // SEO-friendly: gera sob demanda se não estiver em cache
  };
};

// INSANYCK ISR PERF-01 + G-12.1 — getStaticProps: Cache com revalidação a cada 60s + i18n
export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params as Params;
  const lng = ctx.locale || 'pt'; // INSANYCK G-12.1 — i18n locale

  async function loadFromDb() {
    try {
      const { prisma } = await import("@/lib/prisma");
      const p = await prisma.product.findUnique({
        where: { slug },
        include: {
          images: true,
          variants: { include: { price: true, inventory: true, options: true } },
        },
      });
      if (!p) return null;
      return {
        id: String(p.id),
        slug: p.slug,
        title: p.title,
        description: p.description ?? "",
        images: (p.images ?? []).map((i: any) => ({ url: i.url, alt: i.alt ?? p.title })),
        variants: (p.variants ?? []).map((v: any, i: number) => ({
          id: String(v.id ?? `v${i + 1}`),
          sku: v.sku ?? undefined,
          title: v.title ?? undefined,
          price: { cents: Number(v.price?.cents ?? 0), currency: v.price?.currency ?? "BRL" },
          inventory: { quantity: v.inventory?.quantity ?? 0, reserved: v.inventory?.reserved ?? 0 },
          options: Array.isArray(v.options) ? v.options : [],
        })),
      } as Product;
    } catch (err: any) {
      // DB offline
      console.error("[INSANYCK][produto]", err);
      return null;
    }
  }

  let product = await loadFromDb();

  if (!product) {
    const { findBySlug, mockProducts } = await import("@/mock/products");
    const mock = findBySlug(slug) ?? (mockProducts as unknown as any[])[0];
    if (!mock) return { notFound: true };
    product = {
      id: String(mock.id),
      slug: mock.slug,
      title: mock.title,
      description: mock.description ?? "",
      images: (mock.images ?? [{ url: "/products/placeholder/front.webp" }]),
      variants: (mock.variants ?? []).map((v: any, i: number) => ({
        id: String(v.id ?? `v${i + 1}`),
        sku: v.sku ?? undefined,
        title: v.title ?? undefined,
        price: { cents: Number(v.price?.cents ?? 0), currency: v.price?.currency ?? "BRL" },
        inventory: { quantity: v.inventory?.quantity ?? 0, reserved: v.inventory?.reserved ?? 0 },
        options: Array.isArray(v.options) ? v.options : [],
      })),
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(lng, ['common', 'pdp'])), // INSANYCK G-12.1 — i18n
      product: safeSerialize(product),
    },
    revalidate: 60, // ISR: Revalida cache a cada 60 segundos
  };
};

export default PDP;
