// src/middleware.ts
// INSANYCK AUTH-02 ULTIMATE — Enterprise Edge Security Middleware
// Next.js 15 + Vercel Edge + Upstash + NextAuth v4
// Performance target: < 5ms overhead

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { checkRateLimit, getRateLimitHeaders, type RateLimitContext } from "@/lib/edge/ratelimit";
import { getSecurityHeaders } from "@/lib/edge/security-headers";
import { logger } from "@/lib/edge/logger";

// ===== CONFIGURAÇÃO DE ROTAS =====

// Rotas públicas dentro de áreas protegidas
const PUBLIC_AUTH_ROUTES = new Set([
  "/conta/login",
  "/conta/verify",
  "/conta/error",
]);

// Rotas que requerem role admin
const ADMIN_ROUTES_PREFIX = "/admin";

// Rotas com rate limiting agressivo
const AUTH_API_ROUTES = new Set([
  "/api/auth/signin",
  "/api/auth/callback",
  "/api/auth/csrf",
]);

// Rotas de webhook (skip rate limit e auth - têm própria validação)
const WEBHOOK_ROUTES = new Set([
  "/api/stripe/webhook",
  "/api/mp/webhook",
  "/api/mp/notifications",
]);

// ===== HELPERS =====

function getClientIP(request: NextRequest): string {
  // Vercel Edge passa o IP real via header
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function getRequestInfo(request: NextRequest) {
  return {
    path: request.nextUrl.pathname,
    method: request.method,
    ip: getClientIP(request),
    userAgent: request.headers.get("user-agent") || undefined,
    country: request.headers.get("x-vercel-ip-country") || undefined,
  };
}

function getRateLimitContext(pathname: string): RateLimitContext {
  if (AUTH_API_ROUTES.has(pathname) || pathname.startsWith("/api/auth")) {
    return "auth"; // Mais restritivo
  }
  if (pathname.startsWith("/api")) {
    return "api"; // Moderado
  }
  return "pages"; // Permissivo
}

// ===== MIDDLEWARE PRINCIPAL =====

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;
  const requestInfo = getRequestInfo(request);

  // ===== SKIP: Webhooks (têm própria validação de assinatura) =====
  if (WEBHOOK_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  // ===== RATE LIMITING =====
  const rateLimitContext = getRateLimitContext(pathname);
  const clientIP = getClientIP(request);
  const rateLimitKey = `${rateLimitContext}:${clientIP}`;

  const rateLimit = await checkRateLimit(rateLimitKey, rateLimitContext);

  if (!rateLimit.success) {
    // Rate limit exceeded
    logger.security("rate_limit_exceeded", requestInfo, {
      context: rateLimitContext,
      limit: rateLimit.limit,
      reset: rateLimit.reset,
    });

    return new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...getRateLimitHeaders(rateLimit),
          "Retry-After": Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // ===== SKIP: Rotas públicas de auth =====
  if (PUBLIC_AUTH_ROUTES.has(pathname)) {
    const response = NextResponse.next();

    // Aplicar security headers mesmo em rotas públicas
    const securityHeaders = getSecurityHeaders(pathname);
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });

    // Rate limit headers
    Object.entries(getRateLimitHeaders(rateLimit)).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });

    return response;
  }

  // ===== AUTH CHECK =====
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ===== PROTEÇÃO: /admin/* =====
  if (pathname.startsWith(ADMIN_ROUTES_PREFIX)) {
    if (!token) {
      logger.security("unauthorized_admin_access", requestInfo, {
        reason: "no_token",
      });

      const loginUrl = new URL("/conta/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      loginUrl.searchParams.set("error", "SessionRequired");
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== "admin") {
      logger.security("forbidden_admin_access", requestInfo, {
        reason: "insufficient_role",
        userRole: token.role,
        userId: token.id,
      });

      // Não revelar que /admin existe - redirect para home
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }

    // Admin autorizado
    logger.access("admin_access", requestInfo, {
      id: token.id as string,
      role: token.role as string,
    }, Date.now() - startTime);
  }

  // ===== PROTEÇÃO: /conta/* =====
  if (pathname.startsWith("/conta")) {
    if (!token) {
      logger.security("unauthorized_account_access", requestInfo, {
        reason: "no_token",
      });

      const loginUrl = new URL("/conta/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Usuário autenticado
    logger.access("account_access", requestInfo, {
      id: token.id as string,
      role: token.role as string,
    }, Date.now() - startTime);
  }

  // ===== PROTEÇÃO: /checkout/* =====
  if (pathname.startsWith("/checkout")) {
    if (!token) {
      logger.security("unauthorized_checkout_access", requestInfo, {
        reason: "no_token",
      });

      const loginUrl = new URL("/conta/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Usuário autenticado
    logger.access("checkout_access", requestInfo, {
      id: token.id as string,
      role: token.role as string,
    }, Date.now() - startTime);
  }

  // ===== RESPOSTA FINAL =====
  const response = NextResponse.next();

  // Aplicar security headers
  const securityHeaders = getSecurityHeaders(pathname);
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value as string);
  });

  // Rate limit headers
  Object.entries(getRateLimitHeaders(rateLimit)).forEach(([key, value]) => {
    response.headers.set(key, value as string);
  });

  // Performance header (para debugging)
  response.headers.set("X-Middleware-Duration", `${Date.now() - startTime}ms`);

  return response;
}

// ===== MATCHER OTIMIZADO =====
// Só executa middleware nas rotas necessárias
// NÃO executa em: assets, _next, favicon, robots, sitemap

export const config = {
  matcher: [
    /*
     * Match:
     * - /conta/* (account area)
     * - /checkout/* (purchase flow)
     * - /admin/* (admin panel)
     * - /api/auth/* (auth endpoints - rate limit)
     *
     * Skip:
     * - /_next/* (Next.js internals)
     * - /api/stripe/webhook (has own validation)
     * - /api/mp/* webhooks (has own validation)
     * - Static files (images, fonts, etc.)
     */
    "/conta/:path*",
    "/checkout/:path*",
    "/admin/:path*",
    "/api/auth/:path*",
  ],
};
