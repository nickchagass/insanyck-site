// INSANYCK STEP H2 — Admin Orders with Realtime Updates (Museum Edition)
// SWR-powered auto-refresh (5s) for instant PIX approval reflection
// CEO-only access with SSR guard + Museum Edition styling

import { GetServerSideProps } from "next";
import Head from "next/head";
import { useState, useMemo, useDeferredValue } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isCEO, ADMIN_CONSOLE_META } from "@/lib/admin/constants";
import AdminShell from "@/components/admin/AdminShell";
import useSWR from "swr";
import { Search, Eye, Package } from "lucide-react";

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

interface AdminOrdersPageProps {
  userEmail: string;
}

// INSANYCK STEP H2 — Fetcher for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch orders');
  }
  return res.json();
};

// INSANYCK STEP H2 — Status Badge (Museum Edition)
const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const colors = {
    pending: 'bg-amber-500/10 text-amber-400/90 border-amber-400/20',
    paid: 'bg-emerald-500/10 text-emerald-400/90 border-emerald-400/20',
    shipped: 'bg-blue-500/10 text-blue-400/90 border-blue-400/20',
    delivered: 'bg-emerald-600/10 text-emerald-300/90 border-emerald-600/20',
    cancelled: 'bg-rose-500/10 text-rose-400/90 border-rose-400/20',
  };

  const labels = {
    pending: 'Pendente',
    paid: 'Pago',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${colors[status]}`}>
      {labels[status]}
    </span>
  );
};

/**
 * INSANYCK STEP H2 — Admin Orders Page (Realtime)
 * Features:
 * - SWR with 5s auto-refresh (reflects PIX approvals without manual refresh)
 * - Live indicator (Museum Edition subtle pulse)
 * - Instant client-side filters (status + email search)
 * - Museum Edition styling (glass cards, hairline borders, premium feel)
 * - CEO-only access with allowlist gating
 */
export default function AdminOrdersPage({ userEmail }: AdminOrdersPageProps) {
  // INSANYCK STEP H2 — Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // INSANYCK STEP H2 — Deferred search to avoid jank
  const deferredEmailFilter = useDeferredValue(emailFilter);

  // INSANYCK STEP H2 — Build query params
  const buildQueryParams = () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '10',
    });
    if (statusFilter) params.append('status', statusFilter);
    if (deferredEmailFilter) params.append('email', deferredEmailFilter);
    return params.toString();
  };

  // INSANYCK STEP H2 — SWR with auto-refresh (5s)
  const { data, error, isLoading, isValidating } = useSWR<OrdersResponse>(
    `/api/admin/orders?${buildQueryParams()}`,
    fetcher,
    {
      refreshInterval: 5000, // 5s auto-refresh for realtime PIX updates
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const orders = data?.orders ?? [];
  const pagination = data?.pagination ?? null;

  // INSANYCK STEP H2 — Format helpers
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

  return (
    <>
      <Head>
        <title>Orders · {ADMIN_CONSOLE_META.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell title="Orders · Realtime View" hidePulse>
        {/* Header with Live Indicator */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white/95 mb-1">
                Orders
              </h2>
              <p className="text-sm text-white/50">
                Realtime order tracking with auto-refresh
              </p>
            </div>

            {/* INSANYCK STEP H2 — Live Indicator (Museum Edition subtle) */}
            {isValidating && !isLoading && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-400/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[0.6875rem] text-emerald-400/80 uppercase tracking-wider font-medium">
                  Live
                </span>
              </div>
            )}
          </div>

          <Link
            href="/admin"
            className="
              px-4 py-2
              text-sm font-medium text-white/60
              border border-white/[0.08]
              rounded-[var(--ds-radius-md)]
              hover:border-white/[0.12] hover:text-white/80
              hover:bg-white/[0.03]
              transition-all duration-150
            "
          >
            ← Admin Home
          </Link>
        </div>

        {/* INSANYCK STEP H2 — Filters (Museum Edition) */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Email Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="
                w-full
                pl-10 pr-4 py-2.5
                text-sm text-white/90 placeholder:text-white/40
                bg-black/30
                border border-white/[0.08]
                rounded-[var(--ds-radius-md)]
                backdrop-blur-sm
                transition-all duration-150
                focus:outline-none
                focus:ring-2 focus:ring-white/[0.12]
                focus:border-white/[0.16]
              "
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="
              px-4 py-2.5
              text-sm text-white/90
              bg-black/30
              border border-white/[0.08]
              rounded-[var(--ds-radius-md)]
              backdrop-blur-sm
              transition-all duration-150
              focus:outline-none
              focus:ring-2 focus:ring-white/[0.12]
              focus:border-white/[0.16]
            "
          >
            <option value="">All statuses</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregue</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs text-white/45 mb-4">
          <span>
            {orders.length} {orders.length === 1 ? "order" : "orders"}
            {deferredEmailFilter && ` matching "${deferredEmailFilter}"`}
          </span>
          {isLoading && (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </span>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="glass-card-museum p-6 mb-6 border border-rose-400/30">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-rose-400/90 mb-1">
                  Failed to load orders
                </h3>
                <p className="text-xs text-rose-400/70">
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="skeleton-shimmer rounded-[16px] h-64 border border-white/[0.06]"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-card-museum p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-white/20 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-semibold text-white/70 mb-2">
              No orders found
            </h3>
            <p className="text-sm text-white/45">
              {deferredEmailFilter || statusFilter
                ? "Try adjusting your filters"
                : "Orders will appear here when customers complete checkout"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="glass-card-museum p-6 border border-white/[0.06] hover:border-white/[0.10] transition-all duration-150"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-white/90">
                        #{order.id.slice(0, 8)}
                      </h3>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="text-white/60 text-sm space-y-1">
                      <div>Email: {order.email}</div>
                      <div>Date: {formatDate(order.createdAt)}</div>
                      {order.stripeSessionId && (
                        <div className="font-mono text-xs text-white/45">
                          Stripe: {order.stripeSessionId.slice(0, 20)}...
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white/90">
                      {formatCurrency(order.amountTotal)}
                    </div>
                    <div className="text-white/50 text-sm">
                      {order.items.reduce((acc, item) => acc + item.qty, 0)}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </div>
                  </div>
                </div>

                {/* Items preview */}
                <div className="border-t border-white/[0.06] pt-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                      >
                        <div className="w-12 h-12 rounded-lg bg-black/30 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-white/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white/80 truncate">
                            {item.title}
                          </div>
                          <div className="text-xs text-white/50">
                            {item.qty}x {formatCurrency(item.priceCents)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex items-center justify-center text-white/50 text-sm">
                        +{order.items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="
                      flex items-center gap-2
                      px-3 py-2
                      rounded-xl
                      border border-white/[0.08]
                      hover:border-white/[0.12]
                      hover:bg-white/[0.03]
                      transition-all duration-150
                      text-sm text-white/70
                      hover:text-white/90
                    "
                  >
                    <Eye className="w-4 h-4" />
                    View details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-white/[0.06]">
            <button
              disabled={!pagination.hasPrev}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="
                px-4 py-2
                rounded-xl
                border border-white/[0.08]
                disabled:opacity-50
                disabled:cursor-not-allowed
                hover:bg-white/[0.03]
                hover:border-white/[0.12]
                transition-all duration-150
                text-sm text-white/70
                hover:text-white/90
              "
            >
              Previous
            </button>
            <span className="text-white/60 text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasNext}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="
                px-4 py-2
                rounded-xl
                border border-white/[0.08]
                disabled:opacity-50
                disabled:cursor-not-allowed
                hover:bg-white/[0.03]
                hover:border-white/[0.12]
                transition-all duration-150
                text-sm text-white/70
                hover:text-white/90
              "
            >
              Next
            </button>
          </div>
        )}
      </AdminShell>
    </>
  );
}

/**
 * INSANYCK STEP H2 — Server-side auth guard (CEO-only)
 * Layer 2 security (defense-in-depth with middleware)
 */
export const getServerSideProps: GetServerSideProps<AdminOrdersPageProps> = async (
  context
) => {
  // Get session
  const session = await getServerSession(context.req, context.res, authOptions);

  // Gate 1: Not logged in
  if (!session || !session.user?.email) {
    return {
      redirect: {
        destination: `/conta/login?callbackUrl=${encodeURIComponent(
          context.resolvedUrl
        )}`,
        permanent: false,
      },
    };
  }

  // Gate 2: Not CEO
  if (!isCEO(session.user.email)) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // Authorized
  return {
    props: {
      userEmail: session.user.email,
    },
  };
};
