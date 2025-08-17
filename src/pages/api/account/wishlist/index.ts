// INSANYCK STEP 8
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

type WishlistPayload = {
  slug: string;
  title: string;
  priceCents: number;
  image?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // PWA/Workbox: NetworkOnly
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const userId = (session.user as any).id as string;

  try {
    if (req.method === "GET") {
      const items = await prisma.wishlistItem.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
      return res.status(200).json({ items });
    }

    if (req.method === "POST") {
      const body: WishlistPayload = req.body;
      if (!body?.slug || !body?.title) return res.status(400).json({ error: "Invalid payload" });

      // Evitar duplicados: se já existe slug igual para o user, só retorna
      const exists = await prisma.wishlistItem.findFirst({ where: { userId, slug: body.slug } });
      if (exists) return res.status(200).json({ item: exists });

      const created = await prisma.wishlistItem.create({
        data: { ...body, userId },
      });
      return res.status(201).json({ item: created });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? "Server error" });
  }
}
