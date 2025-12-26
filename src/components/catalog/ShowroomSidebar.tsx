// INSANYCK STEP G-05.X — Showroom Sidebar (Desktop Enterprise)
"use client";

import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ShowroomSidebarProps {
  categories: Category[];
}

export default function ShowroomSidebar({ categories }: ShowroomSidebarProps) {
  const { t } = useTranslation(["plp", "catalog"]);
  const router = useRouter();

  const { category, size, inStock } = router.query;

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

  return (
    <aside
      className="w-64 flex-shrink-0 sticky top-28 h-fit"
      aria-label={t("catalog:filters.label", "Filtros")}
    >
      {/* INSANYCK STEP G-05.X — Showroom Sidebar: glass dark + hairline titanium */}
      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/95 uppercase tracking-wider">
            {t("catalog:filters.label", "Filtros")}
          </h2>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-white/60 hover:text-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
              aria-label={t("catalog:filters.clear_all", "Limpar filtros")}
            >
              {t("catalog:filters.clear_all", "Limpar")}
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-white/70 uppercase tracking-wide">
            {t("catalog:filters.categories", "Categorias")}
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => updateFilter("category", null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] ${
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
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] ${
                  category === cat.slug
                    ? "bg-white/10 text-white/95 font-medium border border-white/15"
                    : "text-white/75 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Hairline separator */}
        <div className="border-t border-white/10" />

        {/* Sizes */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-white/70 uppercase tracking-wide">
            {t("catalog:filters.size", "Tamanho")}
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {sizes.map((sizeOption) => (
              <button
                key={sizeOption}
                onClick={() =>
                  updateFilter("size", isFilterActive("size", sizeOption) ? null : sizeOption)
                }
                className={`px-3 py-2 rounded-lg border transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] ${
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
          <h3 className="text-xs font-medium text-white/70 uppercase tracking-wide">
            {t("catalog:filters.availability", "Disponibilidade")}
          </h3>
          <button
            onClick={() =>
              updateFilter("inStock", isFilterActive("inStock", "true") ? null : "true")
            }
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] ${
              isFilterActive("inStock", "true")
                ? "bg-white/10 text-white/95 font-medium border border-white/15"
                : "text-white/75 hover:bg-white/5 hover:text-white/90"
            }`}
          >
            {t("catalog:filters.in_stock", "Em Estoque")}
          </button>
        </div>

        {/* Reset button (when filters active) */}
        {activeFiltersCount > 0 && (
          <>
            <div className="border-t border-white/10" />
            <button
              onClick={clearAllFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:border-white/15 hover:text-white/95 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
            >
              <X className="w-4 h-4" />
              {t("catalog:filters.clear_all", "Limpar filtros")}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
