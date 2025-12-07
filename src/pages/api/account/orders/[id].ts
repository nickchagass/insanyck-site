import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { backendDisabled } from "@/lib/backendGuard";

const paramsSchema = z.object({
  id: z.string().min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // INSANYCK STEP E-01
  if (backendDisabled) return res.status(503).json({ error: "Backend disabled for preview/dev" });

  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  // INSANYCK STEP E-01 — Headers em APIs sensíveis
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Authorization");

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const userId = (session.user as any).id as string;

  // INSANYCK STEP E-02 — Validação dos parâmetros
  const parsed = paramsSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid order ID", details: parsed.error.flatten() });
  }
  const { id } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          select: { slug: true, title: true, qty: true, priceCents: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verificar se o pedido pertence ao usuário
    if (order.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const orderDetails = {
      id: order.id,
      status: order.status,
      amountTotal: order.amountTotal,
      currency: order.currency,
      trackingCode: order.trackingCode,
      shippedAt: order.shippedAt ? order.shippedAt.toISOString() : null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((it) => ({
        slug: it.slug,
        title: it.title,
        qty: it.qty,
        priceCents: it.priceCents,
      })),
    };

    return res.status(200).json(orderDetails);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? "Server error" });
  }
}