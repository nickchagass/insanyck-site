// INSANYCK STEP 4 · Lote 3 — Polished empty orders state
"use client";

import { motion } from "framer-motion";
import { Package, Clock, Star } from "lucide-react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function OrdersEmpty() {
  const { t } = useTranslation(["common", "account"]);

  return (
    <motion.div 
      className="text-center py-20 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
    >
      {/* INSANYCK STEP 4 · Lote 3 — Package illustration */}
      <motion.div 
        className="relative mx-auto w-36 h-36 mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-white/15 border border-white/10 rotate-12" />
        <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/20 border border-white/20 backdrop-blur-sm rotate-6" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <Package 
            className="w-14 h-14 text-white/60" 
            strokeWidth={1.5}
          />
        </div>
        
        {/* INSANYCK STEP 4 · Lote 3 — Floating elements */}
        <motion.div
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
          animate={{ 
            rotate: [0, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Clock className="w-4 h-4 text-white/50" />
        </motion.div>
        
        <motion.div
          className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-white/15 border border-white/25 flex items-center justify-center"
          animate={{ 
            y: [-2, 2, -2],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Star className="w-3 h-3 text-white/40" fill="currentColor" />
        </motion.div>
      </motion.div>

      {/* INSANYCK STEP 4 · Lote 3 — Content with INSANYCK luxury tone */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-2xl font-bold text-white/90 mb-4">
          {t("account:orders.empty.title", "Sua jornada começa aqui")}
        </h3>
        
        <p className="text-white/60 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
          {t("account:orders.empty.description", "Ainda não há pedidos em sua conta. Descubra peças que definem seu estilo único.")}
        </p>

        {/* INSANYCK STEP 4 · Lote 3 — Call to action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/pt/loja">
            <Button variant="primary" size="lg">
              {t("common:cta.startShopping", "Começar a explorar")}
            </Button>
          </Link>
          
          <Link href="/pt/favoritos">
            <Button variant="ghost" size="lg">
              {t("common:cta.viewWishlist", "Ver favoritos")}
            </Button>
          </Link>
        </div>

        {/* INSANYCK STEP 4 · Lote 3 — Benefits highlight */}
        <motion.div 
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Package className="w-4 h-4 text-white/60" />
            </div>
            <p className="text-sm text-white/50">
              {t("account:orders.benefits.shipping", "Entrega expressa")}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Star className="w-4 h-4 text-white/60" fill="currentColor" />
            </div>
            <p className="text-sm text-white/50">
              {t("account:orders.benefits.quality", "Qualidade premium")}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white/60" />
            </div>
            <p className="text-sm text-white/50">
              {t("account:orders.benefits.service", "Suporte 24/7")}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}