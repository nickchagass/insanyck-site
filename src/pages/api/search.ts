// src/pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { searchProducts } from "@/lib/catalog";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const q = typeof req.query.q === "string" ? req.query.q : "";
  const limit = req.query.limit ? Number(req.query.limit) : 8;

  try {
    const results = await searchProducts(q, limit);
    return res.status(200).json({ results });
  } catch {
    // fallback final sem 500
    return res.status(200).json({ results: [] });
  }
}