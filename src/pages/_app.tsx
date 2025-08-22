// INSANYCK STEP 4 + STEP 8
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";

// importa o CSS global
import "../styles/globals.css";

// INSANYCK STEP 8 — NextAuth Provider
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session | null }>) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp);
