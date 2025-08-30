// INSANYCK STEP 8
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { createAuthOptions } from "../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

type AddressPayload = {
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  country: string;
  isDefault?: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // PWA/Workbox: esta rota deve ser NetworkOnly (sem cache)
  const authOptions = await createAuthOptions();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = (session.user as any).id as string;

  try {
    if (req.method === "GET") {
      const addresses = await prisma.address.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
      res.status(200).json({ addresses });
      return;
    }

    if (req.method === "POST") {
      const body: AddressPayload = req.body;
      if (!body?.name || !body?.cep || !body?.street || !body?.number) {
        res.status(400).json({ error: "Invalid payload" });
        return;
      }
      if (body.isDefault) {
        await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      const created = await prisma.address.create({
        data: { ...body, isDefault: !!body.isDefault, userId },
      });
      res.status(201).json({ address: created });
      return;
    }

    res.status(405).json({ error: "Method Not Allowed" });
    return;
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Server error" });
    return;
  }
}
