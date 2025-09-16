// INSANYCK STEP 4 + STEP 8 + HOTFIX + Lote 4
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import dynamic from "next/dynamic";

// importa o CSS global
import "../styles/globals.css";

// INSANYCK STEP 8 — NextAuth Provider
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

// INSANYCK STEP 4 · Lote 4 — PWA update functionality
import { useServiceWorkerUpdate } from "@/lib/pwa/useServiceWorkerUpdate";
import { UpdateBanner } from "@/components/pwa/UpdateBanner";

// Layout global components
const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });
const MiniCart = dynamic(() => import("@/components/MiniCart"), { ssr: false });

// INSANYCK STEP 4 · Lote 4 — LayoutShell with PWA update functionality
function LayoutShell({ children }: { children: React.ReactNode }) {
  const { hasUpdate, updating, update } = useServiceWorkerUpdate();

  return (
    <>
      {hasUpdate && <UpdateBanner onUpdate={update} updating={updating} />}
      <Navbar />
      {children}
      <MiniCart />
    </>
  );
}

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session | null }>) {
  return (
    <SessionProvider session={session}>
      <LayoutShell>
        <Component {...pageProps} />
      </LayoutShell>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp);
