// src/pages/conta/index.tsx
// INSANYCK ACCOUNT-MUSEUM-REVOLUTION — Dashboard Museum Edition

import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, MapPin, Heart, ChevronRight, Sparkles } from "lucide-react";

import AccountLayout from "@/components/AccountLayout";
import { prisma } from "@/lib/prisma";
import { seoAccount } from "@/lib/seo";

type Props = {
  user: { name: string | null; email: string | null };
  lastOrders: { id: string; amountTotal: number }[];
};

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 20,
      delay: i * 0.1,
    },
  }),
};

export default function AccountHome({ user, lastOrders }: Props) {
  // INSANYCK i18n FIX: Carregar namespaces corretos
  const { t } = useTranslation(['account', 'common']);
  const router = useRouter();
  const seo = seoAccount(router.locale);

  const firstName = user.name?.split(' ')[0] || user.email?.split('@')[0] || '';

  // INSANYCK i18n FIX: Traduzir o título AQUI e passar como prop
  const pageTitle = t('dashboard.title', 'Minha conta');

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        {seo.meta.map((tag, i) => (
          <meta key={i} {...tag} />
        ))}
      </Head>

      {/* INSANYCK i18n FIX: Passar título já traduzido */}
      <AccountLayout title={pageTitle}>
        <div className="space-y-6">

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 pb-6 border-b border-white/[0.06]"
          >
            <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
              <span className="text-xl text-white/80">
                {firstName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white/50 text-sm">
                {t('dashboard.hello', 'Olá')},
              </p>
              <p className="text-white/90 font-medium text-lg">
                {firstName}
              </p>
            </div>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">

            {/* === ÚLTIMOS PEDIDOS === */}
            <motion.div
              custom={0}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="ins-panel p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-white/40" strokeWidth={1.5} />
                <h2 className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-white/50">
                  {t('dashboard.lastOrders', 'Últimos pedidos')}
                </h2>
              </div>

              {lastOrders.length === 0 ? (
                <p className="text-white/50 text-sm">
                  {t('dashboard.noOrders', 'Você ainda não tem pedidos.')}
                </p>
              ) : (
                <ul className="space-y-2">
                  {lastOrders.map((order, index) => (
                    <li
                      key={order.id}
                      className={`
                        flex items-center justify-between py-2.5
                        ${index < lastOrders.length - 1 ? 'border-b border-white/[0.06]' : ''}
                      `}
                    >
                      <span className="text-[0.875rem] text-white/70 font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-[0.9375rem] text-white/90 tabular-nums">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(order.amountTotal / 100)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href="/conta/pedidos"
                className="
                  inline-flex items-center gap-2 mt-4
                  text-[0.875rem] text-white/60 hover:text-white
                  transition-all duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded px-1 -ml-1
                "
              >
                {t('dashboard.viewAll', 'Ver todos')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* === ACESSOS RÁPIDOS === */}
            <motion.div
              custom={1}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="ins-panel p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-white/40" strokeWidth={1.5} />
                <h2 className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-white/50">
                  {t('dashboard.quick', 'Acessos rápidos')}
                </h2>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/conta/enderecos"
                  className="
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    border border-white/[0.08] bg-white/[0.02]
                    text-[0.875rem] text-white/80
                    hover:text-white hover:bg-white/[0.05] hover:border-white/[0.12]
                    transition-all duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
                  "
                >
                  <MapPin className="w-4 h-4 text-white/50" strokeWidth={1.5} />
                  {t('nav.addresses', 'Endereços')}
                </Link>

                <Link
                  href="/favoritos"
                  className="
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    border border-white/[0.08] bg-white/[0.02]
                    text-[0.875rem] text-white/80
                    hover:text-white hover:bg-white/[0.05] hover:border-white/[0.12]
                    transition-all duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
                  "
                >
                  <Heart className="w-4 h-4 text-white/50" strokeWidth={1.5} />
                  {t('nav.wishlist', 'Favoritos')}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </AccountLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!session?.user?.id) {
    return {
      redirect: { destination: "/conta/login", permanent: false },
      props: {} as any,
    };
  }

  const lastOrders = await prisma.order.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, amountTotal: true },
  });

  return {
    props: {
      // INSANYCK i18n FIX: Garantir que "account" está nos namespaces
      ...(await serverSideTranslations(ctx.locale ?? "pt", [
        "common",
        "nav",
        "account",
      ])),
      user: {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
      },
      lastOrders,
    },
  };
};
