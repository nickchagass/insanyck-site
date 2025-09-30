"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

interface OptionValue {
  slug: string;
  name: string;
  value: string;
}

interface Option {
  slug: string;
  name: string;
  type?: "color" | "size" | "select";
  values: OptionValue[];
}

interface Variant {
  id: string;
  sku: string;
  title?: string;
  priceCents: number;
  currency: string;
  inventory: { quantity: number; reserved: number; available: number };
  options: { option: string; value: string }[];
}

interface VariantPickerProps {
  options: Option[];
  variants: Variant[];
  onVariantChange: (variant: Variant | null) => void;
  className?: string;
}

export default function VariantPicker({ 
  options, 
  variants, 
  onVariantChange,
  className = ""
}: VariantPickerProps) {
  const { t } = useTranslation(['product', 'common']);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Find matching variant based on selected options
  const findMatchingVariant = useCallback((selections: Record<string, string>) => {
    return variants.find(variant => {
      return variant.options.every(vOption => {
        const selectedValue = selections[vOption.option];
        return selectedValue === vOption.value;
      });
    }) || null;
  }, [variants]);

  // Handle option selection
  const handleOptionSelect = useCallback((optionSlug: string, valueSlug: string) => {
    setSelectedOptions(prev => {
      const newSelections = { ...prev, [optionSlug]: valueSlug };
      const matchingVariant = findMatchingVariant(newSelections);
      onVariantChange(matchingVariant);
      return newSelections;
    });
  }, [findMatchingVariant, onVariantChange]);

  // Check if a specific option value is available
  const isOptionValueAvailable = useCallback((optionSlug: string, valueSlug: string) => {
    const testSelections = { ...selectedOptions, [optionSlug]: valueSlug };
    const matchingVariant = findMatchingVariant(testSelections);
    return matchingVariant ? matchingVariant.inventory.available > 0 : false;
  }, [selectedOptions, findMatchingVariant]);

  // Auto-select first available option if only one variant exists
  useEffect(() => {
    if (variants.length === 1 && options.length > 0) {
      const variant = variants[0];
      const autoSelections: Record<string, string> = {};
      
      variant.options.forEach(vOption => {
        autoSelections[vOption.option] = vOption.value;
      });
      
      setSelectedOptions(autoSelections);
      onVariantChange(variant);
    }
  }, [variants, options, onVariantChange]);

  // Don't render if no options
  if (!options.length || !variants.length) {
    return null;
  }

  const renderOptionGroup = (option: Option) => {
    const isColorType = option.type === 'color';
    const isSizeType = option.type === 'size';

    return (
      <div key={option.slug} className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-white/90 font-medium text-sm uppercase tracking-wide">
            {option.name}
          </label>
          {selectedOptions[option.slug] && (
            <span className="text-white/60 text-sm">
              {option.values.find(v => v.slug === selectedOptions[option.slug])?.name}
            </span>
          )}
        </div>

        <div className={`flex flex-wrap gap-3 ${isColorType ? 'gap-2' : ''}`}>
          {option.values.map((value) => {
            const isSelected = selectedOptions[option.slug] === value.slug;
            const isAvailable = isOptionValueAvailable(option.slug, value.slug);
            const isDisabled = !isAvailable;

            if (isColorType) {
              return (
                <motion.button
                  key={value.slug}
                  className={`relative w-10 h-10 rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                    isSelected 
                      ? 'border-white shadow-lg scale-110' 
                      : isDisabled
                        ? 'border-white/20 opacity-50 cursor-not-allowed'
                        : 'border-white/30 hover:border-white/60 hover:scale-105'
                  }`}
                  style={{ 
                    backgroundColor: value.value.toLowerCase().includes('#') 
                      ? value.value 
                      : value.value.toLowerCase() === 'black' 
                        ? '#000000'
                        : value.value.toLowerCase() === 'white'
                          ? '#ffffff'
                          : value.value.toLowerCase() === 'gray' || value.value.toLowerCase() === 'grey'
                            ? '#808080'
                            : '#cccccc'
                  }}
                  onClick={() => !isDisabled && handleOptionSelect(option.slug, value.slug)}
                  disabled={isDisabled}
                  aria-label={`${option.name}: ${value.name}`}
                  aria-pressed={isSelected}
                  whileHover={!isDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isDisabled ? { scale: 0.95 } : {}}
                  transition={{ duration: 0.15 }}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-full border-2 border-white/50" />
                  )}
                  {isDisabled && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                      <span className="text-white/70 text-xs">✕</span>
                    </div>
                  )}
                </motion.button>
              );
            }

            return (
              <motion.button
                key={value.slug}
                className={`px-4 py-2.5 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 min-w-[60px] text-sm font-medium ${
                  isSelected
                    ? 'border-white/40 bg-white/10 text-white shadow-lg'
                    : isDisabled
                      ? 'border-white/10 bg-white/5 text-white/40 cursor-not-allowed'
                      : 'border-white/20 bg-white/5 text-white/80 hover:border-white/35 hover:bg-white/8'
                } ${isSizeType ? 'text-center uppercase tracking-wide' : ''}`}
                onClick={() => !isDisabled && handleOptionSelect(option.slug, value.slug)}
                disabled={isDisabled}
                aria-label={`${option.name}: ${value.name}`}
                aria-pressed={isSelected}
                whileHover={!isDisabled ? { scale: 1.02, y: -1 } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
                transition={{ duration: 0.15 }}
              >
                {value.name}
                {isDisabled && (
                  <span className="ml-2 opacity-60" aria-label="Indisponível">
                    ✕
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`} role="group" aria-label={t('product:variantPicker.title', 'Opções do produto')}>
      {options.map(renderOptionGroup)}
      
      {/* Selection summary for screen readers */}
      <div className="sr-only" aria-live="polite">
        {Object.keys(selectedOptions).length > 0 && (
          <p>
            {t('product:variantPicker.selectedOptions', 'Opções selecionadas')}: {' '}
            {Object.entries(selectedOptions).map(([optionSlug, valueSlug]) => {
              const option = options.find(o => o.slug === optionSlug);
              const value = option?.values.find(v => v.slug === valueSlug);
              return `${option?.name}: ${value?.name}`;
            }).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}