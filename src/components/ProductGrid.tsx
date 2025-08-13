// INSANYCK STEP 5
// src/components/ProductGrid.tsx
import ProductCard from "@/components/ProductCard";
import { Product } from "@/data/products.mock";

type Props = { items: Product[] };

export default function ProductGrid({ items }: Props) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </section>
  );
}
