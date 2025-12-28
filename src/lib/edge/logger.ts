// src/lib/edge/logger.ts
// INSANYCK AUTH-02 ULTIMATE — Structured Edge Logging
// Edge-compatible, JSON format, ready for Logflare/Axiom

export type LogLevel = "info" | "warn" | "error" | "security";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: "middleware";
  event: string;
  data?: Record<string, unknown>;
  request?: {
    path: string;
    method: string;
    ip?: string;
    userAgent?: string;
    country?: string;
  };
  user?: {
    id?: string;
    role?: string;
  };
  duration?: number;
}

// ===== EDGE LOGGER =====
class EdgeLogger {
  private isDev = process.env.NODE_ENV === "development";

  private formatEntry(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private log(entry: LogEntry): void {
    const formatted = this.formatEntry(entry);

    // Em dev: console colorido
    if (this.isDev) {
      const colors: Record<LogLevel, string> = {
        info: "\x1b[36m",    // Cyan
        warn: "\x1b[33m",    // Yellow
        error: "\x1b[31m",   // Red
        security: "\x1b[35m", // Magenta
      };
      const reset = "\x1b[0m";
      console.log(`${colors[entry.level]}[INSANYCK ${entry.level.toUpperCase()}]${reset}`, entry.event, entry.data || "");
      return;
    }

    // Em prod: JSON estruturado para ingestão
    switch (entry.level) {
      case "error":
      case "security":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }

    // Futuro: enviar para Logflare/Axiom via fetch (fire-and-forget)
    // this.sendToLogflare(entry);
  }

  // ===== MÉTODOS PÚBLICOS =====

  info(event: string, data?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: "info",
      service: "middleware",
      event,
      data,
    });
  }

  warn(event: string, data?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: "warn",
      service: "middleware",
      event,
      data,
    });
  }

  error(event: string, data?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: "error",
      service: "middleware",
      event,
      data,
    });
  }

  security(event: string, request: LogEntry["request"], data?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: "security",
      service: "middleware",
      event,
      request,
      data,
    });
  }

  // Log de acesso completo
  access(
    event: string,
    request: LogEntry["request"],
    user?: LogEntry["user"],
    duration?: number,
    data?: Record<string, unknown>
  ): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: "info",
      service: "middleware",
      event,
      request,
      user,
      duration,
      data,
    });
  }
}

// Singleton
export const logger = new EdgeLogger();
