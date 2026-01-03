// INSANYCK STEP F-MP + F-MP.POLISH + MP-HOTFIX-03 — Página de checkout híbrida (Museum Edition One-Page + Bricks)
// INSANYCK CHECKOUT-FIX-NOW-01 — Verified i18n compliance + clean payment flow
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useSession } from 'next-auth/react';
import { useCartStore, useCartHydrated } from '@/store/cart';
import GlassCard from '@/components/ui/GlassCard';
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import PaymentTabs, { PaymentMethod } from '@/components/checkout/PaymentTabs';
import IdentityPanel from '@/components/checkout/IdentityPanel';
import AddressPanel, { AddressData } from '@/components/checkout/AddressPanel';

// INSANYCK MP-HOTFIX-03 — Dynamic imports for MP components (SSR-safe)
const MercadoPagoPixPanel = dynamic(() => import('@/components/checkout/MercadoPagoPixPanel'), { ssr: false });
const MercadoPagoBricksCard = dynamic(() => import('@/components/checkout/MercadoPagoBricksCard'), { ssr: false });

export default function CheckoutPage() {
  const { t, i18n } = useTranslation('checkout');
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  // INSANYCK STEP F-MP.BUGFIX-01 — Prevent false-positive redirect before hydration
  const hydrated = useCartHydrated();

  // === Identity & Address State (INSANYCK F-MP.POLISH) ===
  const [identityValid, setIdentityValid] = useState(false);
  const [identityEmail, setIdentityEmail] = useState('');
  const [addressValid, setAddressValid] = useState(false);
  const [addressData, setAddressData] = useState<AddressData>({
    name: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    city: '',
    state: '',
  });

  // === Payment State (INSANYCK MP-HOTFIX-03 — Updated for Bricks) ===
  const [activeTab, setActiveTab] = useState<PaymentMethod>('pix');
  const [isLoading, setIsLoading] = useState(false);
  const [pixData, setPixData] = useState<{
    paymentId: number;
    orderId: string;
    qrCode: string;
    qrCodeBase64: string;
    expiresAt: string;
    amount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  // INSANYCK MP-HOTFIX-03 — Bricks card state (in-page card form)
  const [bricksData, setBricksData] = useState<{
    preferenceId: string;
    orderId: string;
    amount: number;
  } | null>(null);

  // INSANYCK STEP F-MP.BUGFIX-01 — Redirecionar se carrinho vazio (apenas APÓS hidratação)
  useEffect(() => {
    if (!hydrated) return; // Aguardar hidratação antes de decidir
    if (items.length === 0) {
      router.push('/loja');
    }
  }, [hydrated, items.length, router]);

  // INSANYCK STEP CHECKOUT-UX-01 — Defensive scroll unlock (clear any stuck body overflow from drawers)
  useEffect(() => {
    // Clear any lingering scroll locks from previous pages (e.g., MiniCart, drawers)
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }, []);

  // Determinar métodos disponíveis baseado em locale e feature flag
  const locale = i18n.language === 'en' ? 'en' : 'pt';
  const featureFlag = process.env.NEXT_PUBLIC_CHECKOUT_PROVIDER || 'stripe';

  const availableMethods: PaymentMethod[] =
    locale === 'pt' && featureFlag === 'hybrid'
      ? ['pix', 'card', 'stripe']
      : ['stripe'];

  // Auto-select Stripe se EN ou feature flag off
  useEffect(() => {
    if (locale === 'en' || featureFlag !== 'hybrid') {
      setActiveTab('stripe');
    }
  }, [locale, featureFlag]);

  // === Identity/Address validation callbacks (INSANYCK F-MP.POLISH) ===
  const handleIdentityValidation = useCallback((valid: boolean, email: string) => {
    setIdentityValid(valid);
    setIdentityEmail(email);
  }, []);

  const handleAddressValidation = useCallback((valid: boolean, data: AddressData) => {
    setAddressValid(valid);
    setAddressData(data);
  }, []);

  // === Payment Handlers (INSANYCK MP-HOTFIX-01 — Updated for stable contract) ===
  const handlePixPayment = async () => {
    const payerEmail = session?.user?.email || identityEmail;

    if (!payerEmail) {
      setError(t('emailInput.required', 'E-mail é obrigatório para continuar'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            variantId: item.variantId,
            sku: item.sku,
            qty: item.qty,
          })),
          currency: 'BRL',
          provider: 'mercadopago',
          email: payerEmail,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Falha ao criar pagamento');
      }

      const data = await res.json();

      // INSANYCK MP-HOTFIX-02 — Validate MP PIX response (snake_case fields)
      if (data.provider === 'mercadopago' && data.method === 'pix') {
        if (!data.payment_id || (!data.qr_code && !data.qr_code_base64)) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[MP-HOTFIX-02] Invalid PIX response received from API:', {
              provider: data.provider,
              method: data.method,
              has_payment_id: !!data.payment_id,
              has_qr_code: !!data.qr_code,
              has_qr_code_base64: !!data.qr_code_base64,
              order_id: data.order_id,
              all_fields: Object.keys(data),
            });
          }
          throw new Error('Resposta de pagamento PIX inválida');
        }
        // Convert snake_case to camelCase for component compatibility
        setPixData({
          paymentId: data.payment_id,
          orderId: data.order_id,
          qrCode: data.qr_code || '',
          qrCodeBase64: data.qr_code_base64 || '',
          expiresAt: data.expires_at || '',
          amount: data.amount || 0,
        });
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('[MP-HOTFIX-02] Unexpected provider/method in PIX flow:', {
            provider: data.provider,
            method: data.method,
            expected: { provider: 'mercadopago', method: 'pix' },
          });
        }
        throw new Error('Provider inválido');
      }
    } catch (err) {
      // INSANYCK CHECKOUT-RESURRECTION — Better error messages
      let errorMessage = t('error', 'Não foi possível iniciar o pagamento.');

      if (err instanceof Error) {
        if (err.message.includes('Variant not found')) {
          errorMessage = t('variantNotFound', 'Alguns itens no carrinho não estão mais disponíveis. Por favor, remova-os e tente novamente.');
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            variantId: item.variantId,
            sku: item.sku,
            qty: item.qty,
          })),
          currency: 'BRL',
          provider: 'stripe',
          email: session?.user?.email || identityEmail,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t('error', 'Não foi possível iniciar o pagamento.'));
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL');
      }
    } catch (err) {
      // INSANYCK CHECKOUT-RESURRECTION — Better error messages
      let errorMessage = t('error', 'Não foi possível iniciar o pagamento.');

      if (err instanceof Error) {
        if (err.message.includes('Variant not found')) {
          errorMessage = t('variantNotFound', 'Alguns itens no carrinho não estão mais disponíveis. Por favor, remova-os e tente novamente.');
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleCardPayment = async () => {
    // INSANYCK MP-HOTFIX-03 — Card Bricks flow (in-page card form)
    const payerEmail = session?.user?.email || identityEmail;

    if (!payerEmail) {
      setError(t('emailInput.required', 'E-mail é obrigatório para continuar'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            variantId: item.variantId,
            sku: item.sku,
            qty: item.qty,
          })),
          currency: 'BRL',
          provider: 'mercadopago',
          method: 'card_bricks',
          email: payerEmail,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Falha ao criar pagamento');
      }

      const data = await res.json();

      // INSANYCK MP-HOTFIX-03 — Validate Bricks response
      if (data.provider === 'mercadopago' && data.method === 'card_bricks' && data.preference_id && data.order_id) {
        // Show in-page Bricks card form (NO redirect)
        setBricksData({
          preferenceId: data.preference_id,
          orderId: data.order_id,
          amount: data.amount || 0,
        });
        setIsLoading(false);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('[MP-BRICKS] Invalid response received from API:', {
            provider: data.provider,
            method: data.method,
            has_preference_id: !!data.preference_id,
            has_order_id: !!data.order_id,
            all_fields: Object.keys(data),
            full_response: data,
          });
        }
        throw new Error('Resposta de pagamento com cartão inválida');
      }
    } catch (err) {
      // INSANYCK CHECKOUT-RESURRECTION — Better error messages
      let errorMessage = t('error', 'Não foi possível iniciar o pagamento.');

      if (err instanceof Error) {
        if (err.message.includes('Variant not found')) {
          errorMessage = t('variantNotFound', 'Alguns itens no carrinho não estão mais disponíveis. Por favor, remova-os e tente novamente.');
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // INSANYCK MP-HOTFIX-03 — Bricks payment success/error handlers
  const handleBricksSuccess = (paymentId: string) => {
    // Redirect to success page
    router.push(`/checkout/success?payment_id=${paymentId}&order_id=${bricksData?.orderId}`);
  };

  const handleBricksError = (errorMsg: string) => {
    setError(errorMsg);
    // Optionally reset Bricks state to allow retry
    if (process.env.NODE_ENV === 'development') {
      console.error('[MP-BRICKS] Payment error:', errorMsg);
    }
  };

  const handleSubmit = async () => {
    switch (activeTab) {
      case 'pix':
        await handlePixPayment();
        break;
      case 'card':
        await handleCardPayment();
        break;
      case 'stripe':
        await handleStripePayment();
        break;
    }
  };

  // === Determine current step (INSANYCK F-MP.POLISH — dynamic progress) ===
  const getCurrentStep = (): 1 | 2 | 3 => {
    if (!identityValid) return 1;
    if (!addressValid) return 2;
    return 3;
  };

  // INSANYCK STEP F-MP.BUGFIX-01 — Museum loading state enquanto não hidratou
  if (!hydrated) {
    return (
      <>
        <Head>
          <title>{t('title', 'Checkout')} — INSANYCK</title>
          <meta name="robots" content="noindex" />
        </Head>

        <main className="min-h-screen pt-[120px] insanyck-bloom insanyck-bloom--soft">
          <div className="mx-auto max-w-xl px-6 pb-12">
            <GlassCard className="mt-8">
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                {/* Museum spinner */}
                <div
                  className="w-12 h-12 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    borderTopColor: 'rgba(255, 255, 255, 0.65)',
                  }}
                  aria-hidden="true"
                />
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-white/80">
                    {t('loading.title', 'Preparando checkout')}
                  </h2>
                  <p className="text-sm text-white/50 mt-1">
                    {t('loading.message', 'Aguarde um momento...')}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </main>
      </>
    );
  }

  // INSANYCK STEP F-MP.BUGFIX-01 — Carrinho vazio APÓS hidratação: redirect via useEffect
  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  // === Render one-page checkout (INSANYCK F-MP.POLISH) ===
  const canProceedToPayment = identityValid && addressValid;

  return (
    <>
      <Head>
        <title>{t('title', 'Checkout')} — INSANYCK</title>
        <meta name="description" content={t('subtitle', 'Finalize sua compra com segurança.')} />
        <meta name="robots" content="noindex" />
      </Head>

      <main className="min-h-screen pt-[120px] insanyck-bloom insanyck-bloom--soft">
        <div className="mx-auto max-w-xl px-6 pb-12">
          {/* Progress Steps (INSANYCK F-MP.POLISH — dynamic) */}
          <CheckoutSteps current={getCurrentStep()} />

          {/* INSANYCK F-MP.POLISH — Identity Panel */}
          <IdentityPanel
            sessionEmail={session?.user?.email}
            onValidation={handleIdentityValidation}
          />

          {/* INSANYCK F-MP.POLISH — Address Panel */}
          <AddressPanel onValidation={handleAddressValidation} />

          {/* Payment Card (INSANYCK F-MP.POLISH — existing logic preserved) */}
          <GlassCard className="mt-6">
            <h1 className="text-2xl font-semibold text-white mb-2">
              {t('payment.title', 'Pagamento')}
            </h1>
            <p className="text-white/60 text-sm mb-6">
              {t('payment.selectMethod', 'Escolha como pagar')}
            </p>

            {/* Payment Tabs */}
            {availableMethods.length > 1 && (
              <div className="mb-6">
                <PaymentTabs
                  active={activeTab}
                  onChange={setActiveTab}
                  availableMethods={availableMethods}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* PIX Payment Content */}
            {activeTab === 'pix' && !pixData && (
              <div className="space-y-4">
                <p className="text-white/70 text-sm">
                  {t('pix.title', 'Pague com PIX')}
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !canProceedToPayment}
                  className="w-full px-6 py-4 bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.12)] rounded-xl text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cold-ray-ring)]"
                >
                  {isLoading ? t('processing', 'Processando...') : t('placeOrder', 'Finalizar pedido')}
                </button>
                {!canProceedToPayment && (
                  <p className="text-white/50 text-xs text-center">
                    {!identityValid
                      ? t('identity.loggedOut', 'Informe seu e-mail para continuar')
                      : t('address.helper', 'Preencha os dados para calcular o frete e entregar seu pedido')}
                  </p>
                )}
              </div>
            )}

            {/* INSANYCK MP-HOTFIX-03 — PIX with new Museum panel */}
            {activeTab === 'pix' && pixData && (
              <MercadoPagoPixPanel
                paymentId={pixData.paymentId}
                orderId={pixData.orderId}
                qrCode={pixData.qrCode}
                qrCodeBase64={pixData.qrCodeBase64}
                expiresAt={pixData.expiresAt}
                amount={pixData.amount}
              />
            )}

            {/* INSANYCK MP-HOTFIX-03 — Card Payment with Bricks (in-page) */}
            {activeTab === 'card' && !bricksData && (
              <div className="space-y-4">
                <p className="text-white/70 text-sm">
                  {t('card.title', 'Pague com cartão')}
                </p>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60">
                  {t('card.secureNote', 'Pagamento 100% seguro via Mercado Pago')}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !canProceedToPayment}
                  className="w-full px-6 py-4 bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.12)] rounded-xl text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cold-ray-ring)]"
                >
                  {isLoading ? t('card.processing', 'Processando...') : t('card.continueButton', 'Continuar para pagamento')}
                </button>
                {!canProceedToPayment && (
                  <p className="text-white/50 text-xs text-center">
                    {!identityValid
                      ? t('identity.loggedOut', 'Informe seu e-mail para continuar')
                      : t('address.helper', 'Preencha os dados para calcular o frete e entregar seu pedido')}
                  </p>
                )}
              </div>
            )}

            {/* INSANYCK MP-HOTFIX-03 — Bricks Card Form (in-page, NO redirect) */}
            {activeTab === 'card' && bricksData && (
              <MercadoPagoBricksCard
                preferenceId={bricksData.preferenceId}
                amount={bricksData.amount}
                orderId={bricksData.orderId}
                onSuccess={handleBricksSuccess}
                onError={handleBricksError}
              />
            )}

            {/* Stripe Payment Content (INSANYCK F-MP.POLISH — i18n subtitle) */}
            {activeTab === 'stripe' && (
              <div className="space-y-4">
                <p className="text-white/70 text-sm">
                  {t('stripe.title', 'Pagamento internacional')}
                </p>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60">
                  {t('stripe.subtitle', 'Pagamento processado com segurança via Stripe')}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !canProceedToPayment}
                  className="w-full px-6 py-4 bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.12)] rounded-xl text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cold-ray-ring)]"
                >
                  {isLoading ? t('processing', 'Processando...') : t('placeOrder', 'Finalizar pedido')}
                </button>
                {!canProceedToPayment && (
                  <p className="text-white/50 text-xs text-center">
                    {!identityValid
                      ? t('identity.loggedOut', 'Informe seu e-mail para continuar')
                      : t('address.helper', 'Preencha os dados para calcular o frete e entregar seu pedido')}
                  </p>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'pt', ['common', 'nav', 'checkout'])),
    },
  };
};
