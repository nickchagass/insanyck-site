import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { backendDisabled } from "@/lib/backendGuard";

const querySchema = z.object({
  session_id: z.string().min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // INSANYCK STEP E-01
  if (backendDisabled) return res.status(503).json({ error: "Backend disabled for preview/dev" });

  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  // INSANYCK STEP E-01 — Headers em APIs sensíveis
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Authorization");

  // INSANYCK STEP E-02
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid session_id", details: parsed.error.flatten() });
  }

  const { session_id } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { stripeSessionId: session_id },
      include: {
        items: {
          select: {
            slug: true,
            title: true,
            qty: true,
            priceCents: true,
          },
        },
      },
    });

    if (order) {
      return res.status(200).json({
        order: {
          id: order.id,
          status: order.status,
          amountTotal: order.amountTotal,
          currency: order.currency,
          createdAt: order.createdAt.toISOString(),
          items: order.items,
        },
      });
    } else {
      return res.status(200).json({ order: null });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? "Server error" });
  }
}