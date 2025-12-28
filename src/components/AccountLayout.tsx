// src/components/AccountLayout.tsx
// INSANYCK ACCOUNT-MUSEUM-REVOLUTION — Private Viewing Room Layout
// Sidebar Crystal + Museum Atmosphere + i18n Fix

"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  Package,
  Heart,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface AccountLayoutProps {
  children: ReactNode;
  // INSANYCK i18n FIX: Receber título JÁ TRADUZIDO como prop
  // Em vez de passar titleKey e tentar traduzir aqui
  title?: string;
  subtitle?: string;
}

// Navigation items with icons
const navItems = [
  {
    href: '/conta',
    icon: LayoutDashboard,
    labelKey: 'nav.overview',
    exact: true, // Só ativo se path === /conta
  },
  {
    href: '/conta/enderecos',
    icon: MapPin,
    labelKey: 'nav.addresses',
  },
  {
    href: '/conta/pedidos',
    icon: Package,
    labelKey: 'nav.orders',
  },
  {
    href: '/favoritos',
    icon: Heart,
    labelKey: 'nav.wishlist',
  },
];

// Animation variants
const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 20,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 20,
      delay: 0.2,
    },
  },
};

export default function AccountLayout({ children, title, subtitle }: AccountLayoutProps) {
  // INSANYCK HOTFIX: Carregar namespaces 'account', 'nav' e 'common'
  const { t } = useTranslation(['account', 'nav', 'common']);
  const router = useRouter();
  const currentPath = router.pathname;

  // Detectar se é a página exata ou subpágina
  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return currentPath === item.href;
    }
    return currentPath.startsWith(item.href);
  };

  return (
    <div className="museum-atmosphere min-h-screen">
      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32">

        {/* Page Header - Agora recebe título já traduzido */}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-light tracking-tight text-white/95">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/50 mt-2 text-sm">
                {subtitle}
              </p>
            )}
            {/* Decorative line */}
            <div className="h-px w-16 bg-gradient-to-r from-white/30 to-transparent mt-4" aria-hidden="true" />
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">

          {/* === SIDEBAR CRYSTAL === */}
          <motion.aside
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            className="lg:w-64 flex-shrink-0"
          >
            <div className="glass-card-museum p-3 sticky top-28">
              {/* Specular highlight */}
              <div
                className="absolute top-0 left-[10%] right-[10%] h-px rounded-t-[20px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent)'
                }}
                aria-hidden="true"
              />

              <nav className="space-y-1" role="navigation" aria-label="Conta">
                {navItems.map((item) => {
                  const active = isActive(item);
                  const Icon = item.icon;

                  return (
                    <motion.div key={item.href} variants={itemVariants}>
                      <Link
                        href={item.href}
                        prefetch={true}
                        className={`
                          group flex items-center gap-3 px-4 py-3 rounded-xl
                          transition-all duration-150 ease-out
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
                          ${active
                            ? 'bg-white/[0.08] text-white border-l-2 border-white/40 ml-[-2px] pl-[14px]'
                            : 'text-white/60 hover:text-white hover:bg-white/[0.04] hover:translate-x-1'
                          }
                        `}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon
                          size={18}
                          strokeWidth={1.5}
                          className={`
                            transition-all duration-150
                            ${active ? 'text-white' : 'text-white/50 group-hover:text-white/80'}
                          `}
                        />
                        <span className="text-sm font-light tracking-wide">
                          {t(item.labelKey)}
                        </span>
                        {active && (
                          <ChevronRight
                            size={14}
                            className="ml-auto text-white/40"
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Divider */}
                <div className="my-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden="true" />

                {/* Sign Out */}
                <motion.div variants={itemVariants}>
                  <form method="post" action="/api/auth/signout">
                    <button
                      type="submit"
                      className="
                        group flex items-center gap-3 px-4 py-3 rounded-xl w-full
                        text-white/40 hover:text-white/60 hover:bg-white/[0.04]
                        transition-all duration-150 ease-out
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
                        hover:translate-x-1
                      "
                    >
                      <LogOut
                        size={18}
                        strokeWidth={1.5}
                        className="text-white/30 group-hover:text-white/50 transition-colors"
                      />
                      <span className="text-sm">
                        {t('nav.signout', 'Sair')}
                      </span>
                    </button>
                  </form>
                </motion.div>
              </nav>
            </div>
          </motion.aside>

          {/* === MAIN CONTENT === */}
          <motion.main
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 min-w-0"
          >
            {/* Glass card para o conteúdo principal */}
            <div className="glass-card-museum p-6 lg:p-8 min-h-[420px]">
              {/* Specular highlight */}
              <div
                className="absolute top-0 left-[10%] right-[10%] h-px rounded-t-[20px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent)'
                }}
                aria-hidden="true"
              />
              {children}
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
