// INSANYCK STEP 10 — PDP robusto (SSR seguro + mapeamento compatível)
import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { addToCart, buyNow } from "@/store/cartActions";

const ProductStage = dynamic(() => import("@/components/pdp/ProductStage"), { ssr: false });
import { pdpBenefits } from "@/config/site";
import React from "react";
import { seoPDP } from "@/lib/seo";

type OptionValue = { slug: string; name: string; value: string };
type Option = {
  slug: string;
  name: string;
  type?: "color" | "size" | "select";
  values: OptionValue[];
};

type PDPVariant = {
  id: string;
  sku: string;
  title?: string;
  priceCents: number;
  currency: string;
  inventory: { quantity: number; reserved: number; available: number };
  options: { option: string; value: string }[];
};

type PDPProps = {
  product: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    image: string | null;
    images?: { url: string; alt?: string; order?: number }[];
  };
  options: Option[];
  variants: PDPVariant[];
};

export default function ProdutoPage({
  product,
  options,
  variants,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation(["product", "common", "cart"]);
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<PDPVariant | null>(null);
  const [showMobileCTA, setShowMobileCTA] = useState(false);
  const [qty, setQty] = useState(1);

  const firstVariant = useMemo(() => variants?.[0] ?? null, [variants]);

  const handleVariantChange = (variant: PDPVariant | null) => {
    setSelectedVariant(variant);
  };

  // Auto-select if only one variant or no variants (for mock/simple products)
  React.useEffect(() => {
    if (variants.length === 1 && !selectedVariant) {
      setSelectedVariant(variants[0]);
    }
  }, [variants, selectedVariant]);

  function handleAdd() {
    if (!firstVariant) return;
    addToCart({
      id: product.id ?? product.slug,
      title: product.title,
      slug: product.slug,
      image: product.images?.[0]?.url,
      variantId: firstVariant.id ?? "v1",
      priceCents: firstVariant.priceCents ?? 0,
      currency: firstVariant.currency ?? "BRL",
      qty,
    });
  }
  function handleBuy() {
    if (!firstVariant) return;
    buyNow({
      id: product.id ?? product.slug,
      title: product.title,
      slug: product.slug,
      image: product.images?.[0]?.url,
      variantId: firstVariant.id ?? "v1",
      priceCents: firstVariant.priceCents ?? 0,
      currency: firstVariant.currency ?? "BRL",
      qty,
    });
  }

  // Mobile sticky CTA visibility
  React.useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.5;
      setShowMobileCTA(window.scrollY > threshold);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const displayPrice = selectedVariant
    ? (selectedVariant.priceCents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: selectedVariant.currency,
      })
    : variants.length > 0
      ? (variants[0].priceCents / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: variants[0].currency,
        })
      : "";

  const currentBenefits = pdpBenefits[router.locale === 'en' ? 'en' : 'pt'];
  const hasVariants = variants.length > 0;
  const needsVariantSelection = options.length > 0 && !selectedVariant;
  const canAddToCart = hasVariants ? !!selectedVariant : true;
  const ctaText = needsVariantSelection 
    ? t("product:selectOptions", "Selecione as opções")
    : t("cart:addToCart", "Adicionar ao carrinho");

  const seo = seoPDP(
    {
      title: product.title,
      description: product.description || undefined,
      images: product.image ? [product.image] : [],
      slug: product.slug,
      price: selectedVariant?.priceCents
        ? selectedVariant.priceCents / 100
        : (variants[0]?.priceCents || 0) / 100,
      currency: selectedVariant?.currency || variants[0]?.currency || "BRL",
      inStock:
        (selectedVariant?.inventory?.available || 0) > 0 ||
        variants.some((v) => (v.inventory?.available || 0) > 0),
      sku: selectedVariant?.sku || variants[0]?.sku,
    },
    router.locale
  );

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        {seo.meta.map((tag, i) => (
          <meta key={i} {...tag} />
        ))}
        {seo.link.map((l, i) => (
          <link key={i} {...l} />
        ))}
        {seo.jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </Head>

      <main className="pdp-page insanyck-section mx-auto max-w-[1360px] px-4 lg:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <Link
            href="/loja"
            prefetch={true}
            className="inline-flex items-center text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            ← {t("common:back", "Voltar para loja")}
          </Link>
        </nav>

        <div className="grid grid-cols-12 gap-6">
          <section className="col-span-12 lg:col-span-7">
            <ProductStage
              imageUrl={product.images?.[0]?.url || product.image || "/products/placeholder/front.webp"}
              alt={product.title}
              hint="Arraste para girar — passe o mouse"
            />
          </section>

          <aside className="col-span-12 lg:col-span-5">
            <div className="glass-card pdp-summary p-6 lg:p-8 space-y-5 halo-cinema">
              {/* Header */}
              <div className="space-y-3">
                <h1 className="text-display-xl">{product.title}</h1>
                
                {product.description && (
                  <p className="text-body">{product.description}</p>
                )}
              </div>

              <div className="text-2xl font-semibold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: variants?.[0]?.currency ?? 'BRL' })
                  .format((variants?.[0]?.priceCents ?? 0) / 100)}
              </div>

              <button
                type="button"
                disabled={!variants || variants.length <= 1}
                className="btn-insanyck--ghost w-full"
              >
                Selecione as opções
              </button>

              <div className="flex gap-3">
                <button 
                  onClick={handleBuy}
                  disabled={!canAddToCart}
                  className="btn-insanyck--primary flex-1"
                >
                  Comprar agora
                </button>
                <button 
                  onClick={handleAdd}
                  disabled={!canAddToCart}
                  className="btn-insanyck--ghost px-4"
                >
                  Adicionar ao carrinho
                </button>
              </div>

              <ul className="mt-2 space-y-2 text-white/75">
                <li>Pagamento seguro</li>
                <li>Troca em até 30 dias</li>
                <li>Autenticidade garantida</li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Mobile Sticky CTA */}
        {showMobileCTA && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                {displayPrice && (
                  <div className="text-white text-lg font-semibold">
                    {displayPrice}
                  </div>
                )}
              </div>
              <button
                onClick={canAddToCart ? handleAdd : undefined}
                disabled={!canAddToCart}
                className={`rounded-xl px-6 py-3 font-semibold text-sm ${
                  canAddToCart 
                    ? "btn-insanyck--primary" 
                    : "btn-insanyck--secondary cursor-not-allowed"
                }`}
              >
                {needsVariantSelection ? t("product:selectFirst", "Selecionar") : 
                 canAddToCart ? t("cart:addToCart", "Adicionar") : 
                 t("product:unavailable", "Indisponível")}
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

// JSON-safety helpers
const asArray = <T,>(v: any): T[] => (Array.isArray(v) ? v : []);
const jsonSafe = <T,>(o: T): T => JSON.parse(JSON.stringify(o, (_k,v)=>v===undefined?null:v));

// remove undefined para evitar "undefined cannot be serialized as JSON"
function safeSerialize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const getServerSideProps: GetServerSideProps<PDPProps> = async ({ params, locale, res }) => {
  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400");

  try {
    const slugParam = params?.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : String(slugParam ?? "");

    if (!slug) {
      console.warn("PDP: Slug não fornecido");
      return { notFound: true };
    }

    // Import fallback utilities
    const { withDb } = await import('@/lib/db/prismaGuard');
    const { findBySlug } = await import('@/mock/products');
    const { sanitizeForNext } = await import('@/lib/json/sanitizeForNext');

    const product = await withDb(
      async (prisma) => prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          images: { orderBy: { order: "asc" } },
          variants: {
            where: { status: "active" },
            include: {
              price: true,
              inventory: true,
              options: {
                include: {
                  optionValue: {
                    include: { option: true },
                  },
                },
              },
            },
          },
        },
      }),
      findBySlug(slug) as any
    );

    if (!product) {
      console.warn(`PDP: Produto não encontrado para slug: ${slug}`);
      return { notFound: true };
    }

    // JSON-safe normalization + garantir ID sempre presente
    if (Array.isArray(product?.variants)) {
      product.variants = product.variants.map((v: any, i: number) => ({
        id: v?.id ?? `v${i+1}`,
        ...v,
      }));
    }
    
    product.variants = asArray(product?.variants).map((v, i) => {
      if (!v || typeof v !== 'object') {
        return {
          id: `fallback-${product.slug}-v${i}`,
          status: 'active',
          sku: '',
          options: [],
          price: { cents: 0, currency: 'BRL' },
          inventory: { quantity: 0, reserved: 0 }
        };
      }
      
      return {
        ...v,
        id: (v as any).id ?? (v as any).sku ?? `v-${i}`,
        options: asArray((v as any).options),
        price: (v as any).price || { cents: 0, currency: 'BRL' },
        inventory: (v as any).inventory || { quantity: 0, reserved: 0 }
      };
    });

    // JSON-safe option building
    const byOption = new Map<string, Option>();
    const variants = asArray(product.variants);

    for (const variant of variants) {
      if (!variant || typeof variant !== 'object') continue;
      
      const vOptions = asArray((variant as any).options);
      for (const option of vOptions) {
        if (!option || typeof option !== 'object') continue;
        
        const opt = (option as any)?.optionValue?.option;
        const val = (option as any)?.optionValue;
        if (!opt || !val || typeof opt !== 'object' || typeof val !== 'object') continue;
        
        const key = opt.slug;

        if (!byOption.has(key)) {
          byOption.set(key, {
            slug: opt.slug,
            name: opt.name ?? opt.slug,
            type: opt.slug === "color" ? "color" : opt.slug === "size" ? "size" : "select",
            values: [],
          });
        }

        const bucket = byOption.get(key)!;
        const vSlug = val.slug ?? val.value;

        if (!bucket.values.some((x) => x.slug === vSlug)) {
          bucket.values.push({
            slug: vSlug,
            name: val.name ?? val.value,
            value: val.value,
          });
        }
      }
    }

    const options: Option[] = Array.from(byOption.values());

    // JSON-safe variant processing
    const processedVariants: PDPVariant[] = variants
      .filter(v => v && typeof v === 'object' && (v as any).id)
      .map((variant) => {
        const inventory = (variant as any).inventory || { quantity: 0, reserved: 0 };
        const available = Math.max(
          0,
          (inventory.quantity || 0) - (inventory.reserved || 0)
        );
        const price = (variant as any).price || { cents: 0, currency: 'BRL' };

        return jsonSafe({
          id: String((variant as any).id),
          sku: String((variant as any).sku || ""),
          title: (variant as any).title ? String((variant as any).title) : undefined,
          priceCents: Number(price.cents) || 0,
          currency: String(price.currency || "BRL"),
          inventory: {
            quantity: Number(inventory.quantity) || 0,
            reserved: Number(inventory.reserved) || 0,
            available,
          },
          options: asArray((variant as any).options)
            .filter(o => o && typeof o === 'object')
            .map((o) => ({
              option: String((o as any)?.optionValue?.option?.slug || ''),
              value: String((o as any)?.optionValue?.slug || (o as any)?.optionValue?.value || ''),
            })),
        });
      });

    // JSON-safe image processing
    const images = asArray(product.images);
    const heroImage = (images.find((i) => i && (i as any).order === 1) as any)?.url 
      ?? (images.find(i => i && (i as any).url) as any)?.url 
      ?? null;
    
    const galleryImages = images
      .filter(i => i && (i as any).url)
      .map(i => jsonSafe({
        url: (i as any).url,
        alt: (i as any).alt || `${product.title} - Imagem do produto`,
        order: (i as any).order || 999
      }));

    return {
      props: safeSerialize({
        product: {
          id: product.id,
          slug: product.slug,
          title: product.title,
          description: product.description ?? null,
          image: heroImage,
          images: galleryImages,
        },
        options,
        variants: processedVariants,
        ...(await serverSideTranslations(locale ?? "pt", [
          "common",
          "nav",
          "pdp",
          "product",
          "catalog",
          "cart",
        ])),
      }),
    };
  } catch (err) {
    console.error("PDP GSSP error:", err);
    return { redirect: { destination: "/loja", permanent: false } };
  }
};
