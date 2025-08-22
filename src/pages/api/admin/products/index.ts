// INSANYCK STEP 10 — Admin Products API
// src/pages/api/admin/products/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/adminAuth';
import { z } from 'zod';

const createProductSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  switch (req.method) {
    case 'GET':
      return getProducts(req, res);
    case 'POST':
      return createProduct(req, res, session);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getProducts(req: NextApiRequest, res: NextApiResponse) {
  const {
    page = '1',
    limit = '10',
    search,
    category,
    status = 'all',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { slug: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.categoryId = category as string;
  }

  if (status !== 'all') {
    where.status = status as string;
  }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
          variants: {
            include: {
              price: true,
              inventory: true,
            },
          },
          _count: {
            select: { variants: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createProduct(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const data = createProductSchema.parse(req.body);

    // Verificar se slug já existe
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const product = await prisma.product.create({
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

    console.log(`Admin ${session.user?.email} created product: ${product.slug}`);

    return res.status(201).json({ product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAdminAuth(handler);