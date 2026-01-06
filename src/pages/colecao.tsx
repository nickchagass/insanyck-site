// INSANYCK STEP PLP-03 — Collection Page with Real Prisma Integration + Ferrari PLP Scope
import useSWR from "swr";
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
    // INSANYCK STEP PLP-03 — .plp-scope ativa regras CSS do Ferrari PLP Vault
    <main className="plp-scope min-h-screen pt-24 lg:pt-32">
      <section className="px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Coleção</h1>
        <ProductGrid items={produtos as ProductCardData[]} />
      </section>
    </main>
  );
}
