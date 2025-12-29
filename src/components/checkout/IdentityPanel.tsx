// INSANYCK STEP F-MP.POLISH — Identity Panel (Museum Edition)
// INSANYCK CHECKOUT-FIX-NOW-01 — Verified i18n compliance
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import GlassCard from '@/components/ui/GlassCard';

interface IdentityPanelProps {
  /** Email from session (if logged in) */
  sessionEmail?: string | null;
  /** Callback with validation state + email */
  onValidation: (valid: boolean, email: string) => void;
}

export default function IdentityPanel({ sessionEmail, onValidation }: IdentityPanelProps) {
  const { t } = useTranslation('checkout');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  // Validate email (basic)
  const isValidEmail = (val: string): boolean => {
    if (!val) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const currentEmail = sessionEmail || email;
  const isValid = isValidEmail(currentEmail);

  // Emit validation to parent
  useEffect(() => {
    onValidation(isValid, currentEmail);
  }, [isValid, currentEmail, onValidation]);

  // If logged in, show summary
  if (sessionEmail) {
    return (
      <GlassCard className="mb-6">
        <h2 className="text-lg font-semibold text-white/90 mb-2">
          {t('identity.title', 'Seus dados')}
        </h2>
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <span>{t('identity.loggedInAs', 'Você está logado como')}</span>
          <span className="font-medium text-white/90">{sessionEmail}</span>
          <svg
            className="w-4 h-4 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </GlassCard>
    );
  }

  // If not logged, show email input
  const showError = touched && !isValid;

  return (
    <GlassCard className="mb-6">
      <h2 className="text-lg font-semibold text-white/90 mb-2">
        {t('identity.title', 'Seus dados')}
      </h2>
      <p className="text-white/60 text-sm mb-4">
        {t('identity.helper', 'Usaremos este e-mail para enviar a confirmação do pedido')}
      </p>

      <div>
        <label htmlFor="checkout-email" className="block text-sm text-white/70 mb-2">
          {t('emailInput.label', 'Seu e-mail para receber o comprovante')}
        </label>
        <input
          id="checkout-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={t('emailInput.placeholder', 'email@exemplo.com')}
          className={`
            w-full px-4 py-3 rounded-xl text-white placeholder-white/40
            bg-[rgba(255,255,255,0.03)] border transition-colors
            focus:outline-none focus:ring-2 focus:ring-[color:var(--cold-ray-ring)]
            ${
              showError
                ? 'border-red-400/50 focus:border-red-400/70'
                : 'border-[rgba(255,255,255,0.10)] focus:border-[rgba(255,255,255,0.25)]'
            }
          `}
          required
          aria-invalid={showError}
          aria-describedby={showError ? 'email-error' : undefined}
        />
        {showError && (
          <p id="email-error" className="mt-2 text-sm text-red-400">
            {t('errors.email', 'E-mail inválido')}
          </p>
        )}
      </div>
    </GlassCard>
  );
}
