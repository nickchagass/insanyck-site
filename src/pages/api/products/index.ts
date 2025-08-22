// INSANYCK STEP 10 — Public Products API
// src/pages/api/products/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    page = '1',
    limit = '12',
    category,
    search,
    minPrice,
    maxPrice,
    size,
    color,
    inStock = 'false',
    sort = 'newest',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  try {
    const where: any = {
      status: 'active',
    };

    // Filtro por categoria
    if (category) {
      where.category = {
        slug: category as string,
      };
    }

    // Filtro por busca
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Filtros por variantes (preço, tamanho, cor, estoque)
    if (minPrice || maxPrice || size || color || inStock === 'true') {
      where.variants = {
        some: {
          status: 'active',
          ...(minPrice || maxPrice ? {
            price: {
              cents: {
                ...(minPrice ? { gte: parseInt(minPrice as string) * 100 } : {}),
                ...(maxPrice ? { lte: parseInt(maxPrice as string) * 100 } : {}),
              },
            },
          } : {}),
          ...(size ? {
            options: {
              some: {
                optionValue: {
                  option: { slug: 'size' },
                  value: size as string,
                },
              },
            },
          } : {}),
          ...(color ? {
            options: {
              some: {
                optionValue: {
                  option: { slug: 'color' },
                  slug: color as string,
                },
              },
            },
          } : {}),
          ...(inStock === 'true' ? {
            inventory: {
              quantity: { gt: 0 },
            },
          } : {}),
        },
      };
    }

    // Ordenação
    let orderBy: any = { updatedAt: 'desc' }; // newest
    if (sort === 'price_asc') {
      // Para ordenar por preço, precisamos de um join mais complexo
      orderBy = { variants: { _count: 'desc' } }; // fallback
    } else if (sort === 'price_desc') {
      orderBy = { variants: { _count: 'desc' } }; // fallback
    } else if (sort === 'name') {
      orderBy = { title: 'asc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            where: { order: 1 },
            take: 1,
          },
          variants: {
            where: { status: 'active' },
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
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    // Transformar dados para frontend
    const productsWithPricing = products.map((product) => {
      const activeVariants = product.variants.filter(v => v.status === 'active');
      const prices = activeVariants.map(v => v.price?.cents || 0).filter(p => p > 0);
      
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      
      const totalStock = activeVariants.reduce((sum, v) => {
        const available = (v.inventory?.quantity || 0) - (v.inventory?.reserved || 0);
        return sum + Math.max(0, available);
      }, 0);

      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        category: product.category,
        image: product.images[0]?.url,
        pricing: {
          minCents: minPrice,
          maxCents: maxPrice,
          currency: 'BRL',
        },
        availability: {
          inStock: totalStock > 0,
          totalStock,
        },
        variantCount: activeVariants.length,
        isFeatured: product.isFeatured,
      };
    });

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      products: productsWithPricing,
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