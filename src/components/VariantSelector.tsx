// INSANYCK STEP 10 — Seletor de Variantes
// src/components/VariantSelector.tsx
import { useState, useEffect } from 'react';

interface OptionValue {
  slug: string;
  name: string;
  value: string;
}

interface Option {
  slug: string;
  name: string;
  values: OptionValue[];
}

interface Variant {
  id: string;
  sku: string;
  title?: string;
  priceCents: number;
  currency: string;
  inventory: {
    quantity: number;
    reserved: number;
    available: number;
  };
  options: {
    option: string;
    value: string;
  }[];
}

interface VariantSelectorProps {
  options: Option[];
  variants: Variant[];
  onVariantChange: (variant: Variant | null) => void;
}

export default function VariantSelector({
  options,
  variants,
  onVariantChange,
}: VariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  // Encontrar variante baseada nas opções selecionadas
  useEffect(() => {
    const variant = variants.find((v) => {
      return v.options.every((vo) => {
        return selectedOptions[vo.option] === vo.value;
      });
    });

    setSelectedVariant(variant || null);
    onVariantChange(variant || null);
  }, [selectedOptions, variants, onVariantChange]);

  const handleOptionChange = (optionSlug: string, valueSlug: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionSlug]: valueSlug,
    }));
  };

  const isOptionValueAvailable = (optionSlug: string, valueSlug: string) => {
    // Verificar se existe alguma variante disponível com essa combinação
    return variants.some((variant) => {
      const hasThisOption = variant.options.some(
        (vo) => vo.option === optionSlug && vo.value === valueSlug
      );
      
      if (!hasThisOption) return false;

      // Verificar se outras opções selecionadas são compatíveis
      const otherSelectedOptions = Object.entries(selectedOptions).filter(
        ([key]) => key !== optionSlug
      );

      const isCompatible = otherSelectedOptions.every(([otherOptionSlug, otherValueSlug]) => {
        return variant.options.some(
          (vo) => vo.option === otherOptionSlug && vo.value === otherValueSlug
        );
      });

      return isCompatible && variant.inventory.available > 0;
    });
  };

  const getOptionValueClass = (optionSlug: string, valueSlug: string, option: Option) => {
    const isSelected = selectedOptions[optionSlug] === valueSlug;
    const isAvailable = isOptionValueAvailable(optionSlug, valueSlug);
    
    let baseClass = "border border-white/20 transition-all duration-200 ";

    if (option.type === 'color') {
      // Seletor de cor como círculo
      baseClass += "w-8 h-8 rounded-full cursor-pointer ";
      
      if (isSelected) {
        baseClass += "ring-2 ring-white ring-offset-2 ring-offset-black ";
      }
      
      if (!isAvailable) {
        baseClass += "opacity-30 cursor-not-allowed ";
      }
    } else {
      // Seletor de tamanho como botão
      baseClass += "px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ";
      
      if (isSelected) {
        baseClass += "bg-white text-black border-white ";
      } else {
        baseClass += "bg-transparent text-white hover:bg-white/10 ";
      }
      
      if (!isAvailable) {
        baseClass += "opacity-30 cursor-not-allowed line-through ";
      }
    }

    return baseClass;
  };

  return (
    <div className="space-y-6">
      {options.map((option) => (
        <div key={option.slug}>
          <h3 className="text-white font-medium mb-3">{option.name}</h3>
          
          <div className="flex flex-wrap gap-3">
            {option.values.map((value) => {
              const isAvailable = isOptionValueAvailable(option.slug, value.slug);
              
              if (option.slug === 'color') {
                // Seletor de cor
                return (
                  <button
                    key={value.slug}
                    onClick={() => {
                      if (isAvailable) {
                        handleOptionChange(option.slug, value.slug);
                      }
                    }}
                    className={getOptionValueClass(option.slug, value.slug, option)}
                    style={{ backgroundColor: value.value }}
                    title={`${value.name}${!isAvailable ? ' - Indisponível' : ''}`}
                    disabled={!isAvailable}
                  />
                );
              } else {
                // Seletor de tamanho/outros
                return (
                  <button
                    key={value.slug}
                    onClick={() => {
                      if (isAvailable) {
                        handleOptionChange(option.slug, value.slug);
                      }
                    }}
                    className={getOptionValueClass(option.slug, value.slug, option)}
                    disabled={!isAvailable}
                  >
                    {value.name}
                  </button>
                );
              }
            })}
          </div>
        </div>
      ))}

      {/* Informações da variante selecionada */}
      {selectedVariant && (
        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">SKU: {selectedVariant.sku}</p>
              {selectedVariant.title && (
                <p className="text-white/60 text-sm">{selectedVariant.title}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-white font-semibold text-lg">
                {(selectedVariant.priceCents / 100).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: selectedVariant.currency,
                })}
              </p>
              <p className="text-white/60 text-sm">
                {selectedVariant.inventory.available > 0
                  ? `${selectedVariant.inventory.available} em estoque`
                  : 'Fora de estoque'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}