// INSANYCK STEP 10 — PDP robusto (SSR seguro + mapeamento compatível)
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import AddToCartButton from "@/components/AddToCartButton";

const VariantSelector = dynamic(() => import("@/components/VariantSelector"), {
  ssr: true,
  loading: () => <div className="h-[120px] w-full animate-pulse bg-white/5 rounded-xl" />,
});
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
  };
  options: Option[];
  variants: PDPVariant[];
};

export default function ProdutoPage({
  product,
  options,
  variants,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation(["pdp", "common", "cart"]);
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<PDPVariant | null>(null);

  const handleVariantChange = (variant: PDPVariant | null) => {
    setSelectedVariant(variant);
  };

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

      <main className="mx-auto max-w-[1200px] px-6 pt-24 pb-16 insanyck-bloom insanyck-bloom--soft">
        {/* Link voltar */}
        <div className="mb-8">
          <Link
            href="/loja"
            className="text-white/80 underline underline-offset-4 hover:text-white transition"
          >
            ← {t("common:back", "Voltar para loja")}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Imagem */}
          <div className="relative aspect-square md:aspect-[4/5] overflow-hidden rounded-2xl bg-white/5">
            <Image
              src={product.image || "/products/oversized-classic/front.webp"}
              alt={product.title}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              className="object-cover"
            />
          </div>

          {/* Detalhes */}
          <div className="space-y-6">
            <div>
              <h1 className="text-white text-3xl font-semibold tracking-tight">{product.title}</h1>
              {product.description && (
                <p className="text-white/70 mt-3 text-lg">{product.description}</p>
              )}
            </div>

            {displayPrice && (
              <div className="text-white text-2xl font-semibold">{displayPrice}</div>
            )}

            {/* Seletor de Variantes */}
            {options.length > 0 && variants.length > 0 && (
              <div className="space-y-6">
                <VariantSelector
                  options={options}
                  variants={variants}
                  onVariantChange={handleVariantChange}
                />
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center gap-4 pt-4">
              {selectedVariant && (
                <AddToCartButton
                  product={{
                    slug: product.slug,
                    title: product.title,
                    image: product.image || undefined,
                    variantId: selectedVariant.id,
                    sku: selectedVariant.sku,
                    priceCents: selectedVariant.priceCents,
                    currency: selectedVariant.currency,
                  }}
                  className="bg-white text-black rounded-xl px-8 py-3 font-semibold hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition flex-1"
                >
                  {t("cart:addToCart", "Adicionar ao carrinho")}
                </AddToCartButton>
              )}

              {!selectedVariant && variants.length > 0 && (
                <div className="flex-1 bg-white/10 text-white/60 rounded-xl px-8 py-3 font-semibold text-center">
                  {t("pdp:selectVariant", "Selecione as opções")}
                </div>
              )}

              {variants.length === 0 && (
                <div className="flex-1 bg-white/10 text-white/60 rounded-xl px-8 py-3 font-semibold text-center">
                  {t("pdp:outOfStock", "Produto indisponível")}
                </div>
              )}
            </div>

            {/* Estoque */}
            {selectedVariant && (
              <div className="text-white/60 text-sm">
                {selectedVariant.inventory.available > 0
                  ? t("pdp:inStock", `${selectedVariant.inventory.available} em estoque`)
                  : t("pdp:outOfStock", "Fora de estoque")}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
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

    // INSANYCK STEP 10 — Import dinâmico do Prisma
    const { prisma } = await import("@/lib/prisma");

    const product = await prisma.product.findUnique({
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
    });

    if (!product) {
      console.warn(`PDP: Produto não encontrado para slug: ${slug}`);
      return { notFound: true };
    }

    // INSANYCK STEP 10 — Construir options (size, color, etc.)
    const byOption = new Map<string, Option>();

    for (const variant of product.variants) {
      for (const option of variant.options) {
        const opt = option.optionValue.option; // { id, slug, name }
        const val = option.optionValue; // { slug?, name?, value }
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

    // INSANYCK STEP 10 — Variants no shape do VariantSelector
    const variants: PDPVariant[] = product.variants.map((variant) => {
      const available = Math.max(
        0,
        (variant.inventory?.quantity ?? 0) - (variant.inventory?.reserved ?? 0)
      );

      return {
        id: variant.id,
        sku: variant.sku ?? "",
        title: variant.title ?? undefined,
        priceCents: variant.price?.cents ?? 0,
        currency: variant.price?.currency ?? "BRL",
        inventory: {
          quantity: variant.inventory?.quantity ?? 0,
          reserved: variant.inventory?.reserved ?? 0,
          available,
        },
        options: variant.options.map((o) => ({
          option: o.optionValue.option.slug,
          value: o.optionValue.slug ?? o.optionValue.value,
        })),
      };
    });

    const heroImage =
      product.images.find((i) => i.order === 1)?.url ?? product.images[0]?.url ?? null;

    return {
      props: {
        product: {
          id: product.id,
          slug: product.slug,
          title: product.title,
          description: product.description ?? null,
          image: heroImage,
        },
        options,
        variants,
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
