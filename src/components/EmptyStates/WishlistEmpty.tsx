// INSANYCK STEP 4 · Lote 3 — Polished empty wishlist state
"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function WishlistEmpty() {
  const { t } = useTranslation(["common", "wishlist"]);

  return (
    <motion.div 
      className="text-center py-20 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
    >
      {/* INSANYCK STEP 4 · Lote 3 — Elegant heart illustration */}
      <motion.div 
        className="relative mx-auto w-36 h-36 mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 to-white/15 border border-white/10" />
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-white/10 to-white/20 border border-white/20 backdrop-blur-sm" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart 
            className="w-14 h-14 text-white/60" 
            strokeWidth={1.5}
          />
        </div>
        
        {/* INSANYCK STEP 4 · Lote 3 — Floating sparkles */}
        <motion.div
          className="absolute -top-1 left-8 w-4 h-4 rounded-full bg-white/20 border border-white/30 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-2 h-2 text-white/60" />
        </motion.div>
        
        <motion.div
          className="absolute -bottom-1 right-6 w-3 h-3 rounded-full bg-white/15 border border-white/25"
          animate={{ 
            y: [-3, 3, -3],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </motion.div>

      {/* INSANYCK STEP 4 · Lote 3 — Content with luxury tone */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-2xl font-bold text-white/90 mb-4">
          {t("wishlist:empty.title", "Seus favoritos aguardam")}
        </h3>
        
        <p className="text-white/60 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
          {t("wishlist:empty.description", "Salve as peças que capturam sua essência e volte quando estiver pronto para decidir")}
        </p>

        {/* INSANYCK STEP 4 · Lote 3 — Call to action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/pt/loja">
            <Button variant="primary" size="lg">
              {t("common:cta.discover", "Descobrir peças")}
            </Button>
          </Link>
          
          <Link href="/pt">
            <Button variant="ghost" size="lg">
              {t("common:cta.home", "Voltar ao início")}
            </Button>
          </Link>
        </div>

        {/* INSANYCK STEP 4 · Lote 3 — Subtle tip */}
        <motion.div 
          className="mt-12 text-sm text-white/40 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Heart className="w-3 h-3" />
          {t("wishlist:empty.tip", "Toque no coração para salvar suas peças favoritas")}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}