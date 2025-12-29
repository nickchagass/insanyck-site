// INSANYCK STEP F-MP — Componente de pagamento PIX (Museum Edition)
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Copy, Check, Clock, CheckCircle } from 'lucide-react';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import GlassCard from '@/components/ui/GlassCard';

interface PixPaymentProps {
  paymentId: number;
  orderId: string;
  qrCode: string;
  qrCodeBase64: string;
  expiresAt: string;
  amount: number;
}

export default function PixPayment({
  paymentId,
  orderId,
  qrCode,
  qrCodeBase64,
  expiresAt,
  amount,
}: PixPaymentProps) {
  const { t, i18n } = useTranslation('checkout');
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Polling de status
  const { status, startPolling } = usePaymentStatus({
    interval: 3000,
    onApproved: () => {
      router.push(`/checkout/success?payment_id=${paymentId}`);
    },
  });

  // Iniciar polling ao montar
  useEffect(() => {
    startPolling(String(paymentId));
  }, [paymentId, startPolling]);

  // Timer de expiração
  useEffect(() => {
    const expiresDate = new Date(expiresAt);
    const updateTimer = () => {
      const now = new Date();
      const diff = expiresDate.getTime() - now.getTime();
      setTimeLeft(Math.max(0, Math.floor(diff / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [qrCode]);

  const locale = i18n.language === 'en' ? 'en' : 'pt';
  const formattedAmount = new Intl.NumberFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      {status === 'approved' && (
        <GlassCard className="bg-green-400/10 border-green-400/20">
          <div className="flex items-center gap-3 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{t('pix.approved')}</span>
          </div>
        </GlassCard>
      )}

      {/* QR Code */}
      <GlassCard className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">{t('pix.title')}</h3>
        <p className="text-sm text-white/60 mb-6">{t('pix.scanQr')}</p>

        {/* QR Code Image */}
        <div className="mx-auto max-w-[240px] aspect-square p-4 bg-white rounded-2xl mb-6">
          <img
            src={`data:image/png;base64,${qrCodeBase64}`}
            alt="PIX QR Code"
            className="w-full h-full"
          />
        </div>

        {/* Timer */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            timeLeft < 300
              ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
              : 'bg-white/5 text-white/60 border border-white/10'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>
            {t('pix.expires')}: {formatTime(timeLeft)}
          </span>
        </div>
      </GlassCard>

      {/* Copy Code */}
      <GlassCard>
        <p className="text-sm text-white/60 mb-3">{t('pix.orCopy')}</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={qrCode}
            readOnly
            className="flex-1 px-3 py-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] rounded-lg text-white text-sm font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.12)] rounded-lg transition-colors flex items-center gap-2 text-white"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">{t('pix.copied')}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium">{t('pix.copyCode')}</span>
              </>
            )}
          </button>
        </div>
      </GlassCard>

      {/* Amount */}
      <GlassCard>
        <div className="flex justify-between items-center">
          <span className="text-white/60">{t('success.total')}</span>
          <span className="text-xl font-semibold text-white">{formattedAmount}</span>
        </div>
      </GlassCard>

      {/* Status Waiting */}
      {status === 'pending' && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-white/60">
            <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />
            <span className="text-sm">{t('pix.waiting')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
