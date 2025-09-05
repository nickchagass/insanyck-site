// INSANYCK STEP 4 · Lote 3 — Product card skeleton with subtle bloom animation
"use client";

import { motion } from "framer-motion";

// INSANYCK STEP 4 · Lote 3 — Skeleton base component with bloom effect
const SkeletonBase = ({ className = "" }: { className?: string }) => (
  <motion.div
    className={`bg-white/5 rounded-lg ${className}`}
    animate={{
      opacity: [0.5, 0.8, 0.5],
    }}
    transition={{
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    }}
  />
);

export default function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden">
      {/* INSANYCK STEP 4 · Lote 3 — Image skeleton with proper aspect ratio for zero CLS */}
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        <SkeletonBase className="w-full h-full" />
      </div>

      {/* INSANYCK STEP 4 · Lote 3 — Content skeleton matching ProductCard structure */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          {/* Title skeleton */}
          <SkeletonBase className="h-6 w-3/4" />
          {/* Badge skeleton */}
          <SkeletonBase className="h-6 w-12 rounded-full" />
        </div>

        {/* Price skeleton */}
        <div className="mt-2">
          <SkeletonBase className="h-5 w-20" />
        </div>

        {/* Actions skeleton */}
        <div className="mt-4 flex gap-3 items-center">
          <SkeletonBase className="h-10 w-24 rounded-xl" />
          <SkeletonBase className="h-10 w-32 rounded-xl" />
          <SkeletonBase className="h-10 w-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// INSANYCK STEP 4 · Lote 3 — Grid of product card skeletons for PLP
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}