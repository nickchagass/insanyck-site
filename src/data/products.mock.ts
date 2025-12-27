// INSANYCK STEP 5 - ATUALIZADO MUSEUM EDITION
// src/data/products.mock.ts

export type Product = {
  id: string;
  slug: string;
  title: string;
  price: string;
  status?: "new" | "soldout";
  images?: {
    front?: string;
    back?: string;
    detail?: string;
  };
  thumbs?: {
    front?: string;
    back?: string;
    detail?: string;
  };
};

export const products: Product[] = [
  {
    id: "1",
    slug: "oversized-tee-preta", // Slug novo para a URL ficar bonita
    title: "Oversized Tee Preta", // Nome que aparece no site
    price: "R$ 159,00",
    status: "new",
    images: {
      // AQUI ESTÁ A MÁGICA: Apontando para sua foto nova transparente
      front: "/products/tee-oversized-preta/front.png",
      // Como ainda não temos costas/detalhe, vou repetir a frente para não quebrar
      back: "/products/tee-oversized-preta/front.png", 
      detail: "/products/tee-oversized-preta/front.png",
    },
    thumbs: {
      front: "/products/tee-oversized-preta/front.png",
      back: "/products/tee-oversized-preta/front.png",
      detail: "/products/tee-oversized-preta/front.png",
    },
  },
  // Mantive o produto antigo aqui embaixo caso queira usar de exemplo depois
  {
    id: "2",
    slug: "oversized-classic-off",
    title: "Oversized Classic Off-White",
    price: "R$ 159,00",
    status: "new",
    images: {
      front: "/products/oversized-classic-off/front.webp",
      back: "/products/oversized-classic-off/back.webp",
      detail: "/products/oversized-classic-off/detail.webp",
    },
    thumbs: {
      front: "/products/oversized-classic-off/thumbs/front.webp",
      back: "/products/oversized-classic-off/thumbs/back.webp",
      detail: "/products/oversized-classic-off/thumbs/detail.webp",
    },
  },
];