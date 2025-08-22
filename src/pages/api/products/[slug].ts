// INSANYCK STEP 10 — Public Product Detail API (fix Map.values misuse)
// src/pages/api/products/[slug].ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const slug = String(req.query.slug || "");
  if (!slug) return res.status(400).json({ error: "Missing slug" });

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: {
          include: {
            price: true,
            inventory: true,
            options: {
              include: {
                optionValue: { include: { option: true } },
              },
            },
          },
        },
      },
    });

    if (!product || product.status !== "active") {
      return res.status(404).json({ error: "Product not found" });
    }

    // ====== Montagem das opções (Size, Color...) a partir das variantes ======
    // (Corrige bug: NÃO usar Map.values como array. Colecionamos e depois
    // transformamos para array com Array.from(optionsMap.values()))
    type OptionDTO = {
      slug: string;
      name: string;
      values: { slug: string; name: string; value: string }[];
    };

    const optionsMap = new Map<string, OptionDTO>();

    for (const v of product.variants) {
      for (const vo of v.options) {
        const opt = vo.optionValue.option; // ex.: { slug: 'size', name: 'Tamanho' }
        const val = vo.optionValue;        // ex.: { slug: 'm', name: 'M', value: 'M' }

        let entry = optionsMap.get(opt.slug);
        if (!entry) {
          entry = { slug: opt.slug, name: opt.name, values: [] };
          optionsMap.set(opt.slug, entry);
        }

        // evitar duplicados
        if (!entry.values.some((x) => x.slug === val.slug)) {
          entry.values.push({ slug: val.slug, name: val.name, value: val.value });
        }
      }
    }

    // DTO final (retrocompatível com seu frontend atual)
    const dto = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      images: product.images,
      variants: product.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        title: v.title ?? undefined,
        priceCents: v.price?.cents ?? 0,
        currency: v.price?.currency ?? "BRL",
        inventory: {
          quantity: v.inventory?.quantity ?? 0,
          reserved: v.inventory?.reserved ?? 0,
          available:
            (v.inventory?.quantity ?? 0) - (v.inventory?.reserved ?? 0),
        },
        options: v.options.map((vo) => ({
          option: vo.optionValue.option.slug, // "size" | "color"...
          value: vo.optionValue.slug,         // "m" | "preto"...
        })),
      })),
      options: Array.from(optionsMap.values()),
    };

    return res.status(200).json(dto);
  } catch (e: any) {
    console.error("[api/products/[slug]]", e);
    return res.status(500).json({ error: e?.message ?? "Server error" });
  }
}
