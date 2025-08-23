// INSANYCK ETAPA 11E — UI Admin Orders simples
"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Search, Eye, Package, Truck } from "lucide-react";

interface OrderItem {
  slug: string;
  title: string;
  priceCents: number;
  qty: number;
  image?: string;
  variant?: string;
  variantId?: string;
  sku?: string;
}

interface Order {
  id: string;
  email: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  currency: string;
  amountTotal: number;
  createdAt: string;
  stripeSessionId?: string;
  items: OrderItem[];
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    paid: 'bg-green-500/20 text-green-400 border-green-500/30',
    shipped: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    delivered: 'bg-green-600/20 text-green-300 border-green-600/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  
  const labels = {
    pending: 'Pendente',
    paid: 'Pago',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };

  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${colors[status]}`}>
      {labels[status]}
    </span>
  );
};

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<OrdersResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Verificar autenticação admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/admin/login');
      return;
    }
    
    // Verificar role admin (mock check - adaptar conforme sua estrutura)
    const userRole = (session.user as any)?.role;
    if (userRole !== 'admin') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // Carregar orders
  useEffect(() => {
    if (!session?.user) return;
    
    fetchOrders();
  }, [session, currentPage, statusFilter, emailFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (emailFilter) params.append('email', emailFilter);
      
      const response = await fetch(`/api/admin/orders?${params}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar pedidos');
      }
      
      const data: OrdersResponse = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);
      setError('');
      
    } catch (err) {
      setError('Erro ao carregar pedidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (status === 'loading' || !session) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>Admin - Pedidos — INSANYCK</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="min-h-screen bg-black text-white pt-[120px] pb-20">
        <div className="mx-auto max-w-[1400px] px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold">Pedidos</h1>
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition"
            >
              ← Admin
            </Link>
          </div>

          {/* Filtros */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Buscar por email..."
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Lista de Orders */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-white/60">Nenhum pedido encontrado</div>
          ) : (
            <>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-white/12 bg-black/40 backdrop-blur-md p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">#{order.id.slice(0, 8)}</h3>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="text-white/70 text-sm space-y-1">
                          <div>Email: {order.email}</div>
                          <div>Data: {formatDate(order.createdAt)}</div>
                          {order.stripeSessionId && (
                            <div className="font-mono text-xs">Stripe: {order.stripeSessionId.slice(0, 20)}...</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {formatCurrency(order.amountTotal)}
                        </div>
                        <div className="text-white/60 text-sm">
                          {order.items.reduce((acc, item) => acc + item.qty, 0)} {order.items.length === 1 ? 'item' : 'itens'}
                        </div>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="border-t border-white/10 pt-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                              <Package className="w-6 h-6 text-white/60" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{item.title}</div>
                              <div className="text-xs text-white/60">
                                {item.qty}x {formatCurrency(item.priceCents)}
                              </div>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex items-center justify-center text-white/60 text-sm">
                            +{order.items.length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    disabled={!pagination.hasPrev}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-4 py-2 rounded-xl border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition"
                  >
                    Anterior
                  </button>
                  <span className="text-white/70">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <button
                    disabled={!pagination.hasNext}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-4 py-2 rounded-xl border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}