// INSANYCK STEP 10 — Admin Categories API
// src/pages/api/admin/categories/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/adminAuth';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  switch (req.method) {
    case 'GET':
      return getCategories(req, res);
    case 'POST':
      return createCategory(req, res, session);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getCategories(req: NextApiRequest, res: NextApiResponse) {
  const { flat = 'false' } = req.query;

  try {
    if (flat === 'true') {
      // Lista plana para selects
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      return res.status(200).json({ categories });
    } else {
      // Estrutura hierárquica
      const rootCategories = await prisma.category.findMany({
        where: { parentId: null },
        include: {
          children: {
            include: {
              children: true,
              _count: {
                select: { products: true },
              },
            },
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      return res.status(200).json({ categories: rootCategories });
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createCategory(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const data = createCategorySchema.parse(req.body);

    // Verificar se slug já existe
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    // Se parentId fornecido, verificar se existe
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        return res.status(400).json({ error: 'Parent category not found' });
      }
    }

    const category = await prisma.category.create({
      data,
      include: {
        parent: true,
        _count: {
          select: { products: true, children: true },
        },
      },
    });

    console.log(`Admin ${session.user?.email} created category: ${category.slug}`);

    return res.status(201).json({ category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    console.error('Error creating category:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAdminAuth(handler);