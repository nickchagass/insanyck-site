import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { backendDisabled } from "@/lib/backendGuard";

const querySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(20),
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

  // Validação da query
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten() });
  }
  const { offset, limit } = parsed.data;

  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          items: {
            select: { slug: true, title: true, qty: true, priceCents: true },
          },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    const items = orders.map((order) => ({
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
    }));

    return res.status(200).json({ items, total, offset, limit });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? "Server error" });
  }
}
