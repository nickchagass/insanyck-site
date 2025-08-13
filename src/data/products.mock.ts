// INSANYCK STEP 5
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
      slug: "oversized-classic",
      title: "Oversized Classic",
      price: "R$199",
      status: "new",
      images: {
        front: "/products/oversized-classic/front.webp",
        back: "/products/oversized-classic/back.webp",
        detail: "/products/oversized-classic/detail.webp",
      },
      thumbs: {
        front: "/products/oversized-classic/thumbs/front.webp",
        back: "/products/oversized-classic/thumbs/back.webp",
        detail: "/products/oversized-classic/thumbs/detail.webp",
      },
    },
    // adicione outros produtos aqui quando quiser
  ];
  