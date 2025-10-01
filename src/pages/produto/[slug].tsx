// INSANYCK STEP 10 — PDP robusto (SSR seguro + mapeamento compatível)
import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";
import Gallery from "@/components/pdp/Gallery";
import VariantPicker from "@/components/pdp/VariantPicker";
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

  const handleVariantChange = (variant: PDPVariant | null) => {
    setSelectedVariant(variant);
  };

  // Auto-select if only one variant or no variants (for mock/simple products)
  React.useEffect(() => {
    if (variants.length === 1 && !selectedVariant) {
      setSelectedVariant(variants[0]);
    }
  }, [variants, selectedVariant]);

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

      <main className="mx-auto max-w-[1200px] px-6 py-10">
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

        <div className="md:grid md:grid-cols-12 gap-8 space-y-8 md:space-y-0">
          {/* Gallery */}
          <div className="md:col-span-7">
            <Gallery product={product} />
          </div>

          {/* Content Panel */}
          <div className="md:col-span-5">
            <div className="card-insanyck p-6 space-y-6">
              {/* Header */}
              <div className="space-y-3">
                <h1 className="text-display-xl text-white font-bold tracking-tight">
                  {product.title}
                </h1>
                
                {product.description && (
                  <p className="text-white/70 text-lg leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="relative p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                {displayPrice ? (
                  <div className="text-white text-3xl font-bold tracking-tight">
                    {displayPrice}
                  </div>
                ) : (
                  <div className="text-white/60 text-xl font-medium">
                    {t("product:priceOnRequest", "Consulte")}
                  </div>
                )}
                
                {/* Stock status */}
                {selectedVariant && (
                  <div className={`mt-2 text-sm font-medium ${
                    selectedVariant.inventory.available > 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}>
                    {selectedVariant.inventory.available > 0
                      ? t("product:inStock", `${selectedVariant.inventory.available} em estoque`)
                      : t("product:outOfStock", "Fora de estoque")}
                  </div>
                )}
              </div>

              {/* Variant Picker */}
              {options.length > 0 && variants.length > 0 && (
                <VariantPicker
                  options={options}
                  variants={variants}
                  onVariantChange={handleVariantChange}
                />
              )}

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex gap-3 items-stretch">
                  {canAddToCart ? (
                    <AddToCartButton
                      product={{
                        slug: product.slug,
                        title: product.title,
                        image: product.image || undefined,
                        variantId: selectedVariant?.id || 'default',
                        sku: selectedVariant?.sku || product.slug,
                        priceCents: selectedVariant?.priceCents || 0,
                        currency: selectedVariant?.currency || 'BRL',
                      }}
                      className="btn-insanyck--primary rounded-xl px-8 py-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 flex-1"
                    >
                      {ctaText}
                    </AddToCartButton>
                  ) : (
                    <button
                      disabled
                      className="btn-insanyck--secondary rounded-xl px-8 py-3 font-semibold text-center text-white/60 cursor-not-allowed flex-1"
                    >
                      {ctaText}
                    </button>
                  )}
                  
                  {/* Wishlist */}
                  <WishlistButton
                    slug={product.slug}
                    title={product.title}
                    priceCents={selectedVariant?.priceCents || 0}
                    image={product.image || undefined}
                    className="btn-insanyck--secondary w-12 h-12 rounded-xl flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  />
                </div>
              </div>

              {/* Benefits */}
              <div className="pt-6 border-t border-white/10">
                <div className="grid grid-cols-1 gap-3 text-sm text-white/70">
                  {currentBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-white/40" role="img" aria-hidden="true">{benefit.icon}</span>
                      <span>{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
              {canAddToCart ? (
                <AddToCartButton
                  product={{
                    slug: product.slug,
                    title: product.title,
                    image: product.image || undefined,
                    variantId: selectedVariant?.id || 'default',
                    sku: selectedVariant?.sku || product.slug,
                    priceCents: selectedVariant?.priceCents || 0,
                    currency: selectedVariant?.currency || 'BRL',
                  }}
                  className="btn-insanyck--primary rounded-xl px-6 py-3 font-semibold text-sm"
                >
                  {needsVariantSelection ? t("product:selectFirst", "Selecionar") : t("cart:addToCart", "Adicionar")}
                </AddToCartButton>
              ) : (
                <button
                  disabled
                  className="btn-insanyck--secondary rounded-xl px-6 py-3 font-semibold text-sm cursor-not-allowed"
                >
                  {needsVariantSelection ? t("product:selectFirst", "Selecionar") : t("product:unavailable", "Indisponível")}
                </button>
              )}
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

    // JSON-safe normalization
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
        id: v.id ?? v.sku ?? `v-${i}`,
        options: asArray(v.options),
        price: v.price || { cents: 0, currency: 'BRL' },
        inventory: v.inventory || { quantity: 0, reserved: 0 }
      };
    });

    // JSON-safe option building
    const byOption = new Map<string, Option>();
    const variants = asArray(product.variants);

    for (const variant of variants) {
      if (!variant || typeof variant !== 'object') continue;
      
      const vOptions = asArray(variant.options);
      for (const option of vOptions) {
        if (!option || typeof option !== 'object') continue;
        
        const opt = option?.optionValue?.option;
        const val = option?.optionValue;
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
      .filter(v => v && typeof v === 'object' && v.id)
      .map((variant) => {
        const inventory = variant.inventory || { quantity: 0, reserved: 0 };
        const available = Math.max(
          0,
          (inventory.quantity || 0) - (inventory.reserved || 0)
        );
        const price = variant.price || { cents: 0, currency: 'BRL' };

        return jsonSafe({
          id: String(variant.id),
          sku: String(variant.sku || ""),
          title: variant.title ? String(variant.title) : undefined,
          priceCents: Number(price.cents) || 0,
          currency: String(price.currency || "BRL"),
          inventory: {
            quantity: Number(inventory.quantity) || 0,
            reserved: Number(inventory.reserved) || 0,
            available,
          },
          options: asArray(variant.options)
            .filter(o => o && typeof o === 'object')
            .map((o) => ({
              option: String(o?.optionValue?.option?.slug || ''),
              value: String(o?.optionValue?.slug || o?.optionValue?.value || ''),
            })),
        });
      });

    // JSON-safe image processing
    const images = asArray(product.images);
    const heroImage = images.find((i) => i && i.order === 1)?.url 
      ?? images.find(i => i && i.url)?.url 
      ?? null;
    
    const galleryImages = images
      .filter(i => i && i.url)
      .map(i => jsonSafe({
        url: i.url,
        alt: i.alt || `${product.title} - Imagem do produto`,
        order: i.order || 999
      }));

    return {
      props: {
        product: jsonSafe({
          id: product.id,
          slug: product.slug,
          title: product.title,
          description: product.description ?? null,
          image: heroImage,
          images: galleryImages,
        }),
        options: jsonSafe(options),
        variants: processedVariants, // Already jsonSafe'd
        ...(await serverSideTranslations(locale ?? "pt", [
          "common",
          "nav",
          "pdp",
          "product",
          "catalog",
          "cart",
        ])),
      },
    };
  } catch (err) {
    console.error("PDP GSSP error:", err);
    return { redirect: { destination: "/loja", permanent: false } };
  }
};
