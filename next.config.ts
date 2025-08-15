// next.config.ts
// INSANYCK — PWA + i18n + imagens modernas
import withPWA from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { i18n } = require("./next-i18next.config.js");

const isProd = process.env.NODE_ENV === "production";

// Mesmo runtimeCaching que você já usa (mantém Stripe em NetworkOnly)
const runtimeCaching = [
  // HTML: NetworkFirst
  {
    urlPattern: ({ request }: any) => request.mode === "navigate",
    handler: "NetworkFirst",
    options: {
      cacheName: "html",
      networkTimeoutSeconds: 3,
      expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
    },
  },
  // APIs sensíveis (cart/stripe): NetworkOnly
  { urlPattern: /\/api\/(cart|stripe)\//, handler: "NetworkOnly" },
  // Imagens: CacheFirst
  {
    urlPattern: ({ request }: any) => request.destination === "image",
    handler: "CacheFirst",
    options: {
      cacheName: "images",
      expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
    },
  },
  // GLB/Fonts: SWR
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
  i18n,
  images: {
    // Ganho grátis em qualidade/tamanho; não muda seu código
    formats: ["image/avif", "image/webp"],
    remotePatterns: [], // adicione domínios se for exibir imagens externas
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: !isProd,               // PWA só em produção (igual ao seu)
  cacheOnFrontEndNav: true,
  workboxOptions: {
    runtimeCaching,
    navigateFallback: "/offline.html",
  },
})(baseConfig);
