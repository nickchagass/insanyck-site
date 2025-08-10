// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

/**
 * Evita criar várias instâncias do Prisma em modo dev (HMR do Next.js).
 * Em produção (Vercel), uma instância por lambda é suficiente.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // logs úteis em dev; silencioso em prod
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
