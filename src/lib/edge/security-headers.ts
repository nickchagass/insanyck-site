// src/lib/edge/security-headers.ts
// INSANYCK AUTH-02 ULTIMATE — OWASP Security Headers
// Referência: https://owasp.org/www-project-secure-headers/

export const SECURITY_HEADERS: Record<string, string> = {
  // Previne clickjacking
  "X-Frame-Options": "DENY",

  // Previne MIME sniffing
  "X-Content-Type-Options": "nosniff",

  // Habilita filtro XSS do browser (legacy, mas não custa)
  "X-XSS-Protection": "1; mode=block",

  // Controla referrer em navegação
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // DNS prefetch control
  "X-DNS-Prefetch-Control": "on",

  // Permissions Policy (antigo Feature-Policy)
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()", // Bloqueia FLoC
  ].join(", "),

  // HSTS - Força HTTPS (ativar em produção)
  // "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

// CSP mais restritivo para admin
export const ADMIN_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js precisa
  "style-src 'self' 'unsafe-inline'", // Tailwind inline
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://api.stripe.com https://*.upstash.io",
  "frame-ancestors 'none'",
].join("; ");

// CSP padrão (mais permissivo para e-commerce)
export const DEFAULT_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://api.stripe.com https://*.upstash.io https://www.google-analytics.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "frame-ancestors 'self'",
].join("; ");

// Função para aplicar headers baseado na rota
export function getSecurityHeaders(pathname: string): HeadersInit {
  const headers: Record<string, string> = { ...SECURITY_HEADERS };

  // CSP específico para admin
  if (pathname.startsWith("/admin")) {
    headers["Content-Security-Policy"] = ADMIN_CSP;
  } else {
    headers["Content-Security-Policy"] = DEFAULT_CSP;
  }

  // HSTS apenas em produção
  if (process.env.NODE_ENV === "production") {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }

  return headers;
}
