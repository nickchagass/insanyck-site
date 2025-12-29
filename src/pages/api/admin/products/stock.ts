// INSANYCK STEP H1-03 — Admin Stock Update API
// Inline stock editing for God View catalog
// Updates Inventory.quantity at VARIANT level (not Product level)

import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { withAdminAuth } from '@/lib/admin/withAdminAuth';
import { prisma } from '@/lib/prisma';

// INSANYCK H1-03 — Stock update schema (delta OR absolute, never both)
const StockUpdateSchema = z.object({
  variantId: z.string().min(1, 'Variant ID required'),
  delta: z.number().int().optional(),
  absolute: z.number().int().min(0).optional(),
}).refine(
  (data) => {
    // Exactly one of delta or absolute must be provided
    const hasDelta = data.delta !== undefined;
    const hasAbsolute = data.absolute !== undefined;
    return (hasDelta && !hasAbsolute) || (!hasDelta && hasAbsolute);
  },
  { message: 'Must provide either delta or absolute, not both' }
);

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { variantId, delta, absolute } = StockUpdateSchema.parse(req.body);

    // INSANYCK H1-03 — Fetch current inventory
    const inventory = await prisma.inventory.findUnique({
      where: { variantId },
      include: {
        variant: {
          select: {
            id: true,
            sku: true,
            productId: true,
          },
        },
      },
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found for variant' });
    }

    // Calculate new quantity
    let newQuantity: number;
    if (delta !== undefined) {
      newQuantity = inventory.quantity + delta;
    } else {
      newQuantity = absolute!;
    }

    // INSANYCK H1-03 — Validate: stock never below 0
    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Stock cannot be negative' });
    }

    // Update inventory
    const updated = await prisma.inventory.update({
      where: { variantId },
      data: { quantity: newQuantity },
      include: {
        variant: {
          select: {
            id: true,
            sku: true,
            productId: true,
          },
        },
      },
    });

    // INSANYCK H1-03 — Structured logging (admin action audit trail)
    console.log(JSON.stringify({
      event: 'admin:stock_update',
      admin: session.user?.email,
      variantId,
      productId: updated.variant.productId,
      sku: updated.variant.sku,
      oldQuantity: inventory.quantity,
      newQuantity: updated.quantity,
      delta: delta ?? (newQuantity - inventory.quantity),
      timestamp: new Date().toISOString(),
    }));

    return res.status(200).json({
      success: true,
      variant: {
        id: updated.variantId,
        productId: updated.variant.productId,
        sku: updated.variant.sku,
        quantity: updated.quantity,
        reserved: updated.reserved,
        available: updated.quantity - updated.reserved,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }

    console.error('Stock update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAdminAuth(handler);
