// INSANYCK STEP 11 — Prisma Client with Type-Safe Env
import { PrismaClient } from "@prisma/client";
import { env } from "./env.server";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") global.prisma = prisma;

// INSANYCK STEP 8 — ADIÇÃO para suportar `import prisma from "@/lib/prisma"`
export default prisma;
