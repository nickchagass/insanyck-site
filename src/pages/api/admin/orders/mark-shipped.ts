import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { backendDisabled } from "@/lib/backendGuard";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { sendOrderShipped } from "@/lib/email";

const bodySchema = z.object({
  id: z.string().min(1),
  trackingCode: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // INSANYCK STEP E-01
  if (backendDisabled) return res.status(503).json({ error: "Backend disabled for preview/dev" });

  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  // INSANYCK STEP E-01 — Headers em APIs sensíveis
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Authorization");

  try {
    // Verificar se é admin
    await requireAdmin(req, res);
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return res.status(403).json({ error: "Admin access required" });
    }
    return res.status(500).json({ error: "Authentication error" });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ 
      error: "Invalid request body", 
      details: parsed.error.flatten() 
    });
  }

  const { id, trackingCode } = parsed.data;

  try {
    // Buscar pedido
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verificar se já está enviado com os mesmos dados (idempotência)
    if (order.shippedAt && order.trackingCode === (trackingCode || null)) {
      return res.status(200).json({ 
        ok: true, 
        shipped: true, 
        idempotent: true,
        order: {
          id: order.id,
          shippedAt: order.shippedAt.toISOString(),
          trackingCode: order.trackingCode,
        }
      });
    }

    // Atualizar pedido
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        shippedAt: new Date(),
        trackingCode: trackingCode || null,
      },
      include: { items: true },
    });

    // Enviar email (best-effort)
    try {
      await sendOrderShipped({
        to: updatedOrder.email,
        order: updatedOrder,
        trackingCode: trackingCode || undefined,
        locale: 'pt',
      });
    } catch (emailError) {
      console.error('Failed to send order shipped email:', emailError);
      // Não falha a API por erro de email
    }

    return res.status(200).json({
      ok: true,
      shipped: true,
      idempotent: false,
      order: {
        id: updatedOrder.id,
        shippedAt: updatedOrder.shippedAt!.toISOString(),
        trackingCode: updatedOrder.trackingCode,
      }
    });
  } catch (err: any) {
    console.error('Mark shipped error:', err);
    return res.status(500).json({ error: err?.message ?? "Server error" });
  }
}