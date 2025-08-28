// INSANYCK STEP 8
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { createAuthOptions } from "../auth/[...nextauth]";

type MeResponse =
  | { user: { id: string; name: string | null; email: string | null; image?: string | null } }
  | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<MeResponse>) {
  const authOptions = await createAuthOptions();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { id, name, email, image } = session.user as any;
  return res.status(200).json({ user: { id, name: name ?? null, email: email ?? null, image: image ?? null } });
}
