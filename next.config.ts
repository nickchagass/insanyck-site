// INSANYCK STEP 9 — withPWA + i18n (next-i18next) + NetworkOnly para APIs sensíveis
import withPWA from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";
import type { RuntimeCaching } from "workbox-build";

// Reaproveita sua config real do next-i18next (não inline)
const { i18n } = require("./next-i18next.config.js");

const isProd = process.env.NODE_ENV === "production";

const runtimeCaching: RuntimeCaching[] = [
  // HTML
  {
    urlPattern: ({ request }: any) => request.mode === "navigate",
    handler: "NetworkFirst" as const,
    options: {
      cacheName: "html",
      networkTimeoutSeconds: 3,
      expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
    },
  },
  // APIs sensíveis — NetworkOnly
  { urlPattern: /^\/api\/auth\/?.*/i, handler: "NetworkOnly" as const },
  { urlPattern: /^\/api\/account\/?.*/i, handler: "NetworkOnly" as const },
  { urlPattern: /^\/api\/stripe\/?.*/i, handler: "NetworkOnly" as const },
  // INSANYCK STEP 10 — Admin APIs também em NetworkOnly
  { urlPattern: /^\/api\/admin\/?.*/i, handler: "NetworkOnly" as const },

  // Imagens
  {
    urlPattern: ({ request }: any) => request.destination === "image",
    handler: "CacheFirst" as const,
    options: {
      cacheName: "images",
      expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
    },
  },
  // 3D/Fontes
  {
    urlPattern: ({ url }: any) => url.pathname.match(/\.(glb|gltf|hdr|bin|woff2?|ttf)$/),
    handler: "StaleWhileRevalidate" as const,
    options: { cacheName: "assets-3d-fonts" },
  },
  // Outros GET
  {
    urlPattern: ({ request }: any) => request.method === "GET",
    handler: "StaleWhileRevalidate" as const,
    options: { cacheName: "misc" },
  },
];

const baseConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [] },
  i18n,
  // Em desenvolvimento tudo bem ignorar (opcional),
  // em produção NUNCA ignorar erros de TS
  typescript: {
    ignoreBuildErrors: !isProd,
  },
  eslint: {
    // Em desenvolvimento pode ignorar (opcional),
    // em produção NUNCA ignorar erros de ESLint
    ignoreDuringBuilds: !isProd,
  },
  
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "C:/hiberfil.sys",
          "C:/pagefile.sys", 
          "C:/swapfile.sys",
          "C:/DumpStack.log.tmp",
        ],
      };
    }
    return config;
  },

  // INSANYCK STEP C-fix — CSP headers sólidos
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const baseHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          // Em dev adicionamos 'unsafe-eval' para HMR/webpack
          `script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://*.vercel-insights.com${!isProd ? " 'unsafe-eval'" : ""}`,
          "style-src 'self' 'unsafe-inline'",
          // Permitimos https para imagens CDN futuras + data/blob locais
          "img-src 'self' https: data: blob:",
          // APIs: Stripe + Vercel insights; em dev também ws: para HMR
          `connect-src 'self' https://api.stripe.com https://*.vercel-insights.com https://www.google-analytics.com https://www.googletagmanager.com${!isProd ? " ws:" : ""}`,
          // Stripe embeda <iframe>
          "frame-src https://js.stripe.com",
          "font-src 'self' data:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
        ].join("; ")
      }
    ];

    const hsts = isProd
      ? [{ key: "Strict-Transport-Security", value: "max-age=15552000; includeSubDomains; preload" }]
      : [];

    return [
      // Regras específicas para páginas de conta (privacidade)
      {
        source: "/conta/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      { source: "/:path*", headers: [...baseHeaders, ...hsts] }
    ];
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: !isProd,
  cacheOnFrontEndNav: true,
  workboxOptions: { runtimeCaching, navigateFallback: "/offline.html" },
})(baseConfig);
