// src/middleware.ts
// INSANYCK HOTFIX-001 — Middleware Simplificado (Emergência)
// Este arquivo substitui o middleware anterior que crashava
// Sem dependências externas para garantir funcionamento

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ===== CONFIGURAÇÃO =====
const PUBLIC_AUTH_ROUTES = new Set([
  "/conta/login",
  "/conta/verify",
  "/conta/error",
]);

const WEBHOOK_ROUTES = new Set([
  "/api/stripe/webhook",
  "/api/mp/webhook",
  "/api/mp/notifications",
]);

// ===== MIDDLEWARE SIMPLIFICADO =====
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Log simples para debug (remover em produção estável)
  if (process.env.NODE_ENV === "development") {
    console.log("[INSANYCK MW]", pathname);
  }

  try {
    // ===== SKIP: Webhooks =====
    if (WEBHOOK_ROUTES.has(pathname)) {
      return NextResponse.next();
    }

    // ===== SKIP: Rotas públicas de auth =====
    if (PUBLIC_AUTH_ROUTES.has(pathname)) {
      return NextResponse.next();
    }

    // ===== AUTH CHECK =====
    let token = null;
    try {
      token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
    } catch (authError) {
      // Se auth falhar, permitir acesso (fail-open)
      console.error("[INSANYCK MW] Auth check failed, failing open:", authError);
      return NextResponse.next();
    }

    // ===== PROTEÇÃO: /admin/* =====
    if (pathname.startsWith("/admin")) {
      if (!token) {
        const loginUrl = new URL("/conta/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (token.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // ===== PROTEÇÃO: /conta/* =====
    if (pathname.startsWith("/conta")) {
      if (!token) {
        const loginUrl = new URL("/conta/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // ===== PROTEÇÃO: /checkout/* =====
    if (pathname.startsWith("/checkout")) {
      if (!token) {
        const loginUrl = new URL("/conta/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // ===== PASSOU TODAS AS VERIFICAÇÕES =====
    return NextResponse.next();

  } catch (error) {
    // ===== FAIL-OPEN: Qualquer erro = permitir acesso =====
    console.error("[INSANYCK MW] Unexpected error, failing open:", error);
    return NextResponse.next();
  }
}

// ===== MATCHER =====
export const config = {
  matcher: [
    "/conta/:path*",
    "/checkout/:path*",
    "/admin/:path*",
  ],
};
