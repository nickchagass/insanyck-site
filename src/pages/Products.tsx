import React from "react";
import dynamic from "next/dynamic";

const ProductCard3D = dynamic(() => import("@/components/ProductCard3D").then(mod => ({ default: mod.ProductCard3D })), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-900 rounded-xl p-6 h-96 flex items-center justify-center">
      <div className="text-yellow-400 font-bold animate-pulse">Carregando...</div>
    </div>
  )
});

const produtos3D = [
  {
    glbUrl: "/assets/models/oversized_classic.glb",
    image: "/assets/oversized_classic.jpg",
    name: "Oversized Classic",
    price: "R$ 199,00",
    isNew: true,
    isFeatured: true,
  },
  {
    glbUrl: "/assets/models/regata_essential.glb",
    image: "/assets/regata_essential.jpg",
    name: "Regata Essential",
    price: "R$ 179,00",
    isNew: true,
    isFeatured: false,
  },
];

Products.getInitialProps = async () => {
  return {};
};

export default function Products() {
  return (
    <section className="bg-black min-h-screen py-8">
      <h1 className="text-center text-3xl text-yellow-400 font-black mb-10 tracking-widest">
        COLEÇÃO INSANYCK
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-7xl mx-auto">
        {produtos3D.map((produto, i) => (
          <ProductCard3D
            key={i}
            glbUrl={produto.glbUrl}
            image={produto.image}
            name={produto.name}
            price={produto.price}
            isNew={produto.isNew}
            isFeatured={produto.isFeatured}
            onDetails={() => alert(`Detalhes do produto: ${produto.name}`)}
          />
        ))}
      </div>
    </section>
  );
}
