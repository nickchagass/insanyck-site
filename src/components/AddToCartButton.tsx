import { useCart } from "@/store/useCart";

type AddToCartButtonProps = {
  product: {
    id: string;
    nome: string;
    preco: number;
    cor: string;
    tamanho: string;
    image?: string;
    variantId?: string;
  };
};

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const add = useCart((s) => s.add);

  return (
    <button
      className="bg-yellow-400 px-4 py-2 rounded-xl font-bold hover:bg-yellow-500 transition"
      onClick={() =>
        add({
          ...product,
          quantidade: 1,
          currency: "BRL", // ou "USD", "EUR"
        })
      }
    >
      Adicionar ao carrinho
    </button>
  );
}
