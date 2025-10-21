// INSANYCK STEP 10 — RBAC Helper para Admin
// src/lib/adminAuth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    throw new UnauthorizedError('Authentication required');
  }
  
  // INSANYCK STEP 10 — Verificar role admin
  const userRole = (session.user as any)?.role;
  if (userRole !== 'admin') {
    throw new UnauthorizedError('Admin access required');
  }
  
  return session;
}

export function withAdminAuth(handler: (_req: NextApiRequest, _res: NextApiResponse, _session: any) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await requireAdmin(req, res);
      return await handler(req, res, session);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return res.status(401).json({ error: error.message });
      }
      console.error('Admin auth error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export function withAdminMiddleware(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  requireAdmin(req, res)
    .then(() => next())
    .catch((error) => {
      if (error instanceof UnauthorizedError) {
        res.status(401).json({ error: error.message });
      } else {
        console.error('Admin middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
}