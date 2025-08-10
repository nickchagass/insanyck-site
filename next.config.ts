// INSANYCK STEP 4
// Mantém o withPWA e adiciona i18n do next-i18next
import withPWA from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { i18n } = require("./next-i18next.config.js");

const isProd = process.env.NODE_ENV === "production";

// Caching do seu Step 3 (mantido)
const runtimeCaching = [
  // HTML/Documentos: NetworkFirst
  {
    urlPattern: ({ request }: any) => request.mode === "navigate",
    handler: "NetworkFirst",
    options: {
      cacheName: "html",
      networkTimeoutSeconds: 3,
      expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
    },
  },
  // APIs internas sensíveis (cart/stripe): NetworkOnly
  {
    urlPattern: /\/api\/(cart|stripe)\//,
    handler: "NetworkOnly",
  },
  // Imagens: CacheFirst (30 dias)
  {
    urlPattern: ({ request }: any) => request.destination === "image",
    handler: "CacheFirst",
    options: {
      cacheName: "images",
      expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
    },
  },
  // GLB/Fontes: StaleWhileRevalidate
  {
    urlPattern: ({ url }: any) => url.pathname.match(/\.(glb|gltf|hdr|bin|woff2?|ttf)$/),
    handler: "StaleWhileRevalidate",
    options: { cacheName: "assets-3d-fonts" },
  },
  // Outros GET: SWR
  {
    urlPattern: ({ request }: any) => request.method === "GET",
    handler: "StaleWhileRevalidate",
    options: { cacheName: "misc" },
  },
];

const baseConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [] },

  // 👉 i18n do next-i18next (mantém Pages Router com prefix /en)
  i18n,
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: !isProd,
  cacheOnFrontEndNav: true,
  workboxOptions: { runtimeCaching, navigateFallback: "/offline.html" },
})(baseConfig);
