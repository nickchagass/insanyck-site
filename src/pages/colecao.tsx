import useSWR from "swr";
import { ProductCard3D } from "../src/components/ProductCard3D";
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ColecaoPage() {
  const { data: produtos, error } = useSWR("/api/products", fetcher);

  if (error) return <div>Falha ao carregar produtos</div>;
  if (!produtos) return <div>Carregando...</div>;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-8">
      {produtos.map((p: any) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </section>
  );
}
