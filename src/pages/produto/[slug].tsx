import Head from "next/head";
import dynamic from "next/dynamic";
import type { GetServerSideProps, NextPage } from "next";
import { ParsedUrlQuery } from "querystring";
import { addToCart, buyNow } from "@/lib/cartClient";

const ProductStage = dynamic(() => import("@/components/pdp/ProductStage"), { ssr: false });

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

function formatBRL(cents: number, currency: string = "BRL") {
  try {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency });
  } catch {
    return `R$ ${(cents / 100).toFixed(2)}`;
  }
}

function safeSerialize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

const PDP: NextPage<{ product: Product }> = ({ product }) => {
  const v0 = product.variants?.[0];
  const price = formatBRL(v0?.price?.cents ?? 0, v0?.price?.currency ?? "BRL");
  const image = product.images?.[0]?.url || "/products/placeholder/front.webp";

  const handleAdd = () => {
    addToCart({
      id: product.id,
      title: product.title,
      priceCents: v0?.price?.cents ?? 0,
      currency: v0?.price?.currency ?? "BRL",
      qty: 1,
      image,
      variantId: v0?.id,
      sku: v0?.sku,
    });
    // feedback simples
    if (typeof window !== "undefined") {
      console.warn("[cart] item adicionado");
      alert("Adicionado ao carrinho.");
    }
  };

  const handleBuyNow = () => {
    buyNow({
      id: product.id,
      title: product.title,
      priceCents: v0?.price?.cents ?? 0,
      currency: v0?.price?.currency ?? "BRL",
      qty: 1,
      image,
      variantId: v0?.id,
      sku: v0?.sku,
    });
  };

  return (
    <>
      <Head>
        <title>{product.title} • INSANYCK</title>
      </Head>

      <main className="insanyck-section mx-auto max-w-[1360px] px-4 lg:px-6">
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
          <aside className="col-span-12 lg:col-span-5">
            <div className="glass-card sticky top-8 rounded-3xl p-6 lg:p-8 space-y-5">
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

              <div className="flex gap-3">
                <button onClick={handleBuyNow} className="btn-insanyck--primary flex-1">Comprar agora</button>
                <button onClick={handleAdd} className="btn-insanyck--ghost px-4">Adicionar ao carrinho</button>
              </div>

              <ul className="mt-2 space-y-2 text-white/75">
                <li>Pagamento seguro</li>
                <li>Troca em até 30 dias</li>
                <li>Autenticidade garantida</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
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

  return { props: { product: safeSerialize(product) } };
};

export default PDP;
