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

const allowTsErrors = process.env.INSANYCK_ALLOW_TS_ERRORS === "1";
const baseConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [] },
  i18n,
  // Mantém o build fluindo em dev/preview; travamos no CI/produção quando quisermos
  typescript: { ignoreBuildErrors: allowTsErrors || !isProd },
  eslint: { ignoreDuringBuilds: allowTsErrors || !isProd },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: !isProd,
  cacheOnFrontEndNav: true,
  workboxOptions: { runtimeCaching, navigateFallback: "/offline.html" },
})(baseConfig);
