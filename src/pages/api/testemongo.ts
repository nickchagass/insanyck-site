// src/pages/api/testemongo.ts

import type { NextApiRequest, NextApiResponse } from "next/types";
import clientPromise from "@/lib/mongodb";
import { z } from "zod";
import type { Db } from "mongodb";
// import { getServerSession } from "next-auth/next"; // Descomente se usar next-auth
// import { authOptions } from "./auth/[...nextauth]"; // Caminho pode mudar
import pino from "pino";

// Logger profissional (salva logs apenas em prod)
const logger = pino({ level: process.env.NODE_ENV === "production" ? "info" : "debug" });

// Esquema de validação com Zod
const UserSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").max(50, "Nome muito longo").transform(s => sanitize(s)),
  idade: z.number().int().positive("Idade deve ser positiva").min(13, "Idade mínima 13").max(120, "Idade inválida"),
});
type UserData = z.infer<typeof UserSchema>;

// (Opcional) Sanitização adicional
function sanitize(str: string) {
  return str.replace(/[\$<>]/g, ""); // Remove possíveis injeções simples
}

// Handler principal
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const startedAt = Date.now();

  // CORS: só libera tudo no dev, e domínio seguro em prod
  if (process.env.NODE_ENV === "development") {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://insanyck.com.br');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // (Opcional) Auth: Descomente se for privar o endpoint
    // const session = await getServerSession(req, res, authOptions);
    // if (!session) return res.status(401).json({ error: "Não autenticado" });

    const client = await clientPromise;
    const db: Db = client.db("insanyck");

    switch (req.method) {
      case "GET":
        await handleGetRequest(db, req, res, startedAt);
        return;
      case "POST":
        await handlePostRequest(db, req, res, startedAt);
        return;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: `Método ${req.method} não permitido` });
        return;
    }
  } catch (error) {
    handleServerError(error, res);
  }
}

// Handler GET com paginação
async function handleGetRequest(
  db: Db,
  req: NextApiRequest,
  res: NextApiResponse,
  startedAt: number
) {
  try {
    // Paginação real
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const skip = Math.max(Number(req.query.skip) || 0, 0);

    const data = await db
      .collection("teste")
      .find({})
      .project({ _id: 0 }) // oculta o ObjectId
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const elapsed = Date.now() - startedAt;
    logger.info({ endpoint: "GET /api/testemongo", count: data.length, elapsed });

    res.status(200).json({
      success: true,
      count: data.length,
      limit,
      skip,
      elapsedMs: elapsed,
      data,
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
}

// Handler POST robusto
async function handlePostRequest(
  db: Db,
  req: NextApiRequest,
  res: NextApiResponse,
  startedAt: number
) {
  try {
    const validation = UserSchema.safeParse(req.body);
    if (!validation.success) {
      logger.warn({ endpoint: "POST /api/testemongo", error: validation.error});
      res.status(400).json({
        error: "Dados inválidos",
        details: validation.error.issues,
      });
      return;
    }

    const userData: UserData = validation.data;
    const now = new Date();

    // Insere documento
    const result = await db.collection("teste").insertOne({
      ...userData,
      createdAt: now,
      updatedAt: now,
    });

    const elapsed = Date.now() - startedAt;
    logger.info({ endpoint: "POST /api/testemongo", insertedId: result.insertedId, elapsed });

    res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso",
      insertedId: result.insertedId.toString(),
      createdAt: now.toISOString(),
      elapsedMs: elapsed,
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
}

// Handler para erros de banco
function handleDatabaseError(error: any, res: NextApiResponse) {
  logger.error({ msg: "Database error", error });
  if (error.code === 11000) {
    res.status(409).json({
      error: "Conflito de dados",
      message: "Registro duplicado detectado"
    });
    return;
  }
  res.status(500).json({
    error: "Erro no banco de dados",
    message: process.env.NODE_ENV === 'development'
      ? error.message
      : "Erro interno do servidor"
  });
}

// Handler para erros genéricos
function handleServerError(error: any, res: NextApiResponse) {
  logger.error({ msg: "Server error", error });
  res.status(500).json({
    error: "Erro interno do servidor",
    message: process.env.NODE_ENV === 'development'
      ? error.message
      : "Por favor, tente novamente mais tarde"
  });
}
