import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongo";
import Cart from "@/lib/models/Cart";

// Para autenticação NextAuth (opcional, só use se quiser autenticação JWT)
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]"; // Ajuste o caminho se necessário

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Conexão universal
  await connectToDatabase();

  // 2. Pegue userId e/ou sessionId
  let userId: string | null = null;
  let sessionId: string | undefined = undefined;

  // Exemplo para NextAuth (usuário logado)
  const session = await getServerSession(req, res, authOptions).catch(() => null);
  if (session?.user?.id) {
    userId = session.user.id;
  } else {
    // Guest: pode pegar sessionId do cookie, header, ou gerar no front e mandar via query/body
    sessionId = (req.query.sessionId as string) || undefined;
    if (!sessionId) {
      return res.status(401).json({ error: "SessionId ausente para guest" });
    }
  }

  // 3. GET = buscar carrinho
  if (req.method === "GET") {
    const cart = await Cart.findByUserOrSession(userId, sessionId || "");
    return res.status(200).json({ cart: cart?.items || [] });
  }

  // 4. POST = atualizar carrinho
  if (req.method === "POST") {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "items deve ser um array" });
    }

    let cart;
    if (userId) {
      cart = await Cart.findOneAndUpdate(
        { userId },
        { items, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    } else {
      cart = await Cart.findOneAndUpdate(
        { sessionId },
        { items, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({ ok: true, cart: cart.items });
  }

  return res.status(405).json({ error: "Método não permitido" });
}
