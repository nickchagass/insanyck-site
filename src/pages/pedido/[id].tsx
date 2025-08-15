// INSANYCK STEP 7.1 — Pedido com halo sutil
import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export default function Pedido() {
  const { t } = useTranslation(["order"]);
  const { query } = useRouter();
  const id = String(query.id || "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Order",
    orderNumber: id || "mock",
    merchant: { "@type": "Organization", name: "INSANYCK" },
    orderStatus: "https://schema.org/OrderProcessing",
  };

  return (
    <>
      <Head>
        <title>{`${t("order:confirmed", "Pedido confirmado")} — INSANYCK`}</title>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <main className="relative pt-[120px] pb-20 px-6 mx-auto max-w-[1200px] section-halo">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-8 h-16 -z-10"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.0) 70%)",
          }}
        />
        <h1 className="text-white text-3xl font-semibold tracking-wide">
          {t("order:confirmed", "Pedido confirmado")}
        </h1>
        <p className="mt-2 text-white/70">
          {t("order:id", "ID do pedido")}:{" "}
          <span className="text-white/90 font-mono">{id}</span>
        </p>

        <div className="mt-8 space-x-3">
          <Link
            href="/loja"
            className="inline-block rounded-xl px-4 py-2 font-semibold border border-white/15 text-white hover:bg-white/5 transition"
          >
            {t("order:viewStore", "Ver loja")}
          </Link>
          <Link
            href="#"
            className="inline-block rounded-xl px-4 py-2 font-semibold bg-white text-black hover:bg-white/90 transition"
          >
            {t("order:trackOrder", "Acompanhar pedido")}
          </Link>
        </div>
      </main>
    </>
  );
}

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "pt", ["order", "nav", "common"])),
    },
  };
}
