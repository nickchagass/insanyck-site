// INSANYCK G-11.1 — Showroom Sidebar Museum Edition
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
      {/* INSANYCK G-11.1 — Museum sidebar: specular wire + corner prism */}
      <div className="ins-sidebar">

        {/* Header */}
        <div className="ins-sidebar__header flex items-center justify-between">
          <h2>
            {t("catalog:filters.label", "Filtros")}
          </h2>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-white/60 hover:text-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cold-ray-ring)]"
              aria-label={t("catalog:filters.clear_all", "Limpar filtros")}
            >
              {t("catalog:filters.clear_all", "Limpar")}
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="ins-sidebar__section">
          <h3 className="ins-sidebar__title">
            {t("catalog:filters.categories", "Categorias")}
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => updateFilter("category", null)}
              className={`ins-sidebar__option ${
                !category ? "ins-sidebar__option--active" : ""
              }`}
            >
              {t("catalog:filters.all_categories", "Todas")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateFilter("category", cat.slug)}
                className={`ins-sidebar__option ${
                  category === cat.slug ? "ins-sidebar__option--active" : ""
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="ins-sidebar__section">
          <h3 className="ins-sidebar__title">
            {t("catalog:filters.size", "Tamanho")}
          </h3>
          <div className="ins-sidebar__sizes">
            {sizes.map((sizeOption) => (
              <button
                key={sizeOption}
                onClick={() =>
                  updateFilter("size", isFilterActive("size", sizeOption) ? null : sizeOption)
                }
                className={`ins-sidebar__size-btn ${
                  isFilterActive("size", sizeOption) ? "ins-sidebar__size-btn--active" : ""
                }`}
              >
                {sizeOption}
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="ins-sidebar__section">
          <h3 className="ins-sidebar__title">
            {t("catalog:filters.availability", "Disponibilidade")}
          </h3>
          <button
            onClick={() =>
              updateFilter("inStock", isFilterActive("inStock", "true") ? null : "true")
            }
            className={`ins-sidebar__option ${
              isFilterActive("inStock", "true") ? "ins-sidebar__option--active" : ""
            }`}
          >
            {t("catalog:filters.in_stock", "Em Estoque")}
          </button>
        </div>

        {/* Reset button (when filters active) */}
        {activeFiltersCount > 0 && (
          <div className="ins-sidebar__section">
            <button
              onClick={clearAllFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:border-white/15 hover:text-white/95 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cold-ray-ring)]"
            >
              <X className="w-4 h-4" />
              {t("catalog:filters.clear_all", "Limpar filtros")}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
