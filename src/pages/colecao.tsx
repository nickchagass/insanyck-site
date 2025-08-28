// INSANYCK STEP 11 — Collection Page with Real Prisma Integration  
import useSWR from "swr";
import ProductCard from "@/components/ProductCard";
import ProductGrid from "@/components/ProductGrid";
import { ProductCardData } from "@/types/product";

const fetcher = (url: string) => fetch(url).then(r => r.json());

ColecaoPage.getInitialProps = async () => {
  return {};
};

export default function ColecaoPage() {
  const { data: produtos, error } = useSWR("/api/products", fetcher);

  if (error) return <div className="p-8 text-white">Falha ao carregar produtos</div>;
  if (!produtos) return <div className="p-8 text-white">Carregando...</div>;

  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Coleção</h1>
      <ProductGrid items={produtos as ProductCardData[]} />
    </section>
  );
}
