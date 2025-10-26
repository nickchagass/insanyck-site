import type { NextApiRequest, NextApiResponse } from "next";
import { backendDisabled, missingEnv } from "@/lib/backendGuard";
import { z } from "zod";

// === Validação ===
// Itens do carrinho precisam seguir a mesma semântica do cartClient/checkout:
// chave de de-dupe = slug + variantId + sku
const cartItemSchema = z.object({
  slug: z.string().min(1),
  variantId: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  qty: z.number().int().min(1).max(10),
  // campos livres adicionais (ex.: snapshot de title/price) podem existir no Mongo,
  // mas não entram na chave de de-dupe
}).strict();

const bodySchema = z.object({
  // carrinho atual do cliente (ex.: após adicionar itens)
  items: z.array(cartItemSchema).max(100).default([]),
  // carrinho guest que veio do localStorage para mesclar ao logar
  guestItems: z.array(cartItemSchema).max(100).optional().default([]),
  // opcional: sessionId do guest (quando não logado)
  sessionId: z.string().optional(),
});

function makeKey(it: z.infer<typeof cartItemSchema>) {
  const v = it.variantId || "";
  const s = it.sku || "";
  return `${it.slug}__${v}__${s}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (backendDisabled) {
    return res.status(503).json({ error: "Backend disabled for preview/dev" });
  }

  const need = missingEnv("MONGODB_URI");
  if (!need.ok) {
    return res.status(503).json({ error: "Missing env", missing: need.absent });
  }

  res.setHeader("Cache-Control", "no-store");

  // Lazy imports (mantém cold start baixo)
  const { connectToDatabase } = await import("@/lib/mongo");
  const { default: Cart } = await import("@/lib/models/Cart");
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");

  await connectToDatabase();

  // Descobrir userId ou sessionId
  const session = await getServerSession(req, res, authOptions).catch(() => null);

  let userId: string | null = null;
  let sessionId: string | undefined = undefined;

  if (session?.user?.id) {
    userId = session.user.id as string;
  } else {
    // guest: tentar pegar sessionId via query/body, obrigatório para GET/POST de guest
    sessionId = (req.query.sessionId as string) || (req.body?.sessionId as string) || undefined;
  }

  // GET = retorna carrinho corrente
  if (req.method === "GET") {
    if (!userId && !sessionId) {
      // coerência com o resto das APIs
      return res.status(401).json({ error: "Missing session for guest" });
    }

    const cart = await Cart.findByUserOrSession(userId, sessionId || "");
    // Garantir shape estável
    const safeItems = (cart?.items || []).map((it: any) => {
      const normSlug =
        (typeof it.slug === "string" && it.slug) ? it.slug :
        (typeof it.productSlug === "string" && it.productSlug) ? it.productSlug :
        (typeof it.slugRef === "string" && it.slugRef) ? it.slugRef :
        (typeof it.productId === "string" && it.productId) ? it.productId : "unknown";

      return {
        slug: normSlug,
        variantId: (typeof it.variantId === "string" && it.variantId) ? it.variantId : null,
        sku: (typeof it.sku === "string" && it.sku) ? it.sku : null,
        qty: Math.max(1, Math.min(10, Number(it.qty || 1))),
      };
    });

    return res.status(200).json({ ok: true, cart: safeItems });
  }

  // POST = atualiza carrinho e, quando logado, mescla guest → user
  if (req.method === "POST") {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    }

    const { items, guestItems } = parsed.data;

    // Base sempre é o carrinho "do banco" do dono (user ou guest)
    let baseItems: any[] = [];
    if (userId) {
      const userCart = await Cart.findOne({ userId });
      baseItems = userCart?.items || [];
    } else {
      if (!sessionId) {
        return res.status(401).json({ error: "SessionId required for guest cart" });
      }
      const guestCart = await Cart.findOne({ sessionId });
      baseItems = guestCart?.items || [];
    }

    // Normalizar base → dicionário por chave (slug+variantId+sku)
    const dict = new Map<string, { slug: string; variantId: string | null; sku: string | null; qty: number }>();

    for (const it of baseItems) {
      const normSlug =
        (typeof it.slug === "string" && it.slug) ? it.slug :
        (typeof it.productSlug === "string" && it.productSlug) ? it.productSlug :
        (typeof it.slugRef === "string" && it.slugRef) ? it.slugRef :
        (typeof it.productId === "string" && it.productId) ? it.productId : "unknown";

      const norm = {
        slug: normSlug,
        variantId: (typeof it.variantId === "string" && it.variantId) ? it.variantId : null,
        sku: (typeof it.sku === "string" && it.sku) ? it.sku : null,
        qty: Math.max(1, Math.min(10, Number(it.qty || 1))),
      };
      dict.set(makeKey(norm), norm);
    }

    // 1) Aplicar `items` (estado atual do cliente) sobre a base
    for (const it of items) {
      const key = makeKey(it);
      const prev = dict.get(key);
      if (prev) {
        // Overwrite quantidade (cliente costuma enviar estado final do carrinho)
        prev.qty = Math.max(1, Math.min(10, it.qty));
        dict.set(key, prev);
      } else {
        dict.set(key, { slug: it.slug, variantId: it.variantId ?? null, sku: it.sku ?? null, qty: Math.max(1, Math.min(10, it.qty)) });
      }
    }

    // 2) Se logado e temos guestItems → merge (somando quantidades)
    if (userId && guestItems.length > 0) {
      for (const it of guestItems) {
        const key = makeKey(it);
        const prev = dict.get(key);
        if (prev) {
          prev.qty = Math.max(1, Math.min(10, prev.qty + it.qty));
          dict.set(key, prev);
        } else {
          dict.set(key, { slug: it.slug, variantId: it.variantId ?? null, sku: it.sku ?? null, qty: Math.max(1, Math.min(10, it.qty)) });
        }
      }
    }

    // Resultado final
    const finalItems = Array.from(dict.values());

    // Persistir
    let cart;
    if (userId) {
      cart = await Cart.findOneAndUpdate(
        { userId },
        { items: finalItems, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    } else {
      // guest
      cart = await Cart.findOneAndUpdate(
        { sessionId },
        { items: finalItems, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({ ok: true, cart: cart.items });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
