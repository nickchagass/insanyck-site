// INSANYCK STEP 10 — Admin Product Detail API
// src/pages/api/admin/products/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/adminAuth';
import { z } from 'zod';

const updateProductSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  isFeatured: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  switch (req.method) {
    case 'GET':
      return getProduct(req, res, id);
    case 'PUT':
      return updateProduct(req, res, id, session);
    case 'DELETE':
      return deleteProduct(req, res, id, session);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getProduct(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: {
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
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateProduct(req: NextApiRequest, res: NextApiResponse, id: string, session: any) {
  try {
    const data = updateProductSchema.parse(req.body);

    // Se slug está sendo alterado, verificar duplicatas
    if (data.slug) {
      const existing = await prisma.product.findFirst({
        where: {
          slug: data.slug,
          NOT: { id },
        },
      });

      if (existing) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: {
          include: {
            price: true,
            inventory: true,
          },
        },
      },
    });

    console.log(`Admin ${session.user?.email} updated product: ${product.slug}`);

    return res.status(200).json({ product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteProduct(req: NextApiRequest, res: NextApiResponse, id: string, session: any) {
  try {
    // Verificar se produto existe
    const product = await prisma.product.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Deletar produto (cascade deletará variants, preços, inventory, etc.)
    await prisma.product.delete({
      where: { id },
    });

    console.log(`Admin ${session.user?.email} deleted product: ${product.slug}`);

    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAdminAuth(handler);