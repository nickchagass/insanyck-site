// INSANYCK FASE G-04.2 — Account Layout com tokens DS (white-label ready)
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
        <h1 className="text-3xl font-semibold tracking-wide text-ds-accent">{t(titleKey as any)}</h1>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Nav lateral */}
          <aside className="rounded-2xl border border-ds-borderSubtle bg-ds-surface shadow-ds-1 p-4">
            <nav className="flex flex-col gap-1">
              {nav.map((item) => {
                const active = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg transition ${
                      active ? "bg-ds-elevated text-ds-accent" : "text-ds-accentSoft hover:text-ds-accent hover:bg-ds-elevated"
                    }`}
                  >
                    {t(item.key as any)}
                  </Link>
                );
              })}
              <form method="post" action="/api/auth/signout" className="mt-4">
                <button
                  className="w-full text-left px-3 py-2 rounded-lg text-ds-accentSoft hover:text-ds-accent hover:bg-ds-elevated transition"
                >
                  {t("account:nav.signout" as any, "Sair")}
                </button>
              </form>
            </nav>
          </aside>

          {/* Conteúdo */}
          <main className="min-h-[420px] rounded-2xl border border-ds-borderSubtle bg-ds-surface shadow-ds-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </section>
  );
}
