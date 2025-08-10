// INSANYCK STEP 4
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import "../styles/globals.css";

// ⚠️ Removemos o import de src/lib/i18n.ts (client-only).
// O next-i18next cuida do i18n no servidor e no cliente.
// Se quiser, pode deletar src/lib/i18n.ts depois de validar este passo.

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default appWithTranslation(MyApp);
