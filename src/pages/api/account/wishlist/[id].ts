// INSANYCK STEP 8
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { createAuthOptions } from "../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // PWA/Workbox: NetworkOnly
  const authOptions = await createAuthOptions();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const userId = (session.user as any).id as string;
  const id = req.query.id as string;

  try {
    if (req.method === "DELETE") {
      const found = await prisma.wishlistItem.findUnique({ where: { id } });
      if (!found || found.userId !== userId) return res.status(404).json({ error: "Not Found" });
      await prisma.wishlistItem.delete({ where: { id } });
      return res.status(204).end();
    }
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? "Server error" });
  }
}
