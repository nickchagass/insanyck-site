// INSANYCK STEP 8
// + INSANYCK STEP 9 (bloom sutil no wrapper interno; resto intacto)
import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { createAuthOptions } from "../api/auth/[...nextauth]";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import AccountLayout from "@/components/AccountLayout";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { useTranslation } from "next-i18next";

type Props = {
  user: { name: string | null; email: string | null };
  lastOrders: { id: string; amountTotal: number }[];
};

export default function AccountHome({ user, lastOrders }: Props) {
  const { t } = useTranslation(["account"]);
  return (
    <>
      <Head>
        <title>{t("account:dashboard.title", "Minha conta")} — INSANYCK</title>
      </Head>
      <AccountLayout titleKey="account:dashboard.title">
        {/* INSANYCK STEP 9 — bloom sutil, sem alterar grid/tipografia */}
        <div className="insanyck-bloom insanyck-bloom--edge">
          <div className="space-y-6">
            <p className="text-white/80">
              {t("account:dashboard.hello", "Olá")},{" "}
              <span className="text-white font-medium">
                {user.name ?? user.email ?? ""}
              </span>
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 p-4">
                <div className="text-white/70 text-sm">
                  {t("account:dashboard.lastOrders", "Últimos pedidos")}
                </div>
                {lastOrders.length === 0 ? (
                  <div className="mt-2 text-white/60 text-sm">
                    {t(
                      "account:dashboard.noOrders",
                      "Você ainda não tem pedidos."
                    )}
                  </div>
                ) : (
                  <ul className="mt-2 text-white/80 text-sm">
                    {lastOrders.map((o) => (
                      <li
                        key={o.id}
                        className="flex items-center justify-between py-1"
                      >
                        <span>#{o.id.slice(0, 8).toUpperCase()}</span>
                        <span>
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
                  className="inline-block mt-3 text-white underline underline-offset-4"
                >
                  {t("account:dashboard.viewAll", "Ver todos")}
                </Link>
              </div>

              <div className="rounded-xl border border-white/10 p-4">
                <div className="text-white/70 text-sm">
                  {t("account:dashboard.quick", "Acessos rápidos")}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href="/conta/enderecos"
                    className="px-3 py-2 rounded-lg border border-white/15 text-white/80 hover:text-white hover:bg-white/5"
                  >
                    {t("account:nav.addresses", "Endereços")}
                  </Link>
                  <Link
                    href="/favoritos"
                    className="px-3 py-2 rounded-lg border border-white/15 text-white/80 hover:text-white hover:bg-white/5"
                  >
                    {t("account:nav.wishlist", "Favoritos")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* FIM INSANYCK STEP 9 */}
      </AccountLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const authOptions = await createAuthOptions();
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
