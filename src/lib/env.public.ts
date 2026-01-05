// src/lib/env.public.ts
// INSANYCK HOTFIX VAULT-PROD-01 — Somente variáveis públicas. Nunca dar throw. Seguro para rodar no client.

const sanitize = (u: string) => u.replace(/\/$/, "");

export const getPublicBaseUrl = (): string => {
  // INSANYCK HOTFIX VAULT-PROD-01 — Canonical env contract
  // Priority 1: NEXT_PUBLIC_SITE_URL (canonical, used by checkout/webhooks)
  // Priority 2: NEXT_PUBLIC_URL (legacy fallback)
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  const legacyUrl = (process.env.NEXT_PUBLIC_URL || "").trim();
  const raw = siteUrl || legacyUrl;

  const valid = raw && /^https?:\/\//i.test(raw) ? raw : "";
  const fallback = process.env.NODE_ENV === "production"
    ? "https://insanyck.com"
    : "http://localhost:3000";

  if (!valid && typeof console !== "undefined" && process.env.NODE_ENV !== "production") {
    // Log único e discreto em dev
    console.warn(
      "[INSANYCK][ENV] NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_URL both absent. Using fallback:",
      fallback
    );
  }

  return sanitize(valid || fallback);
};

export const PUBLIC_URL = getPublicBaseUrl();