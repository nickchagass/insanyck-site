export function isPrismaDown(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  
  const error = err as any;
  
  // PrismaClientInitializationError ou códigos específicos
  return (
    error.name === 'PrismaClientInitializationError' ||
    error.code === 'P1001' || // Can't reach database server
    error.code === 'P1008'    // Operations timed out
  );
}

export async function withDb<T>(fn: (prisma: any) => Promise<T>, fallback: T): Promise<T> {
  const { prisma } = await import("@/lib/prisma");
  
  try {
    return await fn(prisma);
  } catch (err) {
    const dev = process.env.NODE_ENV === 'development';
    if (dev && isPrismaDown(err)) {
      console.warn('[dev] DB offline -> usando fallback');
      return fallback;
    }
    throw err;
  }
}