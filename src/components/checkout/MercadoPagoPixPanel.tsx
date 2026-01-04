// INSANYCK MP-HOTFIX-03 + MP-MOBILE-01 — Premium PIX Panel (Museum Edition, Production-Grade)
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';

interface MercadoPagoPixPanelProps {
  paymentId: number;
  orderId: string;
  qrCode: string;
  qrCodeBase64: string;
  expiresAt: string;
  amount: number; // BRL (backward compat)
  amountCents?: number; // INSANYCK MP-MOBILE-01 — Preferred: integer cents
}

export default function MercadoPagoPixPanel({
  paymentId,
  orderId,
  qrCode,
  qrCodeBase64,
  expiresAt,
  amount,
  amountCents,
}: MercadoPagoPixPanelProps) {
  const { t, i18n } = useTranslation('checkout');
  const locale = i18n.language === 'en' ? 'en' : 'pt';
  const [copied, setCopied] = useState(false);

  // INSANYCK MP-MOBILE-01 FIX B — Prefer amount_cents (integer) as source of truth
  // Fallback to amount (BRL decimal) * 100 for backward compatibility
  const displayAmountCents = amountCents ?? (amount ? Math.round(amount * 100) : 0);

  // INSANYCK MP-MOBILE-01 FIX B — Dev-only mount diagnostic: amount mismatch detection
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const backendCents = amountCents;
      const legacyCents = amount ? Math.round(amount * 100) : 0;
      const hasMismatch = backendCents && legacyCents && backendCents !== legacyCents;

      console.log('[MP-MOBILE-01] PIX amount_display_diagnostic:', {
        backend_amount_cents: backendCents,
        legacy_amount_brl: amount,
        legacy_amount_cents: legacyCents,
        display_amount_cents: displayAmountCents,
        has_mismatch: hasMismatch,
        mismatch_delta_cents: hasMismatch ? Math.abs(backendCents - legacyCents) : 0,
        order_id: orderId,
        payment_id: paymentId,
      });

      if (hasMismatch) {
        console.warn('[MP-MOBILE-01] amount_mismatch', {
          cart_amount_cents: legacyCents,
          backend_amount_cents: backendCents,
          order_id: orderId,
        });
      }
    }
  }, [amountCents, amount, displayAmountCents, orderId, paymentId]);

  const handleCopy = async () => {
    if (!qrCode) return;

    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[MP-PIX] Copy failed:', err);
    }
  };

  // Format expiration time
  const formatExpiration = (isoString: string): string => {
    if (!isoString) return '';

    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 0) return locale === 'pt' ? 'Expirado' : 'Expired';
      if (diffMins < 60) return `${diffMins}min`;

      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}min`;
    } catch {
      return '';
    }
  };

  const expirationText = expiresAt ? formatExpiration(expiresAt) : '';

  return (
    <div className="space-y-6">
      {/* Museum Edition Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {locale === 'pt' ? 'Pague com PIX' : 'Pay with PIX'}
        </h3>
        <p className="text-white/60 text-sm">
          {locale === 'pt'
            ? 'Escaneie o QR Code ou copie o código PIX'
            : 'Scan the QR Code or copy the PIX code'}
        </p>
      </div>

      {/* QR Code Display */}
      {qrCodeBase64 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center p-6 bg-white/5 border border-white/10 rounded-xl"
        >
          <div className="p-4 bg-white rounded-lg">
            <img
              src={`data:image/png;base64,${qrCodeBase64}`}
              alt="QR Code PIX"
              className="w-64 h-64 md:w-72 md:h-72"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </motion.div>
      )}

      {/* Amount + Expiration */}
      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl text-sm">
        <div>
          <div className="text-white/50 text-xs mb-1">
            {locale === 'pt' ? 'Valor do pagamento' : 'Payment amount'}
          </div>
          <div className="text-white font-semibold text-lg">
            R$ {(displayAmountCents / 100).toFixed(2)}
          </div>
        </div>
        {expirationText && (
          <div className="text-right">
            <div className="text-white/50 text-xs mb-1">
              {locale === 'pt' ? 'Expira em' : 'Expires in'}
            </div>
            <div className="text-white/80 font-medium">
              {expirationText}
            </div>
          </div>
        )}
      </div>

      {/* Copy Code Button */}
      {qrCode && (
        <button
          onClick={handleCopy}
          className="w-full px-6 py-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-white font-semibold transition-all transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          {copied
            ? (locale === 'pt' ? '✓ Código copiado!' : '✓ Code copied!')
            : (locale === 'pt' ? 'Copiar código PIX' : 'Copy PIX code')}
        </button>
      )}

      {/* Order Reference */}
      <div className="text-center">
        <p className="text-white/50 text-xs">
          {locale === 'pt' ? 'Pedido' : 'Order'}: <span className="text-white/70 font-mono">{orderId.slice(0, 12)}...</span>
        </p>
        <p className="text-white/40 text-xs mt-1">
          {locale === 'pt'
            ? 'Após o pagamento, você receberá um e-mail de confirmação'
            : 'After payment, you will receive a confirmation email'}
        </p>
      </div>
    </div>
  );
}
