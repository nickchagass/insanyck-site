// INSANYCK ETAPA 11E — API Admin Orders com paginação e filtros
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { withAdminAuth } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

// Schema para query parameters
const OrdersQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']).optional(),
  email: z.string().optional(),
  sortBy: z.enum(['createdAt', 'amountTotal', 'email']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validar e parse query parameters
    const {
      page,
      limit,
      status,
      email,
      sortBy,
      sortOrder
    } = OrdersQuerySchema.parse(req.query);

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros where
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (email) {
      where.email = {
        contains: email,
        mode: 'insensitive'
      };
    }

    // Ordenação
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Buscar orders com paginação
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          items: {
            select: {
              slug: true,
              title: true,
              priceCents: true,
              qty: true,
              image: true,
              variant: true,
              variantId: true,
              sku: true,
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Parâmetros inválidos', 
        details: error.errors 
      });
    }

    console.error('Admin orders error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export default withAdminAuth(handler);