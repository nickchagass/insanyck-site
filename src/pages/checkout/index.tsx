// INSANYCK STEP F-MP — Página de checkout híbrida (Museum Edition)
import { useState, useEffect } from 'react';
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

export default function CheckoutPage() {
  const { t, i18n } = useTranslation('checkout');
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  // INSANYCK STEP F-MP.BUGFIX-01 — Prevent false-positive redirect before hydration
  const hydrated = useCartHydrated();

  const [activeTab, setActiveTab] = useState<PaymentMethod>('pix');
  const [email, setEmail] = useState('');
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
  // INSANYCK STEP F-MP.2 — Card redirect state
  const [redirecting, setRedirecting] = useState(false);

  // INSANYCK STEP F-MP.BUGFIX-01 — Redirecionar se carrinho vazio (apenas APÓS hidratação)
  useEffect(() => {
    if (!hydrated) return; // Aguardar hidratação antes de decidir
    if (items.length === 0) {
      router.push('/loja');
    }
  }, [hydrated, items.length, router]);

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

  const handlePixPayment = async () => {
    const payerEmail = session?.user?.email || email;

    if (!payerEmail) {
      setError(t('emailInput.required'));
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

      if (data.provider === 'mercadopago') {
        setPixData(data);
      } else {
        throw new Error('Provider inválido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
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
          email: session?.user?.email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t('error'));
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
      setIsLoading(false);
    }
  };

  const handleCardPayment = async () => {
    // INSANYCK STEP F-MP.2 — Card MP redirect flow
    const payerEmail = session?.user?.email || email;

    if (!payerEmail) {
      setError(t('emailInput.required'));
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

      if (data.method === 'card' && data.initPoint) {
        // INSANYCK STEP F-MP.2 — Museum pre-redirect screen
        setRedirecting(true);
        setIsLoading(false);

        // Redirect após 800ms (permite animação Museum)
        setTimeout(() => {
          window.location.href = data.initPoint;
        }, 800);
      } else {
        throw new Error('Invalid card payment response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
      setIsLoading(false);
      setRedirecting(false);
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

  // INSANYCK STEP F-MP.BUGFIX-01 — Museum loading state enquanto não hidratou
  if (!hydrated) {
    return (
      <>
        <Head>
          <title>{t('title')} — INSANYCK</title>
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

  return (
    <>
      <Head>
        <title>{t('title')} — INSANYCK</title>
        <meta name="description" content={t('subtitle')} />
        <meta name="robots" content="noindex" />
      </Head>

      <main className="min-h-screen pt-[120px] insanyck-bloom insanyck-bloom--soft">
        <div className="mx-auto max-w-xl px-6 pb-12">
          {/* Progress Steps */}
          <CheckoutSteps current={3} />

          {/* Main Card */}
          <GlassCard className="mt-8">
            <h1 className="text-2xl font-semibold text-white mb-2">{t('payment.title')}</h1>
            <p className="text-white/60 text-sm mb-6">{t('payment.selectMethod')}</p>

            {/* Email Input (se não logado) */}
            {!session?.user?.email && (
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm text-white/60 mb-2">
                  {t('emailInput.label')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailInput.placeholder')}
                  className="w-full px-4 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] rounded-xl text-white placeholder-white/40 focus:border-[rgba(255,255,255,0.25)] focus:outline-none focus:ring-2 focus:ring-white/10"
                  required
                />
              </div>
            )}

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
                <p className="text-white/70 text-sm">{t('pix.title')}</p>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full px-6 py-4 bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.12)] rounded-xl text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('processing') : t('placeOrder')}
                </button>
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

            {/* Card Payment Content */}
            {activeTab === 'card' && !redirecting && (
              <div className="space-y-4">
                <p className="text-white/70 text-sm">{t('card.title')}</p>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60">
                  {t('card.secureNote')}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full px-6 py-4 bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.12)] rounded-xl text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('card.processing') : t('card.continueButton')}
                </button>
              </div>
            )}

            {/* INSANYCK STEP F-MP.2 — Museum pre-redirect screen */}
            {activeTab === 'card' && redirecting && (
              <div className="space-y-6 text-center py-8">
                <div className="mx-auto w-16 h-16 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {t('card.redirectTitle')}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {t('card.redirectMessage')}
                  </p>
                </div>
              </div>
            )}

            {/* Stripe Payment Content */}
            {activeTab === 'stripe' && (
              <div className="space-y-4">
                <p className="text-white/70 text-sm">
                  {locale === 'pt' ? 'Pagamento internacional via Stripe' : 'International payment via Stripe'}
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full px-6 py-4 bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.12)] rounded-xl text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('processing') : t('placeOrder')}
                </button>
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
