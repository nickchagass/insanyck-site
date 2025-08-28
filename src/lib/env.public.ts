// src/lib/env.public.ts
// Somente variáveis públicas. Nunca dar throw. Seguro para rodar no client.

const sanitize = (u: string) => u.replace(/\/$/, "");

export const getPublicBaseUrl = (): string => {
  const raw = (process.env.NEXT_PUBLIC_URL || "").trim();
  const valid = raw && /^https?:\/\//i.test(raw) ? raw : "";
  const fallback = process.env.NODE_ENV === "production"
    ? "https://insanyck.com"
    : "http://localhost:3000";
  if (!valid && typeof console !== "undefined" && process.env.NODE_ENV !== "production") {
    // Log único e discreto em dev
    console.warn("[INSANYCK][ENV] NEXT_PUBLIC_URL ausente. Usando fallback:", fallback);
  }
  return sanitize(valid || fallback);
};

export const PUBLIC_URL = getPublicBaseUrl();