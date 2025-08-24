// INSANYCK STEP 11 — ProductGrid with Real Prisma Types
import ProductCard from "@/components/ProductCard";
import Skeleton from "@/components/Skeleton";
import { ProductCardData } from "@/types/product";

type Props = { items?: ProductCardData[]; className?: string; showSkeleton?: boolean; skeletonCount?: number };

export default function ProductGrid({ items = [], className, showSkeleton = false, skeletonCount = 8 }: Props) {
  const list = Array.isArray(items) ? items : [];
  
  if (showSkeleton && !list.length) {
    return (
      <section className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className || ''}`} aria-live="polite">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <article key={i} className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <Skeleton.Thumb />
            <div className="mt-3 space-y-2">
              <Skeleton.TextLg className="w-4/5" />
              <Skeleton.Text className="w-2/5" />
            </div>
          </article>
        ))}
      </section>
    );
  }
  
  if (!list.length) {
    return <section className={className} aria-live="polite" />;
  }
  
  return (
    <section className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className || ''}`}>
      {list.map((p) => (
        <ProductCard key={p.id ?? p.slug} product={p} />
      ))}
    </section>
  );
}
