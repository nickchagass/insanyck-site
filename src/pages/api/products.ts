// pages/api/products.ts
import type { NextApiRequest, NextApiResponse } from "next";

const produtos = [
  {
    id: "1",
    nome: "Oversized Classic",
    preco: 199,
    thumb: "/assets/OversizedClassic.jpeg",
    imagem3d: "/assets/oversized3d.glb", // Exemplo
    destaque: true,
  },
  {
    id: "2",
    nome: "Regata Essential",
    preco: 179,
    thumb: "/assets/RegataEssential.jpeg",
    imagem3d: "/assets/regata3d.glb",
    destaque: false,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(produtos);
}
