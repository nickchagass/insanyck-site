// INSANYCK STEP 4 · Lote 4 — Enhanced orders page with table and states
import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock, Eye } from "lucide-react";
import Link from "next/link";

import AccountLayout from "@/components/AccountLayout";
import OrdersEmpty from "@/components/EmptyStates/OrdersEmpty";
import { Button } from "@/components/ui/Button";
import useSWR from "swr";

type Order = {
  id: string;
  status: string;
  amountTotal: number;
  createdAt: string;
  items: { id: string; title: string; qty: number; priceCents: number }[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function OrdersPage() {
  const { t } = useTranslation(["account", "common"]);
  const { data, isLoading } = useSWR<{ orders: Order[] }>("/api/account/orders", fetcher);
  const orders = data?.orders ?? [];

  const getStatusFromOrder = (order: Order): 'preparing' | 'shipped' | 'delivered' => {
    // Map order status to our predefined statuses
    const status = order.status.toLowerCase();
    if (status.includes('delivered') || status.includes('completed')) return 'delivered';
    if (status.includes('shipped') || status.includes('transit')) return 'shipped';
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (orders.length === 0 && !isLoading) {
    return (
      <>
        <Head>
          <title>{t('account:orders.title', 'Meus Pedidos')} — INSANYCK</title>
        </Head>
        <AccountLayout titleKey="account:orders.title">
          <OrdersEmpty />
        </AccountLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{t('account:orders.title', 'Meus Pedidos')} — INSANYCK</title>
      </Head>
      
      <AccountLayout titleKey="account:orders.title">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-white/60">
              {t('account:orders.subtitle', 'Acompanhe seus pedidos e histórico de compras')}
            </p>
            {!isLoading && (
              <span className="text-sm text-white/40">
                {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
              </span>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-white/20 border-t-white rounded-full" />
            </div>
          )}

          {!isLoading && orders.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-hidden">
                <table className="w-full">
                  <caption className="sr-only">
                    {t('account:orders.tableCaption', 'Lista de pedidos realizados')}
                  </caption>
                  <thead>
                    <tr className="border-b border-white/10">
                      <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-white/60">
                        {t('account:orders.table.order', 'Pedido')}
                      </th>
                      <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-white/60">
                        {t('account:orders.table.date', 'Data')}
                      </th>
                      <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-white/60">
                        {t('account:orders.table.status', 'Status')}
                      </th>
                      <th scope="col" className="text-left py-3 px-4 text-sm font-medium text-white/60">
                        {t('account:orders.table.total', 'Total')}
                      </th>
                      <th scope="col" className="text-right py-3 px-4 text-sm font-medium text-white/60">
                        {t('account:orders.table.actions', 'Ações')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {orders.map((order, index) => {
                      const status = getStatusFromOrder(order);
                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-white">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </div>
                              <div className="text-sm text-white/60">
                                {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-white/80">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                              {getStatusIcon(status)}
                              {getStatusText(status)}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-white">
                            {formatPrice(order.amountTotal)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Link 
                              href={`/pedido/${order.id}`}
                              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              {t('account:orders.viewOrder', 'Ver detalhes')}
                            </Link>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {orders.map((order, index) => {
                  const status = getStatusFromOrder(order);
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-black/20 border border-white/10 rounded-2xl p-4 hover:bg-black/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-white">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-white/60">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          {getStatusText(status)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white/60">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                          </p>
                          <p className="font-medium text-white">
                            {formatPrice(order.amountTotal)}
                          </p>
                        </div>
                        <Link href={`/pedido/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            {t('account:orders.viewOrder', 'Ver')}
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
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
