"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FiltersDockProps {
  categories: Category[];
  totalProducts: number;
}

interface PopoverState {
  category: boolean;
  size: boolean;
  sort: boolean;
}

export default function FiltersDock({ categories, totalProducts }: FiltersDockProps) {
  const { t } = useTranslation(["plp", "catalog"]);
  const router = useRouter();
  const [popovers, setPopovers] = useState<PopoverState>({
    category: false,
    size: false,
    sort: false,
  });

  const { category, size, color, inStock, sort = "newest" } = router.query;

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setPopovers({ category: false, size: false, sort: false });
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
    router.push({ pathname: router.pathname }, undefined, { shallow: true });
  };

  const isFilterActive = (key: string, value: string) => {
    return router.query[key] === value;
  };

  const togglePopover = (key: keyof PopoverState, event: React.MouseEvent) => {
    event.stopPropagation();
    setPopovers(prev => ({
      category: false,
      size: false,
      sort: false,
      [key]: !prev[key],
    }));
  };

  const activeFiltersCount = [category, size, color, inStock].filter(Boolean).length;
  const categoryName = categories.find(c => c.slug === category)?.name;

  const sizes = ["P", "M", "G", "EG"];
  const sortOptions = [
    { value: "newest", label: t("catalog:sort.newest", "Mais Recentes") },
    { value: "name", label: t("catalog:sort.name", "Nome") },
    { value: "price_asc", label: t("catalog:sort.price_asc", "Menor Preço") },
    { value: "price_desc", label: t("catalog:sort.price_desc", "Maior Preço") },
  ];

  return (
    <div className="filters-dock sticky top-24 z-40 bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="max-w-[1200px] mx-auto px-6 py-4">
        {/* Mobile/Tablet: Horizontal chips */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {/* Filter toggle button */}
            <button
              onClick={(e) => togglePopover('category', e)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm">{t("catalog:filters.label", "Filtros")}</span>
              {activeFiltersCount > 0 && (
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Active filter chips */}
            {categoryName && (
              <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/10 border border-white/20">
                <span className="text-sm">{categoryName}</span>
                <button
                  onClick={() => updateFilter("category", null)}
                  className="p-0.5 rounded-full hover:bg-white/20"
                  aria-label={t("catalog:filters.remove", "Remover filtro")}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {size && (
              <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/10 border border-white/20">
                <span className="text-sm">Tamanho: {size}</span>
                <button
                  onClick={() => updateFilter("size", null)}
                  className="p-0.5 rounded-full hover:bg-white/20"
                  aria-label={t("catalog:filters.remove", "Remover filtro")}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {inStock && (
              <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/10 border border-white/20">
                <span className="text-sm">{t("catalog:filters.in_stock", "Em Estoque")}</span>
                <button
                  onClick={() => updateFilter("inStock", null)}
                  className="p-0.5 rounded-full hover:bg-white/20"
                  aria-label={t("catalog:filters.remove", "Remover filtro")}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Sort */}
            <div className="relative">
              <button
                onClick={(e) => togglePopover('sort', e)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                <span className="text-sm">
                  {sortOptions.find(opt => opt.value === sort)?.label}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Sort popover */}
              {popovers.sort && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/15 rounded-xl shadow-xl z-50">
                  <div className="p-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          updateFilter("sort", option.value);
                          setPopovers(prev => ({ ...prev, sort: false }));
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          sort === option.value
                            ? "bg-white/15 text-white"
                            : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Dock sidebar */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Categories */}
            <div className="relative">
              <button
                onClick={(e) => togglePopover('category', e)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-sm">
                  {categoryName || t("catalog:filters.all_categories", "Categorias")}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {popovers.category && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-black/90 backdrop-blur-xl border border-white/15 rounded-xl shadow-xl z-50">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        updateFilter("category", null);
                        setPopovers(prev => ({ ...prev, category: false }));
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        !category ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      {t("catalog:filters.all_categories", "Todas Categorias")}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          updateFilter("category", cat.slug);
                          setPopovers(prev => ({ ...prev, category: false }));
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          category === cat.slug
                            ? "bg-white/15 text-white"
                            : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sizes */}
            <div className="flex gap-2">
              {sizes.map((sizeOption) => (
                <button
                  key={sizeOption}
                  onClick={() =>
                    updateFilter("size", isFilterActive("size", sizeOption) ? null : sizeOption)
                  }
                  className={`px-3 py-2 rounded-full border border-white/15 hover:bg-white/10 transition-colors text-sm ${
                    isFilterActive("size", sizeOption) ? "bg-white/15 text-white" : "text-white/80"
                  }`}
                >
                  {sizeOption}
                </button>
              ))}
            </div>

            {/* In Stock */}
            <button
              onClick={() =>
                updateFilter("inStock", isFilterActive("inStock", "true") ? null : "true")
              }
              className={`px-4 py-2 rounded-full border border-white/15 hover:bg-white/10 transition-colors text-sm ${
                isFilterActive("inStock", "true") ? "bg-white/15 text-white" : "text-white/80"
              }`}
            >
              {t("catalog:filters.in_stock", "Em Estoque")}
            </button>

            {/* Clear filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-full border border-white/15 text-white/60 hover:text-white/80 hover:bg-white/5 transition-colors text-sm"
              >
                {t("catalog:filters.clear_all", "Limpar filtros")}
              </button>
            )}
          </div>

          {/* Sort + Results count */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">
              {totalProducts} {t("plp:products_count", "produtos")}
            </span>

            <div className="relative">
              <button
                onClick={(e) => togglePopover('sort', e)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-sm">
                  {sortOptions.find(opt => opt.value === sort)?.label}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {popovers.sort && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/15 rounded-xl shadow-xl z-50">
                  <div className="p-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          updateFilter("sort", option.value);
                          setPopovers(prev => ({ ...prev, sort: false }));
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          sort === option.value
                            ? "bg-white/15 text-white"
                            : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}