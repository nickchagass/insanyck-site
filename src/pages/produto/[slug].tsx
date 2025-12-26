// INSANYCK HOTFIX CART-02 + FASE G-01 + FASE G-02 + ISR PERF-01 — PDP com helpers centralizados + ISR (Cache)
import Head from "next/head";
import type { GetStaticProps, GetStaticPaths, NextPage } from "next";
import { ParsedUrlQuery } from "querystring";
import { useCartStore } from "@/store/cart";
import { formatBRL, safeSerialize } from "@/lib/price";

// INSANYCK FASE G-02 PERF-04 — ProductStage com SSR para melhorar LCP da PDP
import ProductStage from "@/components/pdp/ProductStage";

// INSANYCK FASE G-04.1 — Design System
import DsButton from "@/components/ds/DsButton";

// INSANYCK STEP G-05B — Titanium Glass V3
import DsGlass from "@/components/ds/DsGlass";

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

      {/* INSANYCK STEP G-10 — Desktop breathing room absoluto (160px) */}
      <main className="insanyck-section mx-auto max-w-[1360px] px-4 lg:px-6 pt-32 lg:pt-40">
        <div className="grid grid-cols-12 gap-6">
          {/* Stage */}
          <section className="col-span-12 lg:col-span-7">
            <ProductStage
              imageUrl={image}
              alt={product.title}
              hint="Arraste para girar — passe o mouse"
            />
          </section>

          {/* Painel */}
          {/* INSANYCK STEP G-10 — Platinum Glass + Desktop sticky top-40 (160px safe) */}
          <aside className="col-span-12 lg:col-span-5">
            <DsGlass tone="dense" padding="p-6 lg:p-8" className="sticky top-32 lg:top-40 space-y-5">
              <h1 className="text-display-xl">{product.title}</h1>

              {product.description && (
                <p className="text-white/80">{product.description}</p>
              )}

              <div className="text-2xl font-semibold">{price}</div>

              {/* Se tiver apenas 1 variante, o seletor fica neutro/desabilitado */}
              <button
                type="button"
                disabled={!product.variants || product.variants.length <= 1}
                className="btn-insanyck--ghost w-full"
              >
                Selecione as opções
              </button>

              {/* INSANYCK FASE G-04.1 — Migração para DsButton */}
              <div className="flex gap-3">
                <DsButton
                  onClick={handleBuyNow}
                  variant="primary"
                  size="lg"
                  className="flex-1"
                >
                  Comprar agora
                </DsButton>
                <DsButton
                  onClick={handleAdd}
                  variant="ghost"
                  size="lg"
                  className="px-4"
                >
                  Adicionar ao carrinho
                </DsButton>
              </div>

              <ul className="mt-2 space-y-2 text-white/75">
                <li>Pagamento seguro</li>
                <li>Troca em até 30 dias</li>
                <li>Autenticidade garantida</li>
              </ul>
            </DsGlass>
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

// INSANYCK ISR PERF-01 — getStaticProps: Cache com revalidação a cada 60s
export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params as Params;

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
    props: { product: safeSerialize(product) },
    revalidate: 60, // ISR: Revalida cache a cada 60 segundos
  };
};

export default PDP;
