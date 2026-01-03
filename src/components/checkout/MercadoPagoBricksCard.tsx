// INSANYCK MP-HOTFIX-03 — Mercado Pago Bricks Card Payment (Museum Edition, SSR-safe)
'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';

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

  useEffect(() => {
    // INSANYCK MP-HOTFIX-03 — SSR guard: only run in browser
    if (typeof window === 'undefined') return;

    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

    if (!publicKey) {
      const errorMsg = locale === 'pt'
        ? 'Configuração de pagamento inválida'
        : 'Invalid payment configuration';
      setLoadError(errorMsg);
      setIsLoading(false);
      onError?.(errorMsg);
      return;
    }

    // INSANYCK MP-HOTFIX-03 — Load Mercado Pago SDK dynamically
    const loadMercadoPagoSDK = async () => {
      try {
        // Check if SDK is already loaded
        if ((window as any).MercadoPago) {
          initBricks((window as any).MercadoPago);
          return;
        }

        // Load SDK script
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.async = true;

        script.onload = () => {
          if ((window as any).MercadoPago) {
            initBricks((window as any).MercadoPago);
          } else {
            throw new Error('MercadoPago SDK not available');
          }
        };

        script.onerror = () => {
          throw new Error('Failed to load MercadoPago SDK');
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
        const mp = new MercadoPago(publicKey, {
          locale: locale === 'pt' ? 'pt-BR' : 'en-US',
        });

        const bricksBuilder = mp.bricks();

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
              setIsLoading(false);
              if (process.env.NODE_ENV === 'development') {
                console.log('[MP-BRICKS] Card payment brick ready');
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
      } catch (err) {
        const errorMsg = locale === 'pt'
          ? 'Erro ao inicializar pagamento'
          : 'Failed to initialize payment';
        setLoadError(errorMsg);
        setIsLoading(false);
        onError?.(errorMsg);

        if (process.env.NODE_ENV === 'development') {
          console.error('[MP-BRICKS] Initialization error:', err);
        }
      }
    };

    loadMercadoPagoSDK();

    // INSANYCK MP-HOTFIX-03 — Cleanup on unmount
    return () => {
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

  if (loadError) {
    return (
      <div className="p-6 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-sm text-center">
        {loadError}
      </div>
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div
            className="w-12 h-12 border-2 rounded-full animate-spin"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.15)',
              borderTopColor: 'rgba(255, 255, 255, 0.65)',
            }}
            aria-hidden="true"
          />
          <p className="text-white/50 text-sm">
            {locale === 'pt' ? 'Carregando formulário...' : 'Loading form...'}
          </p>
        </div>
      )}

      {/* INSANYCK MP-HOTFIX-03 — Brick Container (Museum Edition wrapper) */}
      <div
        ref={brickContainerRef}
        className="p-6 bg-white/5 border border-white/10 rounded-xl"
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
