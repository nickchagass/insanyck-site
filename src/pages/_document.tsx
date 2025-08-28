// INSANYCK STEP 4
import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    // Locale resolvido pelo Next (Pages Router) em SSR
    const currentLocale = (this.props as any).__NEXT_DATA__?.locale || "pt";
    const pagePath = (this.props as any).__NEXT_DATA__?.page || "/";
    const ogLocale = currentLocale === "pt" ? "pt_BR" : "en_US";

    // Helpers simples para alternates (prefix /en para inglês)
    const hrefPt = pagePath === "/" ? "/" : pagePath;
    const hrefEn = pagePath === "/" ? "/en" : `/en${pagePath}`;

    return (
      <Html lang={currentLocale}>
        <Head>
          {/* DNS prefetch control */}
          <meta httpEquiv="x-dns-prefetch-control" content="on" />
          
          {/* Resource hints for Google Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="dns-prefetch" href="//fonts.googleapis.com" />
          <link rel="dns-prefetch" href="//fonts.gstatic.com" />

          {/* OG locale por idioma */}
          <meta property="og:locale" content={ogLocale} />

          {/* Alternates hreflang */}
          <link rel="alternate" hrefLang="pt" href={hrefPt} />
          <link rel="alternate" hrefLang="en" href={hrefEn} />
          <link rel="alternate" hrefLang="x-default" href={hrefPt} />

          {/* Mantém PWA funcionando */}
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#000000" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
