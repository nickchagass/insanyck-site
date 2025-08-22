// INSANYCK STEP 9 — withPWA + i18n (next-i18next) + NetworkOnly para APIs sensíveis
import withPWA from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";
// Reaproveita sua config real do next-i18next (não inline)
const { i18n } = require("./next-i18next.config.js");

const isProd = process.env.NODE_ENV === "production";

const runtimeCaching = [
  // HTML
  {
    urlPattern: ({ request }: any) => request.mode === "navigate",
    handler: "NetworkFirst",
    options: {
      cacheName: "html",
      networkTimeoutSeconds: 3,
      expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
    },
  },
  // APIs sensíveis — NetworkOnly
  { urlPattern: /^\/api\/auth\/?.*/i, handler: "NetworkOnly" },
  { urlPattern: /^\/api\/account\/?.*/i, handler: "NetworkOnly" },
  { urlPattern: /^\/api\/stripe\/?.*/i, handler: "NetworkOnly" },
  // INSANYCK STEP 10 — Admin APIs também em NetworkOnly
  { urlPattern: /^\/api\/admin\/?.*/i, handler: "NetworkOnly" },

  // Imagens
  {
    urlPattern: ({ request }: any) => request.destination === "image",
    handler: "CacheFirst",
    options: {
      cacheName: "images",
      expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
    },
  },
  // 3D/Fontes
  {
    urlPattern: ({ url }: any) => url.pathname.match(/\.(glb|gltf|hdr|bin|woff2?|ttf)$/),
    handler: "StaleWhileRevalidate",
    options: { cacheName: "assets-3d-fonts" },
  },
  // Outros GET
  {
    urlPattern: ({ request }: any) => request.method === "GET",
    handler: "StaleWhileRevalidate",
    options: { cacheName: "misc" },
  },
];

const baseConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [] },
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
