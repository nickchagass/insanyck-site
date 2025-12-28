// src/lib/edge/ratelimit.ts
// INSANYCK AUTH-02 ULTIMATE — Edge Rate Limiting with Upstash
// Sliding window algorithm, sub-millisecond latency

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ===== CONFIGURAÇÕES POR CONTEXTO =====
export const RATE_LIMITS = {
  // Login/Auth: Muito restritivo (anti brute-force)
  auth: {
    requests: 5,
    window: "1 m" as const,  // 5 requests por minuto
    prefix: "ratelimit:auth",
  },
  // API geral: Moderado
  api: {
    requests: 60,
    window: "1 m" as const,  // 60 requests por minuto
    prefix: "ratelimit:api",
  },
  // Páginas: Permissivo
  pages: {
    requests: 100,
    window: "1 m" as const,  // 100 requests por minuto
    prefix: "ratelimit:pages",
  },
} as const;

export type RateLimitContext = keyof typeof RATE_LIMITS;

// ===== CLIENTE REDIS (Lazy Init) =====
let redis: Redis | null = null;
let rateLimiters: Map<RateLimitContext, Ratelimit> | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Dry run mode: não bloqueia, só loga
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

function getRateLimiter(context: RateLimitContext): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  if (!rateLimiters) {
    rateLimiters = new Map();
  }

  if (!rateLimiters.has(context)) {
    const config = RATE_LIMITS[context];
    rateLimiters.set(
      context,
      new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(config.requests, config.window),
        prefix: config.prefix,
        analytics: true, // Métricas no Upstash dashboard
      })
    );
  }

  return rateLimiters.get(context)!;
}

// ===== RESULTADO DO RATE LIMIT =====
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // timestamp em ms
  pending: Promise<unknown>; // para analytics async
  dryRun: boolean; // true se Redis não configurado
}

// ===== FUNÇÃO PRINCIPAL =====
export async function checkRateLimit(
  identifier: string,
  context: RateLimitContext = "api"
): Promise<RateLimitResult> {
  const limiter = getRateLimiter(context);
  const config = RATE_LIMITS[context];

  // Dry run: Redis não configurado
  if (!limiter) {
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
      dryRun: true,
    };
  }

  try {
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      pending: result.pending,
      dryRun: false,
    };
  } catch (error) {
    // Fallback: se Redis falhar, permitir (fail open)
    console.error("[INSANYCK RATELIMIT] Redis error, failing open:", error);

    return {
      success: true,
      limit: config.requests,
      remaining: config.requests,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
      dryRun: true, // Tratando como dry run
    };
  }
}

// ===== HEADERS DE RATE LIMIT =====
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
}
