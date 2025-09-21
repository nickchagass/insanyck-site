// INSANYCK STEP 4 · Lote 4 — PWA update banner with glass aesthetic
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "next-i18next";
import { X, RefreshCw } from "lucide-react";
import { useState } from "react";

interface UpdateBannerProps {
  onUpdate: () => void;
  updating?: boolean;
}

export function UpdateBanner({ onUpdate, updating = false }: UpdateBannerProps) {
  const { t } = useTranslation('common');
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={t('pwa.updateAvailable', 'App update available')}
      >
        <div className="mx-auto max-w-4xl">
          <div className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: updating ? 360 : 0 }}
                  transition={{ 
                    duration: 1, 
                    repeat: updating ? Infinity : 0,
                    ease: "linear"
                  }}
                >
                  <RefreshCw className="h-5 w-5 text-white" aria-hidden="true" />
                </motion.div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {t('pwa.updateTitle', 'Nova versão disponível')}
                  </p>
                  <p className="text-white/70 text-xs">
                    {t('pwa.updateDescription', 'Atualize para a versão mais recente do INSANYCK')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={onUpdate}
                  disabled={updating}
                  className="inline-flex items-center justify-center px-4 py-2 bg-white text-black border border-white/20 shadow-sm hover:shadow-md rounded-xl font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all duration-150 cubic-bezier(0.2, 0, 0, 1) disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!updating ? { 
                    scale: 1.015, 
                    boxShadow: "0 4px 12px rgba(255,255,255,0.1)"
                  } : undefined}
                  whileTap={!updating ? { scale: 0.985 } : undefined}
                  aria-busy={updating}
                >
                  {updating ? t('pwa.updating', 'Atualizando...') : t('pwa.update', 'Atualizar')}
                </motion.button>

                <motion.button
                  onClick={() => setDismissed(true)}
                  className="inline-flex items-center justify-center p-2 bg-transparent text-white/70 hover:text-white border border-white/15 hover:bg-white/5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all duration-150 cubic-bezier(0.2, 0, 0, 1)"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  aria-label={t('pwa.dismiss', 'Dispensar')}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}