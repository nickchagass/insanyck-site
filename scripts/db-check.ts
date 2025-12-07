// INSANYCK FASE F-02 — Script de verificação de conexão com Postgres/Neon
import { PrismaClient } from '@prisma/client';

async function checkDatabaseConnection() {
  // Verificar se DATABASE_URL está definida
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não está definida');
    console.error('Configure DATABASE_URL no arquivo .env.local antes de continuar.');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    // Testar conexão com query simples
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection OK');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database connection FAILED');
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection();
