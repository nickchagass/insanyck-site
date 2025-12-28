// INSANYCK STEP G-EXEC-P1-B — Footer Premium (Museum Glass)
"use client";

import Link from "next/link";
import { useTranslation } from "next-i18next";
import { Instagram, Mail, Youtube } from "lucide-react";
import DsGlass from "./ds/DsGlass";

export default function Footer() {
  const { t } = useTranslation(["common"]);

  const navigationLinks = [
    { href: "/loja", label: t("footer.shop", "Loja") },
    { href: "/colecao", label: t("footer.collection", "Coleção") },
    { href: "/novidades", label: t("footer.news", "Novidades") },
  ];

  const supportLinks = [
    { href: "/contato", label: t("footer.contact", "Contato") },
    { href: "/faq", label: t("footer.faq", "Perguntas Frequentes") },
    { href: "/termos", label: t("footer.terms", "Termos de Uso") },
    { href: "/privacidade", label: t("footer.privacy", "Política de Privacidade") },
  ];

  const socialLinks = [
    { href: "https://instagram.com/insanyck", icon: Instagram, label: "Instagram" },
    { href: "https://youtube.com/@insanyck", icon: Youtube, label: "YouTube" },
    { href: "mailto:contato@insanyck.com", icon: Mail, label: "Email" },
  ];

  return (
    <footer className="relative mt-16 lg:mt-24">
      {/* INSANYCK STEP G-EXEC-P1-B — Museum Glass Container */}
      <DsGlass
        tone="ghost"
        padding="p-8 lg:p-12"
        rounded="rounded-none"
        className="border-t border-white/[0.08] border-x-0 border-b-0"
      >
        {/* Specular hairline superior (sutil, fade-out nas pontas) */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)',
          }}
        />

        <div className="max-w-7xl mx-auto">
          {/* Grid de conteúdo: 3 colunas desktop / stack mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-12">

            {/* COLUNA 1: Navegação */}
            <div>
              <h3 className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-white/60 mb-4">
                {t("footer.navigation", "Navegação")}
              </h3>
              <nav aria-label={t("footer.navigation", "Navegação")}>
                <ul className="space-y-3">
                  {navigationLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[0.875rem] text-white/80 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] rounded px-1 -ml-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* COLUNA 2: Suporte */}
            <div>
              <h3 className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-white/60 mb-4">
                {t("footer.support", "Suporte")}
              </h3>
              <nav aria-label={t("footer.support", "Suporte")}>
                <ul className="space-y-3">
                  {supportLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[0.875rem] text-white/80 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] rounded px-1 -ml-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* COLUNA 3: Newsletter + Social */}
            <div>
              <h3 className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-white/60 mb-4">
                {t("footer.newsletter", "Newsletter")}
              </h3>

              {/* Newsletter form (visual only neste step) */}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mb-6"
                aria-label={t("footer.newsletter", "Newsletter")}
              >
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder={t("footer.newsletterPlaceholder", "Seu e-mail")}
                    disabled
                    className="flex-1 px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/90 text-[0.875rem] placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[color:var(--ds-focus)] focus:border-white/[0.15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t("footer.newsletterPlaceholder", "Seu e-mail")}
                  />
                  <button
                    type="submit"
                    disabled
                    className="px-5 py-2.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] text-white/90 text-[0.875rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("footer.subscribe", "Inscrever")}
                  </button>
                </div>
                <p className="mt-2 text-[0.75rem] text-white/40 italic">
                  {t("footer.newsletterSoon", "Em breve")}
                </p>
              </form>

              {/* Social Icons */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.12] text-white/70 hover:text-white transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
                    >
                      <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Hairline divisor */}
          <div className="border-t border-white/[0.06] mb-6" aria-hidden="true" />

          {/* Copyright bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[0.75rem] text-white/50">
            <p>{t("footer.copyright", "© 2025 INSANYCK. Todos os direitos reservados.")}</p>
            <p className="text-white/40">
              {t("footer.tagline", "Luxo Negro. Zero concessões.")}
            </p>
          </div>
        </div>
      </DsGlass>

      {/* INSANYCK STEP G-EXEC-P1-B — Espaço para MobileNavDock (evita overlap) */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </footer>
  );
}
