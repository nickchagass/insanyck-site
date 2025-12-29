// INSANYCK STEP H1-01 — Enhanced Admin Auth (CEO Allowlist Support)
// Backward-compatible wrapper that checks BOTH role='admin' AND CEO allowlist
// Fixes inconsistency between middleware (isCEO) and API routes (role check)

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isCEO } from '@/lib/admin/constants';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * INSANYCK H1-01 — Enhanced requireAdmin with CEO allowlist support
 * Checks:
 * 1. User is authenticated
 * 2. User role === 'admin' OR user email in CEO_ALLOWLIST
 */
export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    throw new UnauthorizedError('Authentication required');
  }

  // INSANYCK H1-01 — Check role OR CEO allowlist (defense-in-depth)
  const userRole = (session.user as any)?.role;
  const userEmail = session.user.email;

  const isAdmin = userRole === 'admin';
  const isCEOUser = isCEO(userEmail);

  if (!isAdmin && !isCEOUser) {
    throw new UnauthorizedError('Admin or CEO access required');
  }

  return session;
}

/**
 * HOC wrapper for admin-only API routes
 * Usage: export default withAdminAuth(handler);
 */
export function withAdminAuth(
  handler: (_req: NextApiRequest, _res: NextApiResponse, _session: any) => Promise<void>
) {
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
