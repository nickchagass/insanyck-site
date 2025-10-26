import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock, ArrowLeft, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import AccountLayout from "@/components/AccountLayout";
import { Button } from "@/components/ui/Button";
import useSWR from "swr";

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
  trackingCode: string | null;
  shippedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface OrderDetailProps {
  orderId: string;
}

export default function OrderDetailPage({ orderId }: OrderDetailProps) {
  const { t, i18n } = useTranslation(["account", "common"]);
  const [copied, setCopied] = useState(false);
  
  const { data: order, error, isLoading } = useSWR<Order>(
    `/api/account/orders/${orderId}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const getStatusFromOrder = (order: Order): 'preparing' | 'shipped' | 'delivered' => {
    if (order.shippedAt) return 'shipped';
    if (order.status === 'paid') return 'preparing';
    return 'preparing';
  };

  const getStatusIcon = (status: 'preparing' | 'shipped' | 'delivered') => {
    switch (status) {
      case 'preparing':
        return <Clock className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusText = (status: 'preparing' | 'shipped' | 'delivered') => {
    switch (status) {
      case 'preparing':
        return t('account:orders.status.preparing', 'Em preparo');
      case 'shipped':
        return t('account:orders.status.shipped', 'Enviado');
      case 'delivered':
        return t('account:orders.status.delivered', 'Entregue');
      default:
        return status;
    }
  };

  const getStatusColor = (status: 'preparing' | 'shipped' | 'delivered') => {
    switch (status) {
      case 'preparing':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'shipped':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'delivered':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const locale = i18n.language === 'en' ? 'en-US' : 'pt-BR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'BRL',
    }).format(price / 100);
  };

  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'en' ? 'en-US' : 'pt-BR';
    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback silencioso
    }
  };

  if (error) {
    return (
      <>
        <Head>
          <title>{t('account:orders.detail.title', 'Detalhes do Pedido')} — INSANYCK</title>
        </Head>
        <AccountLayout titleKey="account:orders.detail.title">
          <div className="text-center py-8">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 max-w-md mx-auto">
              <p className="text-red-400 text-sm">
                {t('account:orders.detail.error', 'Pedido não encontrado ou erro ao carregar.')}
              </p>
              <Link href="/conta/pedidos" className="mt-3 inline-block">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('account:orders.detail.backToOrders', 'Voltar aos pedidos')}
                </Button>
              </Link>
            </div>
          </div>
        </AccountLayout>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Head>
          <title>{t('account:orders.detail.title', 'Detalhes do Pedido')} — INSANYCK</title>
        </Head>
        <AccountLayout titleKey="account:orders.detail.title">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-white/20 border-t-white rounded-full" />
          </div>
        </AccountLayout>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Head>
          <title>{t('account:orders.detail.title', 'Detalhes do Pedido')} — INSANYCK</title>
        </Head>
        <AccountLayout titleKey="account:orders.detail.title">
          <div className="text-center py-8">
            <p className="text-white/60 mb-4">
              {t('account:orders.detail.notFound', 'Pedido não encontrado')}
            </p>
            <Link href="/conta/pedidos">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('account:orders.detail.backToOrders', 'Voltar aos pedidos')}
              </Button>
            </Link>
          </div>
        </AccountLayout>
      </>
    );
  }

  const status = getStatusFromOrder(order);

  return (
    <>
      <Head>
        <title>
          {t('account:orders.detail.title', 'Detalhes do Pedido')} #{order.id.slice(0, 8).toUpperCase()} — INSANYCK
        </title>
      </Head>
      
      <AccountLayout titleKey="account:orders.detail.title">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/conta/pedidos">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('account:orders.detail.backToOrders', 'Voltar aos pedidos')}
              </Button>
            </Link>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/20 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-semibold text-white mb-2">
                  {t('account:orders.detail.orderNumber', 'Pedido')} #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <button
                    onClick={() => copyToClipboard(order.id)}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    {copied ? t('common:copied', 'Copiado!') : t('common:copyId', 'Copiar ID completo')}
                  </button>
                </div>
              </div>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
                {getStatusText(status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-white/60 mb-1">{t('account:orders.detail.orderDate', 'Data do pedido')}</p>
                <p className="text-white">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-white/60 mb-1">{t('account:orders.detail.total', 'Total')}</p>
                <p className="text-white font-medium">{formatPrice(order.amountTotal, order.currency)}</p>
              </div>
              {order.trackingCode && (
                <div>
                  <p className="text-white/60 mb-1">{t('account:orders.detail.tracking', 'Código de rastreio')}</p>
                  <button
                    onClick={() => copyToClipboard(order.trackingCode!)}
                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                  >
                    {order.trackingCode}
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {order.shippedAt && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm mb-1">{t('account:orders.detail.shippedDate', 'Data de envio')}</p>
                <p className="text-white text-sm">{formatDate(order.shippedAt)}</p>
              </div>
            )}
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/20 border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-lg font-medium text-white mb-4">
              {t('account:orders.detail.items', 'Itens do pedido')}
            </h2>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0 last:pb-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="text-sm text-white/60">
                      {t('account:orders.detail.quantity', 'Quantidade')}: {item.qty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {formatPrice(item.priceCents * item.qty, order.currency)}
                    </p>
                    <p className="text-sm text-white/60">
                      {formatPrice(item.priceCents, order.currency)} {t('account:orders.detail.each', 'cada')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-white">
                  {t('account:orders.detail.total', 'Total')}
                </span>
                <span className="text-lg font-semibold text-white">
                  {formatPrice(order.amountTotal, order.currency)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </AccountLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session?.user?.id) {
    return { redirect: { destination: "/conta/login", permanent: false }, props: {} as any };
  }

  const orderId = ctx.params?.id as string;
  if (!orderId) {
    return { redirect: { destination: "/conta/pedidos", permanent: false }, props: {} as any };
  }

  return {
    props: {
      orderId,
      ...(await serverSideTranslations(ctx.locale ?? "pt", ["common", "nav", "account"])),
    },
  };
};