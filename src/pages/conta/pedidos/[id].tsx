// INSANYCK STEP E-03 / E-04
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
import { formatPrice } from "@/lib/price";
import { formatDateTime } from "@/lib/date";

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
        return t('account:orders.status.preparing');
      case 'shipped':
        return t('account:orders.status.shipped');
      case 'delivered':
        return t('account:orders.status.delivered');
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

  // INSANYCK STEP E-04 — Usa helpers consolidados
  const locale = i18n.language === "en" ? "en" : "pt";
  const dateLocale = i18n.language === "en" ? "en-US" : "pt-BR";

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
          <title>{t('account:orders.detail.title')} — INSANYCK</title>
        </Head>
        <AccountLayout titleKey="account:orders.detail.title">
          <div className="text-center py-8">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 max-w-md mx-auto">
              <p className="text-red-400 text-sm">
                {t('account:orders.detail.error')}
              </p>
              <Link href="/conta/pedidos" className="mt-3 inline-block">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('account:orders.detail.backToOrders')}
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
          <title>{t('account:orders.detail.title')} — INSANYCK</title>
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
          <title>{t('account:orders.detail.title')} — INSANYCK</title>
        </Head>
        <AccountLayout titleKey="account:orders.detail.title">
          <div className="text-center py-8">
            <p className="text-white/60 mb-4">
              {t('account:orders.detail.notFound')}
            </p>
            <Link href="/conta/pedidos">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('account:orders.detail.backToOrders')}
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
          {t('account:orders.detail.title')} #{order.id.slice(0, 8).toUpperCase()} — INSANYCK
        </title>
      </Head>
      
      <AccountLayout titleKey="account:orders.detail.title">
        <div className="space-y-6">
          {/* INSANYCK STEP G-EXEC-P1-D — Header com back button */}
          <div className="flex items-center gap-4">
            <Link
              href="/conta/pedidos"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-[0.875rem] text-white/70 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('account:orders.detail.backToOrders')}
            </Link>
          </div>

          {/* INSANYCK STEP G-EXEC-P1-D — Order Summary Museum Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="ins-panel p-6 lg:p-8"
          >
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-white/[0.06]">
              <div>
                <h1 className="text-2xl font-light tracking-tight text-white/95 mb-2">
                  {t('account:orders.detail.orderNumber')} <span className="font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
                </h1>
                <div className="flex items-center gap-2 text-[0.8125rem] text-white/60">
                  {/* INSANYCK A11Y — Touch target 44px (WCAG AAA) */}
                  <button
                    onClick={() => copyToClipboard(order.id)}
                    className="flex items-center gap-2 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] rounded min-h-[44px] min-w-[44px] px-2 py-2 -ml-1"
                  >
                    <Copy className="h-3 w-3" />
                    {copied ? t('common:copied') : t('common:copyId')}
                  </button>
                </div>
              </div>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
                {getStatusText(status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-[0.7rem] uppercase tracking-wide text-white/50 mb-2">{t('account:orders.detail.orderDate')}</p>
                <p className="text-[0.9375rem] text-white/90">{formatDateTime(order.createdAt, dateLocale)}</p>
              </div>
              <div>
                <p className="text-[0.7rem] uppercase tracking-wide text-white/50 mb-2">{t('account:orders.detail.total')}</p>
                <p className="text-[1.125rem] font-light text-white/95 tabular-nums">{formatPrice(order.amountTotal, locale, order.currency as "BRL" | "USD")}</p>
              </div>
              {order.trackingCode && (
                <div>
                  <p className="text-[0.7rem] uppercase tracking-wide text-white/50 mb-2">{t('account:orders.detail.tracking')}</p>
                  {/* INSANYCK A11Y — Touch target 44px (WCAG AAA) */}
                  <button
                    onClick={() => copyToClipboard(order.trackingCode!)}
                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 text-[0.875rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] rounded min-h-[44px] min-w-[44px] px-2 py-2 -ml-1"
                  >
                    <span className="font-mono">{order.trackingCode}</span>
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {order.shippedAt && (
              <div className="mt-6 pt-6 border-t border-white/[0.06]">
                <p className="text-[0.7rem] uppercase tracking-wide text-white/50 mb-2">{t('account:orders.detail.shippedDate')}</p>
                <p className="text-[0.9375rem] text-white/90">{formatDateTime(order.shippedAt, dateLocale)}</p>
              </div>
            )}
          </motion.div>

          {/* INSANYCK STEP G-EXEC-P1-D — Order Items Museum Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="ins-panel p-6 lg:p-8"
          >
            <h2 className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-white/50 mb-6">
              {t('account:orders.detail.items')}
            </h2>

            <div className="space-y-0">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between py-4 ${
                    index < order.items.length - 1 ? "border-b border-white/[0.06]" : ""
                  }`}
                >
                  <div className="flex-1">
                    <h3 className="text-[0.9375rem] font-light text-white/95">{item.title}</h3>
                    <p className="text-[0.8125rem] text-white/50 mt-1">
                      {t('account:orders.detail.quantity')}: <span className="tabular-nums">{item.qty}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[1rem] font-light text-white/95 tabular-nums">
                      {formatPrice(item.priceCents * item.qty, locale, order.currency as "BRL" | "USD")}
                    </p>
                    <p className="text-[0.75rem] text-white/50 mt-1 tabular-nums">
                      {formatPrice(item.priceCents, locale, order.currency as "BRL" | "USD")} {t('account:orders.detail.each')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/[0.08]">
              <div className="flex justify-between items-center">
                <span className="text-[0.875rem] uppercase tracking-wide text-white/60">
                  {t('account:orders.detail.total')}
                </span>
                <span className="text-2xl font-light text-white/95 tabular-nums">
                  {formatPrice(order.amountTotal, locale, order.currency as "BRL" | "USD")}
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