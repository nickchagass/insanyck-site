// INSANYCK STEP 11 — Search API Endpoint
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { searchProducts } from '@/lib/catalog';

const SearchSchema = z.object({
  q: z.string().min(1, 'Query is required'),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q, limit } = SearchSchema.parse(req.query);
    
    const results = await searchProducts(q, limit);
    
    res.status(200).json({ results, total: results.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid parameters', 
        details: (error as any).errors 
      });
    }

    console.error('[Search API] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}