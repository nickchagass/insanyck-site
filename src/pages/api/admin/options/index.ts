// INSANYCK STEP 10 — Admin Options API
// src/pages/api/admin/options/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/adminAuth';

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  switch (req.method) {
    case 'GET':
      return getOptions(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getOptions(req: NextApiRequest, res: NextApiResponse) {
  try {
    const options = await prisma.option.findMany({
      include: {
        values: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ options });
  } catch (error) {
    console.error('Error fetching options:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAdminAuth(handler);