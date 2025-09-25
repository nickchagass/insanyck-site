// INSANYCK STEP 10 — Public Products API
// src/pages/api/products/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getAllProducts } from "@/lib/catalog";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { category, sortBy, limit, offset } = req.query;
    const products = await getAllProducts({
      categorySlug: typeof category === "string" ? category : undefined,
      sortBy: typeof sortBy === "string" ? (sortBy as any) : "newest",
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
    });
    res.status(200).json({ products });
  } catch {
    res.status(200).json({ products: [] });
  }
}
