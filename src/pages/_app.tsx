// INSANYCK STEP 4 + STEP 8 + HOTFIX
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import dynamic from "next/dynamic";

// importa o CSS global
import "../styles/globals.css";

// INSANYCK STEP 8 — NextAuth Provider
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

// Layout global components
const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });
const MiniCart = dynamic(() => import("@/components/MiniCart"), { ssr: false });

// LayoutShell - envolve todas as páginas com Navbar + MiniCart
function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
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
