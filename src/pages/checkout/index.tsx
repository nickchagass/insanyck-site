// INSANYCK STEP F-MP + F-MP.POLISH — Página de checkout híbrida (Museum Edition One-Page)
// INSANYCK CHECKOUT-FIX-NOW-01 — Verified i18n compliance + clean payment flow
import { useState, useEffect, useCallback } from 'react';
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
import PixPayment from '@/components/checkout/PixPayment';
import IdentityPanel from '@/components/checkout/IdentityPanel';
import AddressPanel, { AddressData } from '@/components/checkout/AddressPanel';

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

  // === Payment State (existing logic preserved) ===
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
  // INSANYCK MP-HOTFIX-01 — Card confirmation panel state (replaces auto-redirect)
  const [mpCardData, setMpCardData] = useState<{
    initPoint: string;
    orderId: string;
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

      // INSANYCK MP-HOTFIX-01 — Validate MP PIX response (snake_case fields)
      if (data.provider === 'mercadopago' && data.method === 'pix') {
        if (!data.payment_id || (!data.qr_code && !data.qr_code_base64)) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[MP-HOTFIX-01] Invalid PIX response:', data);
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
          console.error('[MP-HOTFIX-01] Unexpected provider/method:', data);
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
    // INSANYCK MP-HOTFIX-01 — Card MP confirmation flow (NO auto-redirect)
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
          method: 'card',
          email: payerEmail,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Falha ao criar pagamento');
      }

      const data = await res.json();

      // INSANYCK MP-HOTFIX-01 — Validate MP Card response (snake_case fields)
      if (data.method === 'card' && data.init_point) {
        // Show premium confirmation panel (NO auto-redirect)
        setMpCardData({
          initPoint: data.init_point,
          orderId: data.order_id,
        });
        setIsLoading(false);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('[MP-HOTFIX-01] Invalid Card response:', data);
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

  // INSANYCK MP-HOTFIX-01 — Premium redirect handlers (explicit user action)
  const handleMpCardRedirect = () => {
    if (mpCardData?.initPoint) {
      window.location.assign(mpCardData.initPoint);
    }
  };

  const handleCopyMpLink = async () => {
    if (mpCardData?.initPoint) {
      try {
        await navigator.clipboard.writeText(mpCardData.initPoint);
        // Show subtle confirmation (reuse existing error state for simplicity)
        const prevError = error;
        setError(locale === 'pt' ? 'Link copiado!' : 'Link copied!');
        setTimeout(() => setError(prevError), 2000);
      } catch {
        setError(locale === 'pt' ? 'Não foi possível copiar o link' : 'Could not copy link');
      }
    }
  };

  const handleOpenMpNewTab = () => {
    if (mpCardData?.initPoint) {
      window.open(mpCardData.initPoint, '_blank', 'noopener,noreferrer');
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

            {activeTab === 'pix' && pixData && (
              <PixPayment
                paymentId={pixData.paymentId}
                orderId={pixData.orderId}
                qrCode={pixData.qrCode}
                qrCodeBase64={pixData.qrCodeBase64}
                expiresAt={pixData.expiresAt}
                amount={pixData.amount}
              />
            )}

            {/* Card Payment Content - INSANYCK MP-HOTFIX-01 */}
            {activeTab === 'card' && !mpCardData && (
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

            {/* INSANYCK MP-HOTFIX-01 — Premium Confirmation Panel (NO auto-redirect) */}
            {activeTab === 'card' && mpCardData && (
              <div className="space-y-6 py-6">
                {/* Museum Edition confirmation with premium glassmorphism */}
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {locale === 'pt' ? 'Pronto para pagamento' : 'Ready for payment'}
                  </h3>
                  <p className="text-white/60 text-sm mb-6">
                    {locale === 'pt'
                      ? 'Clique no botão abaixo para abrir o Mercado Pago e finalizar seu pagamento com segurança'
                      : 'Click the button below to open Mercado Pago and complete your payment securely'}
                  </p>
                </div>

                {/* Primary CTA */}
                <button
                  onClick={handleMpCardRedirect}
                  className="w-full px-6 py-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-white font-semibold transition-all transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  {locale === 'pt' ? 'Abrir Mercado Pago' : 'Open Mercado Pago'}
                </button>

                {/* Secondary Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCopyMpLink}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  >
                    {locale === 'pt' ? 'Copiar link' : 'Copy link'}
                  </button>
                  <button
                    onClick={handleOpenMpNewTab}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  >
                    {locale === 'pt' ? 'Abrir em nova aba' : 'Open in new tab'}
                  </button>
                </div>

                <p className="text-white/50 text-xs text-center mt-4">
                  {locale === 'pt'
                    ? 'Você será redirecionado para a plataforma segura do Mercado Pago'
                    : 'You will be redirected to Mercado Pago\'s secure platform'}
                </p>
              </div>
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
