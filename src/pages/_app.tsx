// INSANYCK STEP 4 + STEP 8 + HOTFIX + Lote 4 + FASE G-02
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

// importa o CSS global
import "../styles/globals.css";

// INSANYCK STEP 8 — NextAuth Provider
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

// INSANYCK STEP 4 · Lote 4 — PWA update functionality
import { useServiceWorkerUpdate } from "@/lib/pwa/useServiceWorkerUpdate";
import { UpdateBanner } from "@/components/pwa/UpdateBanner";

// INSANYCK FASE G-02 PERF-02 — Navbar com SSR para melhorar FCP/LCP
import Navbar from "@/components/Navbar";

// MiniCart permanece lazy (drawer pesado, não crítico para FCP)
const MiniCart = dynamic(() => import("@/components/MiniCart"), { ssr: false });

// INSANYCK FASE G-03.1 UX-10 — Toast Provider de Luxo
import { InsanyckToastProvider } from "@/components/InsanyckToastProvider";

// INSANYCK STEP 4 · Lote 4 — LayoutShell with PWA update functionality
// INSANYCK TITANIUM SHADOW UX — App Background Global (exceto /checkout e /conta/pagamento)
function LayoutShell({ children }: { children: React.ReactNode }) {
  // [DEV] Fix: Bypass hydration issues in development
  const isDev = process.env.NODE_ENV === 'development';

  const { hasUpdate, updating, update } = useServiceWorkerUpdate();

  // INSANYCK STEP 4 · Lote 4 — hide SW banner under test
  const hideUpdateBanner = process.env.INSANYCK_TEST_HIDE_UPDATE_BANNER === '1';

  // INSANYCK TITANIUM SHADOW UX — Aplicar fundo global exceto em /checkout e /conta/pagamento
  const router = useRouter();
  const hideTitaniumBg = router.pathname.startsWith('/checkout') || router.pathname.startsWith('/conta/pagamento');
  const wrapperClass = hideTitaniumBg ? '' : 'app-bg-titanium';

  if (isDev) {
    console.warn('[dev] LayoutShell mounted');
  }

  return (
    <div className={wrapperClass}>
      {hasUpdate && !hideUpdateBanner && <UpdateBanner onUpdate={update} updating={updating} />}
      <Navbar />
      {children}
      <MiniCart />
      {/* INSANYCK FASE G-03.1 UX-10 — Toast container global */}
      <InsanyckToastProvider />
    </div>
  );
}

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session | null }>) {
  // [DEV] Fix: Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.warn('[dev] _app render');
  }

  return (
    <SessionProvider session={session}>
      <LayoutShell>
        <Component {...pageProps} />
      </LayoutShell>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp);
