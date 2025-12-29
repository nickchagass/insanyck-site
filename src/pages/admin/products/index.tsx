// INSANYCK STEP H1-05 — Admin Products Page (God View)
// Visual-first catalog with inline stock editing
// CEO-only access with SSR guard + SWR data fetching

import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isCEO, ADMIN_CONSOLE_META } from "@/lib/admin/constants";
import AdminShell from "@/components/admin/AdminShell";
import AdminProductList from "@/components/admin/products/AdminProductList";
import { AdminProductCardData } from "@/components/admin/products/AdminProductCard";
import useSWR from "swr";

interface AdminProductsPageProps {
  userEmail: string;
}

/**
 * INSANYCK H1-05 — Fetcher for SWR
 */
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch products');
  }
  return res.json();
};

/**
 * INSANYCK H1-05 — Admin Products Page (God View)
 * Features:
 * - Visual catalog (large thumbnails)
 * - Inline stock editing (fast, optimistic UI)
 * - Search + filters
 * - Mobile swipe gestures
 * - Museum Edition styling
 */
export default function AdminProductsPage({ userEmail }: AdminProductsPageProps) {
  // INSANYCK H1-05 — Fetch products via SWR (auto-revalidation)
  const { data, error, isLoading, mutate } = useSWR(
    '/api/admin/products?limit=100',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const products: AdminProductCardData[] = data?.products ?? [];

  return (
    <>
      <Head>
        <title>Products · {ADMIN_CONSOLE_META.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell title="Products · Catalog God View" hidePulse>
        {/* Header Actions */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div>
            <h2 className="text-2xl font-bold text-white/95 mb-1">
              Catalog God View
            </h2>
            <p className="text-sm text-white/50">
              Visual inventory management with inline editing
            </p>
          </div>

          {/* Future: Add Product button (H2) */}
          <button
            type="button"
            disabled
            className="
              px-4 py-2
              text-sm font-medium text-white/40
              border border-white/[0.08]
              rounded-[var(--ds-radius-md)]
              cursor-not-allowed
              opacity-50
            "
          >
            + Add Product
          </button>
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
                  Failed to load products
                </h3>
                <p className="text-xs text-rose-400/70">
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Product List */}
        <AdminProductList
          products={products}
          isLoading={isLoading}
          onStockUpdate={() => {
            // Revalidate data after stock update
            mutate();
          }}
        />

        {/* Footer Stats */}
        {!isLoading && !error && products.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/[0.06]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white/90">
                  {products.length}
                </div>
                <div className="text-xs text-white/45 uppercase tracking-wider mt-1">
                  Total Products
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400/90">
                  {products.filter((p) => p.status === "active").length}
                </div>
                <div className="text-xs text-white/45 uppercase tracking-wider mt-1">
                  Active
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-white/50">
                  {products.filter((p) => p.status === "draft").length}
                </div>
                <div className="text-xs text-white/45 uppercase tracking-wider mt-1">
                  Draft
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400/90">
                  {products.filter((p) => {
                    const stock = p.variants.reduce((sum, v) => {
                      if (!v.inventory) return sum;
                      return sum + (v.inventory.quantity - v.inventory.reserved);
                    }, 0);
                    return stock > 0 && stock <= 10;
                  }).length}
                </div>
                <div className="text-xs text-white/45 uppercase tracking-wider mt-1">
                  Low Stock
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminShell>
    </>
  );
}

/**
 * INSANYCK H1-05 — Server-side auth guard (CEO-only)
 * Layer 2 security (defense-in-depth with middleware)
 */
export const getServerSideProps: GetServerSideProps<AdminProductsPageProps> = async (
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
