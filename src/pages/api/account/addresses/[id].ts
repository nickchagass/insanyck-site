// INSANYCK STEP 8
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { createAuthOptions } from "../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // PWA/Workbox: NetworkOnly
  const authOptions = await createAuthOptions();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = (session.user as any).id as string;
  const id = req.query.id as string;

  try {
    if (req.method === "PUT") {
      const body = req.body ?? {};
      if (body.isDefault) {
        await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      const updated = await prisma.address.update({
        where: { id },
        data: { ...body, isDefault: !!body.isDefault },
      });
      if (updated.userId !== userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      res.status(200).json({ address: updated });
      return;
    }

    if (req.method === "DELETE") {
      const found = await prisma.address.findUnique({ where: { id } });
      if (!found || found.userId !== userId) {
        res.status(404).json({ error: "Not Found" });
        return;
      }
      await prisma.address.delete({ where: { id } });
      res.status(204).end();
      return;
    }

    res.status(405).json({ error: "Method Not Allowed" });
    return;
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Server error" });
    return;
  }
}
