// INSANYCK STEP 4 · Lote 3 — Hero section skeleton with bloom effect
"use client";

import { motion } from "framer-motion";

// INSANYCK STEP 4 · Lote 3 — Skeleton base component
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

export default function HeroSkeleton() {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center bg-black">
      {/* INSANYCK STEP 4 · Lote 3 — Hero content skeleton */}
      <div className="text-center max-w-4xl mx-auto px-4">
        {/* Main heading skeleton */}
        <SkeletonBase className="h-16 w-full max-w-2xl mx-auto mb-6" />
        
        {/* Subheading skeleton */}
        <SkeletonBase className="h-8 w-3/4 mx-auto mb-8" />
        
        {/* CTA buttons skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SkeletonBase className="h-12 w-40 rounded-xl" />
          <SkeletonBase className="h-12 w-32 rounded-xl" />
        </div>
      </div>

      {/* INSANYCK STEP 4 · Lote 3 — Background accent skeleton */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <SkeletonBase className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20" />
        <SkeletonBase className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15" />
      </div>
    </div>
  );
}