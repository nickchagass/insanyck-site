// INSANYCK MP-HOTFIX-03 + MP-MOBILE-01 FIX B — Mercado Pago Bricks Card Payment (Museum Edition, SSR-safe, with Timeout Watchdog)
'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// INSANYCK MP-MOBILE-01 — Museum Edition motion constants
const VAULT_EASE = [0.22, 1, 0.36, 1] as const;

interface MercadoPagoBricksCardProps {
  preferenceId: string;
  amount: number;
  orderId: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

export default function MercadoPagoBricksCard({
  preferenceId,
  amount,
  orderId,
  onSuccess,
  onError,
}: MercadoPagoBricksCardProps) {
  const { t, i18n } = useTranslation('checkout');
  const locale = i18n.language === 'en' ? 'en' : 'pt';
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const brickContainerRef = useRef<HTMLDivElement>(null);
  const brickInstanceRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onReadyFiredRef = useRef(false);

  useEffect(() => {
    // INSANYCK MP-HOTFIX-03 — SSR guard: only run in browser
    if (typeof window === 'undefined') return;

    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

    // INSANYCK MP-MOBILE-01 FIX B — Dev diagnostics: public key presence
    if (process.env.NODE_ENV === 'development') {
      console.log('[MP-BRICKS] Initialization diagnostics:', {
        public_key_present: !!publicKey,
        public_key_length: publicKey?.length || 0,
        preference_id: preferenceId,
        order_id: orderId,
        amount_cents: amount,
        locale,
      });
    }

    if (!publicKey) {
      const errorMsg = locale === 'pt'
        ? 'Configuração de pagamento inválida'
        : 'Invalid payment configuration';
      setLoadError(errorMsg);
      setIsLoading(false);
      onError?.(errorMsg);
      return;
    }

    // INSANYCK MP-MOBILE-01 FIX B — Timeout Watchdog (12s)
    // If onReady doesn't fire within 12s, assume Bricks failed to load
    timeoutRef.current = setTimeout(() => {
      if (!onReadyFiredRef.current) {
        const errorMsg = locale === 'pt'
          ? 'Tempo esgotado ao carregar formulário de pagamento'
          : 'Payment form loading timeout';
        setLoadError(errorMsg);
        setIsLoading(false);
        onError?.(errorMsg);

        if (process.env.NODE_ENV === 'development') {
          console.error('[MP-BRICKS] Timeout: onReady never fired after 12s');
        }
      }
    }, 12000); // 12s timeout

    // INSANYCK MP-HOTFIX-03 — Load Mercado Pago SDK dynamically
    const loadMercadoPagoSDK = async () => {
      try {
        // INSANYCK MP-MOBILE-01 FIX B — Dev diagnostic: script loading start
        if (process.env.NODE_ENV === 'development') {
          console.log('[MP-BRICKS] Starting SDK load...');
        }

        // Check if SDK is already loaded
        if ((window as any).MercadoPago) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[MP-BRICKS] SDK already loaded, initializing Bricks...');
          }
          initBricks((window as any).MercadoPago);
          return;
        }

        // Load SDK script
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.async = true;

        script.onload = () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[MP-BRICKS] SDK script loaded successfully');
          }

          if ((window as any).MercadoPago) {
            initBricks((window as any).MercadoPago);
          } else {
            throw new Error('MercadoPago SDK not available after script load');
          }
        };

        // INSANYCK MP-MOBILE-01 FIX B — Robust script.onerror handler
        script.onerror = (error) => {
          throw new Error('Failed to load MercadoPago SDK script');
        };

        document.body.appendChild(script);
      } catch (err) {
        const errorMsg = locale === 'pt'
          ? 'Erro ao carregar sistema de pagamento'
          : 'Failed to load payment system';
        setLoadError(errorMsg);
        setIsLoading(false);
        onError?.(errorMsg);

        if (process.env.NODE_ENV === 'development') {
          console.error('[MP-BRICKS] SDK load error:', err);
        }
      }
    };

    const initBricks = async (MercadoPago: any) => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('[MP-BRICKS] Creating MercadoPago instance...');
        }

        const mp = new MercadoPago(publicKey, {
          locale: locale === 'pt' ? 'pt-BR' : 'en-US',
        });

        const bricksBuilder = mp.bricks();

        if (process.env.NODE_ENV === 'development') {
          console.log('[MP-BRICKS] Creating CardPayment Brick...');
        }

        // INSANYCK MP-HOTFIX-03 — Create CardPayment Brick with Museum Edition customization
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
                  // Museum Edition color palette
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
              // INSANYCK MP-MOBILE-01 FIX B — Mark onReady fired and clear timeout
              onReadyFiredRef.current = true;
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }

              setIsLoading(false);

              if (process.env.NODE_ENV === 'development') {
                console.log('[MP-BRICKS] Card payment brick ready (onReady fired)');
              }
            },
            onSubmit: async (formData: any) => {
              try {
                if (process.env.NODE_ENV === 'development') {
                  console.log('[MP-BRICKS] Form submitted:', {
                    preferenceId,
                    orderId,
                    hasToken: !!formData?.token,
                  });
                }

                // INSANYCK MP-HOTFIX-03 — Process payment via backend
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
              } catch (err: any) {
                const errorMsg = err?.message || (locale === 'pt' ? 'Erro ao processar pagamento' : 'Payment processing error');
                onError?.(errorMsg);

                if (process.env.NODE_ENV === 'development') {
                  console.error('[MP-BRICKS] Payment error:', err);
                }

                throw err;
              }
            },
            onError: (error: any) => {
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

        if (process.env.NODE_ENV === 'development') {
          console.log('[MP-BRICKS] Brick created, waiting for onReady...');
        }
      } catch (err) {
        // INSANYCK MP-MOBILE-01 FIX B — Ensure loading stops on init error
        setIsLoading(false);

        const errorMsg = locale === 'pt'
          ? 'Erro ao inicializar pagamento'
          : 'Failed to initialize payment';
        setLoadError(errorMsg);
        onError?.(errorMsg);

        if (process.env.NODE_ENV === 'development') {
          console.error('[MP-BRICKS] Initialization error:', err);
        }
      }
    };

    loadMercadoPagoSDK();

    // INSANYCK MP-HOTFIX-03 — Cleanup on unmount
    return () => {
      // Clear timeout if component unmounts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (brickInstanceRef.current) {
        try {
          brickInstanceRef.current.unmount();
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[MP-BRICKS] Cleanup warning:', err);
          }
        }
      }
    };
  }, [preferenceId, amount, orderId, locale, onSuccess, onError]);

  // INSANYCK MP-MOBILE-01 FIX B — Retry handler
  const handleRetry = () => {
    setLoadError(null);
    setIsLoading(true);
    onReadyFiredRef.current = false;
    // Force re-render to trigger useEffect
    window.location.reload();
  };

  // INSANYCK MP-MOBILE-01 FIX B — Premium error state with retry (Museum Edition with Framer Motion)
  if (loadError) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: VAULT_EASE }}
          className="space-y-4"
        >
          {/* Museum Edition Error Panel — Subtle red glow, no loud backgrounds */}
          <div className="relative p-6 bg-black/40 backdrop-blur-sm border border-red-400/[0.15] rounded-[var(--ds-radius-lg,16px)] shadow-[0_0_20px_rgba(248,113,113,0.08)]">
            {/* Subtle red gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/[0.03] to-transparent rounded-[var(--ds-radius-lg,16px)] pointer-events-none" />

            <div className="relative flex items-start gap-3 mb-4">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-400/90 mb-1.5 tracking-tight">
                  {locale === 'pt' ? 'Não foi possível carregar o formulário de cartão' : 'Could not load card form'}
                </h3>
                <p className="text-xs text-red-400/60 leading-relaxed">
                  {loadError}
                </p>
              </div>
            </div>

            {/* Retry Button — Museum Edition subtle hover */}
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

  return (
    <div className="space-y-4">
      {/* Museum Edition Header */}
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

      {/* INSANYCK MP-MOBILE-01 — Museum Edition Loading State (Skeleton Shimmer) */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-12 space-y-4"
        >
          {/* Museum Edition Skeleton Shimmer — Soft, quiet gradient pulse with Framer Motion */}
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

      {/* INSANYCK MP-MOBILE-01 — Vault Drawer Container (Museum Edition: inset shadow, hairlines) */}
      <div
        ref={brickContainerRef}
        className="
          relative p-6
          bg-gradient-to-b from-black/30 to-black/40
          border border-white/[0.08]
          rounded-[var(--ds-radius-lg,16px)]
          shadow-[inset_0_1px_1px_rgba(255,255,255,0.03),inset_0_-1px_1px_rgba(0,0,0,0.3)]
          backdrop-blur-sm
        "
        style={{ minHeight: isLoading ? '0' : '400px' }}
      />

      {/* Order Reference */}
      <div className="text-center pt-2">
        <p className="text-white/50 text-xs">
          {locale === 'pt' ? 'Pedido' : 'Order'}: <span className="text-white/70 font-mono">{orderId.slice(0, 12)}...</span>
        </p>
      </div>
    </div>
  );
}
