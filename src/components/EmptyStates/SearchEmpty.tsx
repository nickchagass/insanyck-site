// INSANYCK STEP 4 · Lote 3 — Polished empty search state
"use client";

import { motion } from "framer-motion";
import { Search, Filter, RotateCcw } from "lucide-react";
import { useTranslation } from "next-i18next";
import { Button } from "@/components/ui/Button";

interface SearchEmptyProps {
  query?: string;
  onClearFilters?: () => void;
  onNewSearch?: () => void;
}

export default function SearchEmpty({ query, onClearFilters, onNewSearch }: SearchEmptyProps) {
  const { t } = useTranslation(["common", "search"]);

  return (
    <motion.div 
      className="text-center py-20 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
    >
      {/* INSANYCK STEP 4 · Lote 3 — Search illustration */}
      <motion.div 
        className="relative mx-auto w-32 h-32 mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 to-white/10 border border-white/10" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/10 to-white/20 border border-white/20 backdrop-blur-sm" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <Search 
            className="w-12 h-12 text-white/60" 
            strokeWidth={1.5}
          />
        </div>
        
        {/* INSANYCK STEP 4 · Lote 3 — Animated search pulse */}
        <motion.div
          className="absolute inset-2 rounded-full border border-white/20"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* INSANYCK STEP 4 · Lote 3 — Content based on search context */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-2xl font-bold text-white/90 mb-4">
          {query 
            ? t("search:empty.withQuery.title", "Nenhum resultado encontrado")
            : t("search:empty.noQuery.title", "Comece sua busca")
          }
        </h3>
        
        <p className="text-white/60 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
          {query ? (
            <>
              {t("search:empty.withQuery.description", "Não encontramos nada para")}{" "}
              <span className="text-white/80 font-medium">"{query}"</span>
              <br />
              {t("search:empty.withQuery.suggestion", "Tente termos mais gerais ou explore nossa coleção")}
            </>
          ) : (
            t("search:empty.noQuery.description", "Digite o que procura ou explore nossas categorias")
          )}
        </p>

        {/* INSANYCK STEP 4 · Lote 3 — Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {query && onClearFilters && (
            <Button variant="ghost" size="lg" onClick={onClearFilters}>
              <Filter className="w-4 h-4 mr-2" />
              {t("search:empty.actions.clearFilters", "Limpar filtros")}
            </Button>
          )}
          
          {onNewSearch && (
            <Button variant="ghost" size="lg" onClick={onNewSearch}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t("search:empty.actions.newSearch", "Nova busca")}
            </Button>
          )}
          
          <Button variant="primary" size="lg">
            {t("common:cta.exploreAll", "Explorar tudo")}
          </Button>
        </div>

        {/* INSANYCK STEP 4 · Lote 3 — Search suggestions */}
        <motion.div 
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm text-white/40 mb-4">
            {t("search:empty.suggestions.title", "Termos populares:")}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["oversized", "clássico", "premium", "essencial"].map((term) => (
              <button
                key={term}
                className="px-3 py-1 text-sm border border-white/15 text-white/60 hover:text-white/80 hover:border-white/25 rounded-full transition-colors duration-150"
              >
                {term}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}