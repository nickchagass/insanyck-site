// INSANYCK PAYMENTS-P0 — Hardened MercadoPago Bricks Card
// ========================================================
// Replaced fragile manual script injection with next/script.
// Clear state machine: loading → ready | error | blocked
// PRESERVED: All visual design (Museum Edition), i18n, callbacks
'use client';

import Script from 'next/script';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// INSANYCK PAYMENTS-P0 — SDK Status State Machine
type SDKStatus = 'loading' | 'ready' | 'error' | 'blocked';

// INSANYCK MP-MOBILE-01 — Museum Edition motion constants (PRESERVED)
const VAULT_EASE = [0.22, 1, 0.36, 1] as const;

interface MercadoPagoBricksCardProps {
  preferenceId: string;
  amount: number;
  orderId: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

// INSANYCK PAYMENTS-P0 — Global flag to prevent double SDK load
let sdkLoadAttempted = false;
let sdkLoaded = false;

export default function MercadoPagoBricksCard({
  preferenceId,
  amount,
  orderId,
  onSuccess,
  onError,
}: MercadoPagoBricksCardProps) {
  const { t, i18n } = useTranslation('checkout');
  const locale = i18n.language === 'en' ? 'en' : 'pt';

  // ══════════════════════════════════════════════════════════════════
  // STATE MACHINE: SDK Loading
  // ══════════════════════════════════════════════════════════════════
  const [sdkStatus, setSdkStatus] = useState<SDKStatus>(() => {
    // SSR-safe: check if SDK already loaded
    if (typeof window !== 'undefined' && (window as unknown as { MercadoPago?: unknown }).MercadoPago) {
      return 'ready';
    }
    return 'loading';
  });
  const [brickReady, setBrickReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Refs
  const brickContainerRef = useRef<HTMLDivElement>(null);
  const brickInstanceRef = useRef<unknown>(null);

  // ══════════════════════════════════════════════════════════════════
  // SCRIPT HANDLERS (next/script callbacks)
  // ══════════════════════════════════════════════════════════════════
  const handleScriptLoad = useCallback(() => {
    sdkLoadAttempted = true;

    // Verify MercadoPago object exists (CSP/AdBlock detection)
    if (typeof window !== 'undefined' && (window as unknown as { MercadoPago?: unknown }).MercadoPago) {
      sdkLoaded = true;
      setSdkStatus('ready');

      if (process.env.NODE_ENV === 'development') {
        console.log('[MP-BRICKS] SDK loaded successfully via next/script');
      }
    } else {
      // Script loaded but object missing = blocked (CSP/AdBlock)
      setSdkStatus('blocked');

      if (process.env.NODE_ENV === 'development') {
        console.error('[MP-BRICKS] SDK script loaded but window.MercadoPago missing (CSP/AdBlock)');
      }
    }
  }, []);

  const handleScriptError = useCallback(() => {
    sdkLoadAttempted = true;
    setSdkStatus('error');

    if (process.env.NODE_ENV === 'development') {
      console.error('[MP-BRICKS] SDK script failed to load');
    }
  }, []);

  // ══════════════════════════════════════════════════════════════════
  // BRICK INITIALIZATION (when SDK is ready)
  // ══════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (sdkStatus !== 'ready') return;
    if (typeof window === 'undefined') return;

    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

    if (!publicKey) {
      const errorMsg = locale === 'pt'
        ? 'Configuração de pagamento inválida'
        : 'Invalid payment configuration';
      onError?.(errorMsg);
      return;
    }

    const MercadoPago = (window as unknown as { MercadoPago: new (key: string, opts: { locale: string }) => unknown }).MercadoPago;

    if (!MercadoPago) {
      setSdkStatus('blocked');
      return;
    }

    const initBricks = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('[MP-BRICKS] Initializing brick...', { preferenceId, orderId, amount });
        }

        const mp = new MercadoPago(publicKey, {
          locale: locale === 'pt' ? 'pt-BR' : 'en-US',
        });

        const bricksBuilder = (mp as { bricks: () => { create: (type: string, container: HTMLElement, config: unknown) => Promise<unknown> } }).bricks();

        // INSANYCK MP-HOTFIX-03 — Create CardPayment Brick with Museum Edition customization (PRESERVED)
        const brick = await bricksBuilder.create('cardPayment', brickContainerRef.current!, {
          initialization: {
            amount: amount / 100, // Convert cents to BRL
            preferenceId: preferenceId,
          },
          customization: {
            visual: {
              style: {
                theme: 'dark',
                customVariables: {
                  // Museum Edition color palette (PRESERVED)
                  baseColor: 'rgba(255, 255, 255, 0.08)',
                  textPrimaryColor: 'rgba(255, 255, 255, 0.95)',
                  textSecondaryColor: 'rgba(255, 255, 255, 0.60)',
                  inputBackgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadiusSmall: '8px',
                  borderRadiusMedium: '12px',
                  borderRadiusLarge: '16px',
                  formBackgroundColor: 'transparent',
                  formPadding: '0',
                },
              },
            },
            paymentMethods: {
              maxInstallments: 12,
            },
          },
          callbacks: {
            onReady: () => {
              setBrickReady(true);

              if (process.env.NODE_ENV === 'development') {
                console.log('[MP-BRICKS] Card payment brick ready');
              }
            },
            onSubmit: async (formData: unknown) => {
              try {
                if (process.env.NODE_ENV === 'development') {
                  console.log('[MP-BRICKS] Form submitted');
                }

                // Process payment via backend (PRESERVED logic)
                const response = await fetch('/api/mp/process-card-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    formData,
                    orderId,
                    preferenceId,
                  }),
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Payment failed');
                }

                const result = await response.json();

                if (result.status === 'approved') {
                  onSuccess?.(result.paymentId);
                } else {
                  throw new Error(
                    locale === 'pt'
                      ? `Pagamento ${result.status}: ${result.statusDetail || 'tente novamente'}`
                      : `Payment ${result.status}: ${result.statusDetail || 'please try again'}`
                  );
                }

                return result;
              } catch (err: unknown) {
                const errorMsg = (err as { message?: string })?.message ||
                  (locale === 'pt' ? 'Erro ao processar pagamento' : 'Payment processing error');
                onError?.(errorMsg);

                if (process.env.NODE_ENV === 'development') {
                  console.error('[MP-BRICKS] Payment error:', err);
                }

                throw err;
              }
            },
            onError: (error: unknown) => {
              const errorMsg = locale === 'pt'
                ? 'Erro no formulário de pagamento'
                : 'Payment form error';
              onError?.(errorMsg);

              if (process.env.NODE_ENV === 'development') {
                console.error('[MP-BRICKS] Form error:', error);
              }
            },
          },
        });

        brickInstanceRef.current = brick;

      } catch (err) {
        const errorMsg = locale === 'pt'
          ? 'Erro ao inicializar pagamento'
          : 'Failed to initialize payment';
        onError?.(errorMsg);

        if (process.env.NODE_ENV === 'development') {
          console.error('[MP-BRICKS] Initialization error:', err);
        }
      }
    };

    initBricks();

    // Cleanup: unmount brick instance only (not global SDK)
    return () => {
      if (brickInstanceRef.current) {
        try {
          (brickInstanceRef.current as { unmount?: () => void }).unmount?.();
          brickInstanceRef.current = null;
        } catch {
          // Ignore unmount errors
        }
      }
    };
  }, [sdkStatus, preferenceId, amount, orderId, locale, onSuccess, onError, retryCount]);

  // ══════════════════════════════════════════════════════════════════
  // RETRY HANDLER
  // ══════════════════════════════════════════════════════════════════
  const handleRetry = useCallback(() => {
    // Cleanup existing brick
    if (brickInstanceRef.current) {
      try {
        (brickInstanceRef.current as { unmount?: () => void }).unmount?.();
        brickInstanceRef.current = null;
      } catch {
        // Ignore
      }
    }

    // Clear container
    if (brickContainerRef.current) {
      brickContainerRef.current.innerHTML = '';
    }

    // Reset state
    setBrickReady(false);

    // If SDK is already loaded, just re-init brick
    if (sdkLoaded && typeof window !== 'undefined' && (window as unknown as { MercadoPago?: unknown }).MercadoPago) {
      setSdkStatus('ready');
      setRetryCount(c => c + 1);
    } else {
      // Force reload page to retry script load
      setSdkStatus('loading');
      setRetryCount(c => c + 1);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[MP-BRICKS] Retry initiated');
    }
  }, []);

  // ══════════════════════════════════════════════════════════════════
  // RENDER: Error State (PRESERVED Museum Edition design)
  // ══════════════════════════════════════════════════════════════════
  if (sdkStatus === 'error' || sdkStatus === 'blocked') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`error-${retryCount}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: VAULT_EASE }}
          className="space-y-4"
        >
          {/* Museum Edition Error Panel — Subtle red glow (PRESERVED) */}
          <div className="relative p-6 bg-black/40 backdrop-blur-sm border border-red-400/[0.15] rounded-[var(--ds-radius-lg,16px)] shadow-[0_0_20px_rgba(248,113,113,0.08)]">
            {/* Subtle red gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/[0.03] to-transparent rounded-[var(--ds-radius-lg,16px)] pointer-events-none" />

            <div className="relative flex items-start gap-3 mb-4">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-400/90 mb-1.5 tracking-tight">
                  {locale === 'pt' ? 'Não foi possível carregar o pagamento' : 'Could not load payment'}
                </h3>
                <p className="text-xs text-red-400/60 leading-relaxed">
                  {locale === 'pt'
                    ? 'Parece que um bloqueador de conteúdo impediu o pagamento seguro.'
                    : 'A content blocker may have prevented secure payment.'}
                </p>
                <p className="text-xs text-red-400/50 leading-relaxed mt-1.5">
                  {locale === 'pt'
                    ? 'Se estiver usando Brave/AdBlock, desative para este site ou escolha PIX.'
                    : 'If using Brave/AdBlock, disable for this site or choose PIX.'}
                </p>
              </div>
            </div>

            {/* Retry Button — Museum Edition subtle hover (PRESERVED) */}
            <button
              onClick={handleRetry}
              className="
                relative w-full px-4 py-2.5
                bg-white/[0.04] hover:bg-white/[0.08]
                border border-white/[0.08] hover:border-white/[0.12]
                rounded-[var(--ds-radius-md,12px)]
                text-white/80 hover:text-white/90
                text-sm font-medium tracking-tight
                transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/[0.15]
              "
            >
              {locale === 'pt' ? 'Tentar novamente' : 'Try again'}
            </button>
          </div>

          {/* Order Reference */}
          <div className="text-center">
            <p className="text-white/50 text-xs tracking-wide">
              {locale === 'pt' ? 'Pedido' : 'Order'}: <span className="text-white/70 font-mono">{orderId.slice(0, 12)}...</span>
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // RENDER: Main Component
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-4">
      {/* INSANYCK PAYMENTS-P0 — next/script for reliable SDK loading */}
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />

      {/* Museum Edition Header (PRESERVED) */}
      <div className="text-center pb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          {locale === 'pt' ? 'Pague com Cartão' : 'Pay with Card'}
        </h3>
        <p className="text-white/60 text-sm">
          {locale === 'pt'
            ? 'Pagamento seguro via Mercado Pago'
            : 'Secure payment via Mercado Pago'}
        </p>
      </div>

      {/* Loading State — Museum Edition Skeleton Shimmer (PRESERVED) */}
      {(sdkStatus === 'loading' || (sdkStatus === 'ready' && !brickReady)) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-12 space-y-4"
        >
          {/* Museum Edition Skeleton Shimmer (PRESERVED) */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/[0.03] border border-white/[0.06]">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
              }}
              style={{
                width: '200%',
              }}
            />
          </div>
          <p className="text-white/50 text-sm tracking-wide">
            {locale === 'pt' ? 'Carregando formulário...' : 'Loading form...'}
          </p>
        </motion.div>
      )}

      {/* Vault Drawer Container (PRESERVED) */}
      <div
        ref={brickContainerRef}
        className={`
          relative p-6
          bg-gradient-to-b from-black/30 to-black/40
          border border-white/[0.08]
          rounded-[var(--ds-radius-lg,16px)]
          shadow-[inset_0_1px_1px_rgba(255,255,255,0.03),inset_0_-1px_1px_rgba(0,0,0,0.3)]
          backdrop-blur-sm
          ${sdkStatus === 'loading' || !brickReady ? 'hidden' : ''}
        `}
        style={{ minHeight: '420px' }}
      />

      {/* Order Reference */}
      {brickReady && (
        <div className="text-center pt-2">
          <p className="text-white/50 text-xs">
            {locale === 'pt' ? 'Pedido' : 'Order'}: <span className="text-white/70 font-mono">{orderId.slice(0, 12)}...</span>
          </p>
        </div>
      )}
    </div>
  );
}
