// INSANYCK STEP 8
"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

type Props = {
  titleKey: string; // i18n key ex: "account:dashboard.title"
  children: React.ReactNode;
};

export default function AccountLayout({ titleKey, children }: Props) {
  const { t } = useTranslation(["account"]);
  const router = useRouter();

  const nav = [
    { href: "/conta", key: "account:nav.overview" },
    { href: "/conta/enderecos", key: "account:nav.addresses" },
    { href: "/conta/pedidos", key: "account:nav.orders" },
    { href: "/favoritos", key: "account:nav.wishlist" },
  ];

  return (
    <section className="pt-[100px] pb-16">
      <div className="mx-auto max-w-[1200px] px-6">
        <h1 className="text-3xl font-semibold tracking-wide text-white/90">{t(titleKey)}</h1>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Nav lateral */}
          <aside className="rounded-2xl border border-white/10 bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-4">
            <nav className="flex flex-col gap-1">
              {nav.map((item) => {
                const active = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg transition ${
                      active ? "bg-white/10 text-white" : "text-white/80 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
              <form method="post" action="/api/auth/signout" className="mt-4">
                <button
                  className="w-full text-left px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition"
                >
                  {t("account:nav.signout", "Sair")}
                </button>
              </form>
            </nav>
          </aside>

          {/* Conteúdo */}
          <main className="min-h-[420px] rounded-2xl border border-white/10 bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-6">
            {children}
          </main>
        </div>
      </div>
    </section>
  );
}
