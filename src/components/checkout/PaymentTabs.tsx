// INSANYCK STEP F-MP — Payment Method Tabs (Museum Edition, Pure Tailwind)
// INSANYCK CHECKOUT-FIX-NOW-01 — Verified i18n + no variant errors
'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

export type PaymentMethod = 'pix' | 'card' | 'stripe';

interface PaymentTabsProps {
  active: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  availableMethods: PaymentMethod[];
}

export default function PaymentTabs({ active, onChange, availableMethods }: PaymentTabsProps) {
  const { t } = useTranslation('checkout');

  const getLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'pix':
        return t('tabs.pix', 'PIX');
      case 'card':
        return t('tabs.card', 'Cartão');
      case 'stripe':
        return t('tabs.international', 'Internacional');
      default:
        return method;
    }
  };

  return (
    <div
      role="tablist"
      aria-label={t('payment.selectMethod', 'Escolha como pagar')}
      className="flex gap-1 p-1 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]"
    >
      {availableMethods.map((method) => {
        const isActive = active === method;

        return (
          <button
            key={method}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(method)}
            className={`
              relative flex-1 px-4 py-3 text-sm font-medium rounded-lg
              transition-colors duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cold-ray-ring)]
              ${
                isActive
                  ? 'text-[rgba(255,255,255,0.95)]'
                  : 'text-[rgba(255,255,255,0.55)] hover:text-[rgba(255,255,255,0.75)]'
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="activePaymentTab"
                className="absolute inset-0 bg-[rgba(255,255,255,0.06)] rounded-lg border border-[rgba(255,255,255,0.10)]"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{getLabel(method)}</span>
          </button>
        );
      })}
    </div>
  );
}
