// INSANYCK STEP 8
// + INSANYCK STEP 9 (bloom sutil no wrapper interno; resto intacto)
import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import AccountLayout from "@/components/AccountLayout";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { seoAccount } from "@/lib/seo";

type Props = {
  user: { name: string | null; email: string | null };
  lastOrders: { id: string; amountTotal: number }[];
};

export default function AccountHome({ user, lastOrders }: Props) {
  const { t } = useTranslation(["account"]);
  const router = useRouter();
  const seo = seoAccount(router.locale);

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        {seo.meta.map((tag, i) => (
          <meta key={i} {...tag} />
        ))}
        {seo.link.map((l, i) => (
          <link key={i} {...l} />
        ))}
      </Head>
      <AccountLayout titleKey="account:dashboard.title">
        {/* INSANYCK STEP G-EXEC-P1-D — Museum Edition cards */}
        <div className="space-y-6">
          <p className="text-white/70 text-[0.9375rem]">
            {t("account:dashboard.hello", "Olá")},{" "}
            <span className="text-white/95 font-light">
              {user.name ?? user.email ?? ""}
            </span>
          </p>

          <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
            {/* INSANYCK STEP G-EXEC-P1-D — Panel: Últimos pedidos */}
            <div className="ins-panel p-5">
              <h2 className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-white/50 mb-4">
                {t("account:dashboard.lastOrders", "Últimos pedidos")}
              </h2>
              {lastOrders.length === 0 ? (
                <div className="text-white/60 text-sm">
                  {t(
                    "account:dashboard.noOrders",
                    "Você ainda não tem pedidos."
                  )}
                </div>
              ) : (
                <ul className="space-y-2">
                  {lastOrders.map((o, index) => (
                    <li
                      key={o.id}
                      className={`flex items-center justify-between py-2.5 ${
                        index < lastOrders.length - 1 ? "border-b border-white/[0.06]" : ""
                      }`}
                    >
                      <span className="text-[0.875rem] text-white/70 font-mono">
                        #{o.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-[0.9375rem] text-white/90 tabular-nums">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(o.amountTotal / 100)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/conta/pedidos"
                className="inline-flex items-center gap-2 mt-4 text-[0.875rem] text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] rounded px-1 -ml-1"
              >
                {t("account:dashboard.viewAll", "Ver todos")}
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* INSANYCK STEP G-EXEC-P1-D — Panel: Acessos rápidos */}
            <div className="ins-panel p-5">
              <h2 className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-white/50 mb-4">
                {t("account:dashboard.quick", "Acessos rápidos")}
              </h2>
              <div className="flex flex-col gap-2">
                <Link
                  href="/conta/enderecos"
                  className="px-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-[0.875rem] text-white/80 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
                >
                  {t("account:nav.addresses", "Endereços")}
                </Link>
                <Link
                  href="/favoritos"
                  className="px-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-[0.875rem] text-white/80 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
                >
                  {t("account:nav.wishlist", "Favoritos")}
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* FIM INSANYCK STEP G-EXEC-P1-D */}
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
