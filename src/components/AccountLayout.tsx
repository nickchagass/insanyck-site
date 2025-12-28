// INSANYCK FASE G-04.2 — Account Layout com tokens DS (white-label ready)
// INSANYCK STEP G-EXEC-P1-D — Museum Edition Upgrade
"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import DsGlass from "./ds/DsGlass";

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
        {/* INSANYCK STEP G-EXEC-P1-D — Tipografia editorial */}
        <h1 className="text-3xl font-light tracking-tight text-white/95 mb-1">{t(titleKey as any)}</h1>
        <div className="h-px w-16 bg-gradient-to-r from-white/30 to-transparent mb-8" aria-hidden="true" />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* INSANYCK STEP G-EXEC-P1-D — Sidebar Museum (Ghost Titanium Glass) */}
          <aside className="ins-sidebar p-4">
            <nav className="flex flex-col gap-1">
              {nav.map((item) => {
                const active = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2.5 rounded-lg text-[0.875rem] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] ${
                      active
                        ? "bg-white/[0.08] text-white/95 font-medium border border-white/[0.12]"
                        : "text-white/70 hover:text-white/95 hover:bg-white/[0.04]"
                    }`}
                  >
                    {t(item.key as any)}
                  </Link>
                );
              })}
              {/* Hairline divisor */}
              <div className="my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden="true" />
              <form method="post" action="/api/auth/signout">
                <button
                  className="w-full text-left px-3 py-2.5 rounded-lg text-[0.875rem] text-white/60 hover:text-white/90 hover:bg-white/[0.04] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
                >
                  {t("account:nav.signout" as any, "Sair")}
                </button>
              </form>
            </nav>
          </aside>

          {/* INSANYCK STEP G-EXEC-P1-D — Main content Museum (DsGlass container) */}
          <main>
            <DsGlass tone="ghost" padding="p-6 lg:p-8" className="min-h-[420px]">
              {children}
            </DsGlass>
          </main>
        </div>
      </div>
    </section>
  );
}
