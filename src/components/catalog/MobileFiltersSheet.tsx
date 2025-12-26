// INSANYCK STEP G-05.X — Mobile Filters Sheet (Vertical Luxury)
"use client";

import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MobileFiltersSheetProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileFiltersSheet({
  categories,
  isOpen,
  onClose,
}: MobileFiltersSheetProps) {
  const { t } = useTranslation(["plp", "catalog"]);
  const router = useRouter();
  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [sortExpanded, setSortExpanded] = useState(false);

  const { category, size, inStock, sort = "newest" } = router.query;

  const updateFilter = (key: string, value: string | null) => {
    const newQuery = { ...router.query };

    if (value) {
      newQuery[key] = value;
    } else {
      delete newQuery[key];
    }

    router.push({ pathname: router.pathname, query: newQuery }, undefined, {
      shallow: true,
    });
  };

  const clearAllFilters = () => {
    const newQuery = { ...router.query };
    delete newQuery.category;
    delete newQuery.size;
    delete newQuery.color;
    delete newQuery.inStock;
    router.push({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
  };

  const isFilterActive = (key: string, value: string) => {
    return router.query[key] === value;
  };

  const activeFiltersCount = [category, size, inStock].filter(Boolean).length;
  const sizes = ["P", "M", "G", "EG"];

  const sortOptions = [
    { value: "newest", label: t("catalog:sort.newest", "Mais Recentes") },
    { value: "name", label: t("catalog:sort.name", "Nome") },
    { value: "price_asc", label: t("catalog:sort.price_asc", "Menor Preço") },
    { value: "price_desc", label: t("catalog:sort.price_desc", "Maior Preço") },
  ];

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* INSANYCK STEP G-05.X — Backdrop (premium dark with blur) */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* INSANYCK STEP G-05.X — Sheet (slides up from bottom) */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-2xl border-t border-white/10 bg-gradient-to-b from-black/95 to-black/98 backdrop-blur-xl shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filters-sheet-title"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-white/80" aria-hidden="true" />
            <h2
              id="filters-sheet-title"
              className="text-base font-semibold text-white/95 uppercase tracking-wider"
            >
              {t("catalog:filters.label", "Filtros")}
            </h2>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white/90 text-xs font-medium">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
            aria-label={t("common:close", "Fechar")}
          >
            <X className="w-5 h-5 text-white/80" aria-hidden="true" />
          </button>
        </div>

        {/* Content (scrollable) */}
        <div className="overflow-y-auto max-h-[calc(85vh-120px)] px-6 py-4 space-y-6">

          {/* Categories */}
          <div className="space-y-3">
            <button
              onClick={() => setCategoryExpanded(!categoryExpanded)}
              className="w-full flex items-center justify-between text-left"
              aria-expanded={categoryExpanded}
            >
              <h3 className="text-sm font-medium text-white/80 uppercase tracking-wide">
                {t("catalog:filters.categories", "Categorias")}
              </h3>
              <ChevronDown
                className={`w-4 h-4 text-white/60 transition-transform ${
                  categoryExpanded ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {categoryExpanded && (
              <div className="space-y-1 pl-1">
                <button
                  onClick={() => updateFilter("category", null)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] ${
                    !category
                      ? "bg-white/10 text-white/95 font-medium border border-white/15"
                      : "text-white/75 hover:bg-white/5 hover:text-white/90"
                  }`}
                >
                  {t("catalog:filters.all_categories", "Todas")}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter("category", cat.slug)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] ${
                      category === cat.slug
                        ? "bg-white/10 text-white/95 font-medium border border-white/15"
                        : "text-white/75 hover:bg-white/5 hover:text-white/90"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hairline separator */}
          <div className="border-t border-white/10" />

          {/* Sizes */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/80 uppercase tracking-wide">
              {t("catalog:filters.size", "Tamanho")}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {sizes.map((sizeOption) => (
                <button
                  key={sizeOption}
                  onClick={() =>
                    updateFilter("size", isFilterActive("size", sizeOption) ? null : sizeOption)
                  }
                  className={`px-3 py-2.5 rounded-lg border transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] ${
                    isFilterActive("size", sizeOption)
                      ? "bg-white/10 text-white/95 border-white/20"
                      : "border-white/10 text-white/75 hover:bg-white/5 hover:border-white/15 hover:text-white/90"
                  }`}
                >
                  {sizeOption}
                </button>
              ))}
            </div>
          </div>

          {/* Hairline separator */}
          <div className="border-t border-white/10" />

          {/* Availability */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/80 uppercase tracking-wide">
              {t("catalog:filters.availability", "Disponibilidade")}
            </h3>
            <button
              onClick={() =>
                updateFilter("inStock", isFilterActive("inStock", "true") ? null : "true")
              }
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] ${
                isFilterActive("inStock", "true")
                  ? "bg-white/10 text-white/95 font-medium border border-white/15"
                  : "text-white/75 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              {t("catalog:filters.in_stock", "Em Estoque")}
            </button>
          </div>

          {/* Hairline separator */}
          <div className="border-t border-white/10" />

          {/* Sort */}
          <div className="space-y-3">
            <button
              onClick={() => setSortExpanded(!sortExpanded)}
              className="w-full flex items-center justify-between text-left"
              aria-expanded={sortExpanded}
            >
              <h3 className="text-sm font-medium text-white/80 uppercase tracking-wide">
                {t("catalog:sort.label", "Ordenar")}
              </h3>
              <ChevronDown
                className={`w-4 h-4 text-white/60 transition-transform ${
                  sortExpanded ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {sortExpanded && (
              <div className="space-y-1 pl-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFilter("sort", option.value)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] ${
                      sort === option.value
                        ? "bg-white/10 text-white/95 font-medium border border-white/15"
                        : "text-white/75 hover:bg-white/5 hover:text-white/90"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer (sticky) */}
        <div className="sticky bottom-0 z-10 flex gap-3 px-6 py-4 border-t border-white/10 bg-black/95 backdrop-blur-md">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex-1 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:border-white/15 hover:text-white/95 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
            >
              {t("catalog:filters.clear_all", "Limpar")}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-white/15 bg-white/10 text-white/95 hover:bg-white/15 hover:border-white/20 transition-colors text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
          >
            {t("common:apply", "Aplicar")}
          </button>
        </div>
      </div>
    </>
  );
}
