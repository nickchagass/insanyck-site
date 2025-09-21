// INSANYCK ETAPA 11E — API Admin Order Detail
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { withAdminAuth } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

const OrderUpdateSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']).optional(),
  trackingCode: z.string().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse, _session: any) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do pedido inválido' });
  }

  try {
    if (req.method === 'GET') {
      // Buscar detalhes completos do pedido
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              // phone: true,
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      res.status(200).json({ order });

    } else if (req.method === 'PATCH') {
      // Atualizar status do pedido
      const updateData = OrderUpdateSchema.parse(req.body);

      const order = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      res.status(200).json({ order });

    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: error.issues 
      });
    }

    console.error('Admin order detail error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export default withAdminAuth(handler);