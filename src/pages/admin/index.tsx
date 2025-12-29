// INSANYCK STEP H0 — Admin Console Home Page
// The Black Box — CEO-only dashboard with server-side auth guard

import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isCEO, ADMIN_CONSOLE_META } from "@/lib/admin/constants";
import AdminShell from "@/components/admin/AdminShell";
import DsButton from "@/components/ds/DsButton";

interface AdminHomeProps {
  userEmail: string;
}

export default function AdminHome({ userEmail }: AdminHomeProps) {
  return (
    <>
      <Head>
        <title>{ADMIN_CONSOLE_META.name} · INSANYCK</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell>
        {/* Welcome Section */}
        <div className="space-y-6">
          {/* Greeting */}
          <div className="border-b border-[color:var(--ds-border-subtle)] pb-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome, CEO
            </h2>
            <p className="text-[color:var(--ds-accent-soft)]">
              {userEmail}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-[color:var(--ds-border-subtle)] rounded-[var(--ds-radius-lg)]">
              <div className="text-sm text-[color:var(--ds-accent-soft)] mb-1">
                Console Version
              </div>
              <div className="text-xl font-bold text-white">
                {ADMIN_CONSOLE_META.version}
              </div>
            </div>

            <div className="p-4 border border-[color:var(--ds-border-subtle)] rounded-[var(--ds-radius-lg)]">
              <div className="text-sm text-[color:var(--ds-accent-soft)] mb-1">
                Access Level
              </div>
              <div className="text-xl font-bold text-emerald-400">
                CEO-Only
              </div>
            </div>
          </div>

          {/* Placeholder Content */}
          <div className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Quick Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Placeholder buttons for future features */}
              <DsButton variant="secondary" size="md" disabled>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Pedidos
              </DsButton>

              <DsButton variant="secondary" size="md" disabled>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Produtos
              </DsButton>

              <DsButton variant="secondary" size="md" disabled>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Clientes
              </DsButton>
            </div>

            <div className="pt-4 text-sm text-[color:var(--ds-accent-soft)] italic">
              Museum Edition · Foundation release (H0)
              <br />
              Advanced features coming soon...
            </div>
          </div>
        </div>
      </AdminShell>
    </>
  );
}

/**
 * INSANYCK STEP H0 — Server-side auth guard (defense-in-depth)
 * Layer 2 security: reforça a proteção do middleware
 */
export const getServerSideProps: GetServerSideProps<AdminHomeProps> = async (
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
