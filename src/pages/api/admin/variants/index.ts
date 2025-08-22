// INSANYCK STEP 10 — Admin Variants API
// src/pages/api/admin/variants/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/adminAuth';
import { z } from 'zod';

const createVariantSchema = z.object({
  productId: z.string(),
  sku: z.string().min(1),
  title: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  optionValues: z.array(z.string()).min(1), // IDs dos OptionValues
  price: z.object({
    cents: z.number().min(0),
    currency: z.string().default('BRL'),
    compareAtCents: z.number().optional(),
  }),
  inventory: z.object({
    quantity: z.number().min(0).default(0),
    trackInventory: z.boolean().default(true),
    allowBackorder: z.boolean().default(false),
  }),
});

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  switch (req.method) {
    case 'POST':
      return createVariant(req, res, session);
    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function createVariant(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const data = createVariantSchema.parse(req.body);

    // Verificar se produto existe
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    // Verificar se SKU já existe
    const existingSku = await prisma.variant.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      return res.status(400).json({ error: 'SKU already exists' });
    }

    // Verificar se OptionValues existem
    const optionValues = await prisma.optionValue.findMany({
      where: { id: { in: data.optionValues } },
    });

    if (optionValues.length !== data.optionValues.length) {
      return res.status(400).json({ error: 'Some option values not found' });
    }

    // Criar variant com preço e estoque em transação
    const variant = await prisma.$transaction(async (tx) => {
      // Criar variant
      const newVariant = await tx.variant.create({
        data: {
          productId: data.productId,
          sku: data.sku,
          title: data.title,
          status: data.status,
          options: {
            create: data.optionValues.map(optionValueId => ({
              optionValueId,
            })),
          },
        },
      });

      // Criar preço
      await tx.price.create({
        data: {
          variantId: newVariant.id,
          ...data.price,
        },
      });

      // Criar inventory
      await tx.inventory.create({
        data: {
          variantId: newVariant.id,
          ...data.inventory,
        },
      });

      return newVariant;
    });

    // Buscar variant completa para retorno
    const fullVariant = await prisma.variant.findUnique({
      where: { id: variant.id },
      include: {
        price: true,
        inventory: true,
        options: {
          include: {
            optionValue: {
              include: {
                option: true,
              },
            },
          },
        },
      },
    });

    console.log(`Admin ${session.user?.email} created variant: ${data.sku}`);

    return res.status(201).json({ variant: fullVariant });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating variant:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAdminAuth(handler);