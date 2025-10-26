import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { CheckCircle, Clock, Eye } from "lucide-react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { prisma } from "@/lib/prisma";

type OrderItem = {
  slug: string;
  title: string;
  qty: number;
  priceCents: number;
};

type Order = {
  id: string;
  status: string;
  amountTotal: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
};

interface SuccessPageProps {
  sessionId: string;
  order: Order | null;
  isProcessing: boolean;
}

export default function CheckoutSuccessPage({ sessionId, order, isProcessing }: SuccessPageProps) {
  const { t, i18n } = useTranslation(["checkout", "common"]);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(order);
  const [isPolling, setIsPolling] = useState(isProcessing);

  const formatPrice = (price: number, currency: string) => {
    const locale = i18n.language === 'en' ? 'en-US' : 'pt-BR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'BRL',
    }).format(price / 100);
  };

  // Polling leve para casos de processing
  useEffect(() => {
    if (!isPolling || pollingAttempts >= 3) return;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/checkout/order-status?session_id=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.order) {
            setCurrentOrder(data.order);
            setIsPolling(false);
          } else {
            setPollingAttempts(prev => prev + 1);
          }
        } else {
          setPollingAttempts(prev => prev + 1);
        }
      } catch {
        setPollingAttempts(prev => prev + 1);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [sessionId, isPolling, pollingAttempts]);

  return (
    <>
      <Head>
        <title>{t("checkout:success.title", "Pedido Confirmado")} — INSANYCK</title>
        <meta name="description" content={t("checkout:success.description", "Seu pedido foi processado com sucesso")} />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="min-h-screen pt-[120px] insanyck-bloom insanyck-bloom--soft">
        <div className="mx-auto max-w-[800px] px-6">
          {/* Processing State */}
          {isPolling && !currentOrder && (
            <div className="relative mb-8">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-8 h-24"
                style={{
                  background: "radial-gradient(70% 100% at 50% 0%, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.08) 40%, rgba(249,115,22,0.0) 80%)",
                }}
              />
              
              <div className="rounded-3xl border border-white/12 bg-black/40 backdrop-blur-md p-8 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-6">
                  <Clock className="w-10 h-10 text-orange-400" />
                </div>

                <h1 className="text-white text-3xl font-semibold mb-4">
                  {t("checkout:success.processing.title", "Processando Pagamento")}
                </h1>

                <div className="text-white/70 mb-8 space-y-3">
                  <p>
                    {t("checkout:success.processing.message", "Aguarde enquanto confirmamos seu pagamento.")}
                  </p>
                  <p className="text-sm">
                    {t("checkout:success.processing.refresh", "Esta página será atualizada automaticamente.")}
                  </p>
                  {pollingAttempts >= 2 && (
                    <p className="text-sm text-orange-400">
                      {t("checkout:success.processing.manual", "Você também pode atualizar a página manualmente.")}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center mb-6">
                  <div className="animate-spin h-6 w-6 border-2 border-white/20 border-t-orange-400 rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {currentOrder && (
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-8 h-24"
                style={{
                  background: "radial-gradient(70% 100% at 50% 0%, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.08) 40%, rgba(34,197,94,0.0) 80%)",
                }}
              />
              
              <div className="rounded-3xl border border-white/12 bg-black/40 backdrop-blur-md p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="mx-auto w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>

                  <h1 className="text-white text-3xl font-semibold mb-4">
                    {t("checkout:success.title", "Pedido Confirmado!")}
                  </h1>

                  <div className="text-white/70 space-y-2">
                    <p>
                      {t("checkout:success.message", "Seu pedido foi processado com sucesso.")}
                    </p>
                    <p className="text-sm">
                      {t("checkout:success.emailSent", "Em breve você receberá um email com os detalhes do pedido.")}
                    </p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-black/20 border border-white/10 rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-semibold">
                      {t("checkout:success.orderSummary", "Resumo do Pedido")}
                    </h2>
                    <span className="text-white/60 text-sm">
                      #{currentOrder.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-3 mb-4">
                    {currentOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                        <div>
                          <p className="text-white font-medium">{item.title}</p>
                          <p className="text-white/60 text-sm">
                            {t("checkout:success.quantity", "Qtd")}: {item.qty}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">
                            {formatPrice(item.priceCents * item.qty, currentOrder.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">
                        {t("checkout:success.total", "Total")}
                      </span>
                      <span className="text-white font-semibold text-lg">
                        {formatPrice(currentOrder.amountTotal, currentOrder.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/loja"
                    className="flex-1 rounded-xl px-6 py-3 font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors text-center"
                  >
                    {t("checkout:success.continueShopping", "Continuar comprando")}
                  </Link>
                  <Link
                    href="/conta/pedidos"
                    className="flex-1 rounded-xl px-6 py-3 font-semibold bg-white text-black hover:brightness-95 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {t("checkout:success.viewOrders", "Meus pedidos")}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Info adicional */}
          <div className="mt-8 text-center text-white/60 text-sm">
            <p>
              {t("checkout:success.support", "Dúvidas? Entre em contato conosco através do")} {" "}
              <Link href="/contato" className="text-white hover:underline">
                {t("common:support", "suporte")}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
  const sessionId = query.session_id as string;
  
  if (!sessionId) {
    return {
      redirect: {
        destination: "/loja",
        permanent: false,
      },
    };
  }

  let order = null;
  let isProcessing = false;

  try {
    // Buscar pedido pelo stripeSessionId
    const foundOrder = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        items: {
          select: {
            slug: true,
            title: true,
            qty: true,
            priceCents: true,
          },
        },
      },
    });

    if (foundOrder) {
      order = {
        id: foundOrder.id,
        status: foundOrder.status,
        amountTotal: foundOrder.amountTotal,
        currency: foundOrder.currency,
        createdAt: foundOrder.createdAt.toISOString(),
        items: foundOrder.items,
      };
    } else {
      // Pedido ainda não foi criado pelo webhook
      isProcessing = true;
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    isProcessing = true;
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "pt", ["common", "checkout"])),
      sessionId,
      order,
      isProcessing,
    },
  };
};