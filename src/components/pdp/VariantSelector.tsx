// INSANYCK HOTFIX G-12.2 — Premium Variant Selector (real, not decorative)
"use client";

import { useMemo, useCallback } from "react";
import { useTranslation } from "next-i18next";

type VariantOption = {
  optionValue: {
    value: string;
    slug?: string;
    option: {
      slug: string; // "size" | "color"
      name: string;
    };
  };
};

type Variant = {
  id: string;
  sku?: string;
  title?: string;
  price?: { cents: number; currency?: string };
  inventory?: { quantity?: number; reserved?: number };
  options?: VariantOption[];
};

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string | null;
  onSelect: (variant: Variant) => void;
}

// INSANYCK G-12.2 — Extract unique options from variants
function extractOptions(variants: Variant[]) {
  const sizes = new Map<string, { value: string; available: boolean }>();
  const colors = new Map<string, { value: string; slug?: string; available: boolean }>();

  variants.forEach((variant) => {
    const isAvailable = (variant.inventory?.quantity ?? 0) > (variant.inventory?.reserved ?? 0);

    variant.options?.forEach((opt) => {
      const optionType = opt.optionValue.option.slug;
      const value = opt.optionValue.value;
      const slug = opt.optionValue.slug;

      if (optionType === "size") {
        const existing = sizes.get(value);
        sizes.set(value, {
          value,
          available: existing?.available || isAvailable,
        });
      } else if (optionType === "color") {
        const existing = colors.get(value);
        colors.set(value, {
          value,
          slug,
          available: existing?.available || isAvailable,
        });
      }
    });
  });

  return {
    sizes: Array.from(sizes.values()),
    colors: Array.from(colors.values()),
  };
}

// INSANYCK G-12.2 — Find variant by selected options
function findVariantByOptions(
  variants: Variant[],
  selectedSize: string | null,
  selectedColor: string | null
): Variant | null {
  return variants.find((variant) => {
    const options = variant.options ?? [];

    const sizeMatch = !selectedSize || options.some(
      (opt) => opt.optionValue.option.slug === "size" && opt.optionValue.value === selectedSize
    );

    const colorMatch = !selectedColor || options.some(
      (opt) => opt.optionValue.option.slug === "color" && opt.optionValue.value === selectedColor
    );

    return sizeMatch && colorMatch;
  }) ?? null;
}

export default function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
}: VariantSelectorProps) {
  const { t } = useTranslation("pdp");

  const { sizes, colors } = useMemo(() => extractOptions(variants), [variants]);

  // INSANYCK G-12.2 — Get current selections from selected variant
  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  const currentSize = useMemo(() => {
    return selectedVariant?.options?.find(
      (opt) => opt.optionValue.option.slug === "size"
    )?.optionValue.value ?? null;
  }, [selectedVariant]);

  const currentColor = useMemo(() => {
    return selectedVariant?.options?.find(
      (opt) => opt.optionValue.option.slug === "color"
    )?.optionValue.value ?? null;
  }, [selectedVariant]);

  // INSANYCK G-12.2 — Handle size selection
  const handleSizeSelect = useCallback(
    (size: string) => {
      const variant = findVariantByOptions(variants, size, currentColor);
      if (variant) {
        onSelect(variant);
      }
    },
    [variants, currentColor, onSelect]
  );

  // INSANYCK G-12.2 — Handle color selection
  const handleColorSelect = useCallback(
    (color: string) => {
      const variant = findVariantByOptions(variants, currentSize, color);
      if (variant) {
        onSelect(variant);
      }
    },
    [variants, currentSize, onSelect]
  );

  // INSANYCK G-12.2 — Don't render if no options
  if (sizes.length === 0 && colors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* SIZE SELECTOR */}
      {sizes.length > 0 && (
        <div className="ins-panel__section">
          <span className="ins-panel__label">
            {t("label.size", "TAMANHO")}
          </span>
          <div className="ins-panel__selector" role="radiogroup" aria-label={t("selectSize", "Escolha seu tamanho")}>
            {sizes.map((size) => (
              <button
                key={size.value}
                type="button"
                role="radio"
                aria-checked={currentSize === size.value}
                disabled={!size.available}
                onClick={() => handleSizeSelect(size.value)}
                className={`
                  ins-panel__selector-btn
                  ${currentSize === size.value ? "ins-panel__selector-btn--active" : ""}
                  ${!size.available ? "opacity-40 cursor-not-allowed line-through" : ""}
                `}
              >
                {size.value}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* COLOR SELECTOR */}
      {colors.length > 0 && (
        <div className="ins-panel__section">
          <span className="ins-panel__label">
            {t("label.color", "COR")}
          </span>
          <div className="ins-panel__selector" role="radiogroup" aria-label={t("selectColor", "Escolha sua cor")}>
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                role="radio"
                aria-checked={currentColor === color.value}
                aria-label={color.value}
                disabled={!color.available}
                onClick={() => handleColorSelect(color.value)}
                className={`
                  ins-panel__selector-btn px-4
                  ${currentColor === color.value ? "ins-panel__selector-btn--active" : ""}
                  ${!color.available ? "opacity-40 cursor-not-allowed" : ""}
                `}
              >
                {color.value}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INSANYCK G-12.2 — Selection hint (only if not all selected) */}
      {(sizes.length > 0 || colors.length > 0) && !selectedVariantId && (
        <p className="text-sm text-white/40 mt-2">
          {t("selectRequired", "Selecione as opções acima para continuar")}
        </p>
      )}
    </div>
  );
}
