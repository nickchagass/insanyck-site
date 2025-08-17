// INSANYCK STEP 8
import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import AccountLayout from "@/components/AccountLayout";
import useSWR from "swr";
import { useTranslation } from "next-i18next";

type Order = {
  id: string;
  status: string;
  amountTotal: number;
  createdAt: string;
  items: { id: string; title: string; qty: number; priceCents: number }[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function OrdersPage() {
  const { t } = useTranslation(["account"]);
  const { data } = useSWR<{ orders: Order[] }>("/api/account/orders", fetcher);
  const orders = data?.orders ?? [];

  return (
    <>
      <Head>
        <title>{t("account:orders.title", "Pedidos")} — INSANYCK</title>
      </Head>
      <AccountLayout titleKey="account:orders.title">
        {orders.length === 0 ? (
          <p className="text-white/70">{t("account:orders.empty", "Você ainda não possui pedidos.")}</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-white/80">
                    <div className="font-medium">#{o.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-white/60 text-sm">{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-white/80">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(o.amountTotal / 100)}
                  </div>
                </div>
                <ul className="mt-3 text-white/70 text-sm list-disc pl-5">
                  {o.items.map((it) => (
                    <li key={it.id}>
                      {it.title} × {it.qty}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
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
