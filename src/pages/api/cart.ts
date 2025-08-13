// INSANYCK STEP 6
// src/pages/api/cart.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apenas ecoa; útil para testar integração futura
  res.status(200).json({
    ok: true,
    method: req.method,
    body: req.body ?? null,
  });
}
