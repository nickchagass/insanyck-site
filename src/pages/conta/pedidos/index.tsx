// INSANYCK FASE G-04.2.1.B — Página de pedidos com DsTable e DsEmptyState
// INSANYCK STEP G-FIX-I18N-LUXURY — Premium Skeletons + i18n Completo
import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Truck, CheckCircle, Clock, Eye, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import AccountLayout from "@/components/AccountLayout";
import DsTable from "@/components/ds/DsTable";
import DsEmptyState from "@/components/ds/DsEmptyState";
import DsButton from "@/components/ds/DsButton";
import { Button } from "@/components/ui/Button";
import { OrderSkeleton, OrderSkeletonTable } from "@/components/ui/OrderSkeleton";
import useSWR from "swr";
import { formatPrice } from "@/lib/price";
import { formatDate } from "@/lib/date";

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

type OrdersResponse = {
  items: Order[];
  total: number;
  offset: number;
  limit: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function OrdersPage() {
  const { t, i18n } = useTranslation(["account", "common"]);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data, error, isLoading } = useSWR<OrdersResponse>(
    `/api/account/orders?offset=${offset}&limit=${limit}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const orders = data?.items ?? [];
  const total = data?.total ?? 0;

  const getStatusFromOrder = (order: Order): 'preparing' | 'shipped' | 'delivered' => {
    if (order.shippedAt) return 'shipped';
    if (order.status === 'paid') return 'preparing';
    return 'preparing';
  };

  const getStatusIcon = (status: 'preparing' | 'shipped' | 'delivered') => {
    switch (status) {
      case 'preparing':
        return <Clock className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
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

  const handlePrevious = () => {
    setOffset(Math.max(0, offset - limit));
  };

  const handleNext = () => {
    setOffset(offset + limit);
  };

  if (error) {
    return (
      <>
        <Head>
          <title>{t('account:orders.title')} — INSANYCK</title>
        </Head>
        <AccountLayout titleKey="account:orders.title">
          <div className="text-center py-8">
            <div className="bg-[color:var(--ds-danger-soft)] border border-[color:var(--ds-danger)] rounded-2xl p-4 max-w-md mx-auto">
              <p className="text-[color:var(--ds-danger)] text-sm">
                {t('account:orders.error')}
              </p>
            </div>
          </div>
        </AccountLayout>
      </>
    );
  }

  // INSANYCK FASE G-04.2.1.B — DsEmptyState quando não há pedidos
  if (orders.length === 0 && !isLoading) {
    return (
      <>
        <Head>
          <title>{t('account:orders.title')} — INSANYCK</title>
        </Head>
        <AccountLayout titleKey="account:orders.title">
          <DsEmptyState
            icon={<Package className="w-16 h-16" />}
            title={t('account:orders.emptyTitle', 'Nenhum pedido ainda')}
            description={t('account:orders.emptyDescription', 'Quando você fizer compras, seus pedidos aparecerão aqui.')}
            primaryAction={
              <Link href="/loja">
                <DsButton variant="primary" size="lg">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {t('account:orders.startShopping', 'Começar a comprar')}
                </DsButton>
              </Link>
            }
            secondaryAction={
              <Link href="/novidades" className="text-sm text-ds-accentSoft hover:text-ds-accent transition-colors">
                {t('account:orders.seeNew', 'Ver novidades')}
              </Link>
            }
          />
        </AccountLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{t('account:orders.title')} — INSANYCK</title>
      </Head>

      <AccountLayout titleKey="account:orders.title">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-ds-accentSoft">
              {t('account:orders.subtitle')}
            </p>
            {!isLoading && data && (
              <span className="text-sm text-ds-accentSoft opacity-60">
                {/* INSANYCK STEP G-FIX-I18N-LUXURY — Pluralização com i18n count */}
                {t('account:orders.count', { count: total })}
              </span>
            )}
          </div>

          {/* INSANYCK STEP G-FIX-I18N-LUXURY — Premium Skeleton Loading States */}
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Desktop: Table Skeleton */}
                <div className="hidden md:block">
                  <OrderSkeletonTable rows={5} />
                </div>

                {/* Mobile: Cards Skeleton */}
                <div className="md:hidden">
                  <OrderSkeleton count={3} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isLoading && orders.length > 0 && (
            <motion.div
              key="orders-loaded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* INSANYCK FASE G-04.2.1.B — Desktop: DsTable */}
              <div className="hidden md:block">
                <DsTable density="default" ariaLabel={t('account:orders.tableCaption', 'Lista de pedidos')}>
                  <DsTable.Header>
                    <DsTable.Row>
                      <DsTable.HeaderCell>{t('account:orders.table.order')}</DsTable.HeaderCell>
                      <DsTable.HeaderCell>{t('account:orders.table.date')}</DsTable.HeaderCell>
                      <DsTable.HeaderCell>{t('account:orders.table.status')}</DsTable.HeaderCell>
                      <DsTable.HeaderCell>{t('account:orders.table.total')}</DsTable.HeaderCell>
                      <DsTable.HeaderCell align="right">{t('account:orders.table.actions')}</DsTable.HeaderCell>
                    </DsTable.Row>
                  </DsTable.Header>
                  <DsTable.Body>
                    {orders.map((order) => {
                      const status = getStatusFromOrder(order);
                      return (
                        <DsTable.Row key={order.id} isClickable>
                          <DsTable.Cell>
                            <div>
                              <div className="font-medium text-ds-accent">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </div>
                              <div className="text-sm text-ds-accentSoft">
                                {/* INSANYCK STEP G-FIX-I18N-LUXURY — Pluralização de itens */}
                                {t('account:orders.itemCount', { count: order.items.length })}
                              </div>
                            </div>
                          </DsTable.Cell>
                          <DsTable.Cell>
                            <span className="text-ds-accentSoft">
                              {formatDate(order.createdAt, dateLocale)}
                            </span>
                          </DsTable.Cell>
                          <DsTable.Cell>
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                              {getStatusIcon(status)}
                              {getStatusText(status)}
                            </span>
                          </DsTable.Cell>
                          <DsTable.Cell>
                            <span className="font-medium">
                              {formatPrice(order.amountTotal, locale, order.currency as "BRL" | "USD")}
                            </span>
                          </DsTable.Cell>
                          <DsTable.Cell align="right">
                            <Link
                              href={`/conta/pedidos/${order.id}`}
                              className="inline-flex items-center gap-2 text-sm text-ds-accentSoft hover:text-ds-accent transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              {t('account:orders.viewOrder')}
                            </Link>
                          </DsTable.Cell>
                        </DsTable.Row>
                      );
                    })}
                  </DsTable.Body>
                </DsTable>
              </div>

              {/* INSANYCK STEP G-EXEC-P1-D — Mobile Cards Museum Edition */}
              <div className="md:hidden space-y-4">
                {orders.map((order, index) => {
                  const status = getStatusFromOrder(order);
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="ins-panel p-4 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15)_inset] transition-all duration-150"
                    >
                      <div className="flex items-start justify-between mb-3 pb-3 border-b border-white/[0.06]">
                        <div>
                          <h3 className="font-mono text-[0.9375rem] text-white/90">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <p className="text-[0.8125rem] text-white/60 mt-0.5">
                            {formatDate(order.createdAt, dateLocale)}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          {getStatusText(status)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[0.75rem] text-white/50 uppercase tracking-wide mb-1">
                            {/* INSANYCK STEP G-FIX-I18N-LUXURY — Pluralização de itens mobile */}
                            {t('account:orders.itemCount', { count: order.items.length })}
                          </p>
                          <p className="font-light text-[1.125rem] text-white/95 tabular-nums">
                            {formatPrice(order.amountTotal, locale, order.currency as "BRL" | "USD")}
                          </p>
                        </div>
                        <Link
                          href={`/conta/pedidos/${order.id}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-[0.8125rem] text-white/70 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {t('account:orders.viewOrder')}
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination (com tokens DS) */}
              {total > limit && (
                <div className="flex items-center justify-between pt-6 border-t border-ds-borderSubtle">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={offset <= 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t('common:pagination.previous')}
                  </Button>

                  <span className="text-sm text-ds-accentSoft">
                    {Math.floor(offset / limit) + 1} de {Math.ceil(total / limit)}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    disabled={offset + limit >= total}
                    className="flex items-center gap-2"
                  >
                    {t('common:pagination.next')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}
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
  return {
    props: await serverSideTranslations(ctx.locale ?? "pt", ["common", "nav", "account"]),
  };
};
