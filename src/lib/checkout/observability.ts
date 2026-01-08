// INSANYCK PAYMENTS-P0 — Checkout Observability
// ==============================================
// Dev-only logging for debugging payment flows.
// CRITICAL: NO PII (emails, names, tokens) in logs.
// Production: All logging is no-op (zero console output).

/**
 * Checkout event types for observability.
 */
export type CheckoutEventType =
  | 'request_received'
  | 'provider_selected'
  | 'flow_started'
  | 'flow_completed'
  | 'flow_error'
  | 'fallback_triggered';

/**
 * Flow identifiers for logging.
 */
export type CheckoutFlow = 'stripe' | 'mp_pix' | 'mp_card' | 'mp_bricks';

/**
 * Provider identifiers.
 */
export type CheckoutProvider = 'stripe' | 'mercadopago';

/**
 * Checkout event payload (NO PII).
 */
export interface CheckoutEvent {
  type: CheckoutEventType;
  requestId: string;
  provider?: CheckoutProvider;
  flow?: CheckoutFlow;
  status?: string;
  errorCode?: string;
  durationMs?: number;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Generate short request ID for tracing.
 * 8-char alphanumeric for human readability.
 */
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Log checkout event (dev-only).
 * In production, this is a no-op.
 */
export function logCheckoutEvent(event: CheckoutEvent): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = `[INSANYCK-CHECKOUT][${event.requestId}]`;

  console.log(`${prefix} ${event.type}`, {
    ...event,
    timestamp,
  });
}

/**
 * Create a scoped logger for a specific request.
 * All methods are no-op in production.
 */
export function createCheckoutLogger(requestId: string) {
  return {
    /**
     * Log a checkout event.
     */
    log: (type: CheckoutEventType, data?: Partial<Omit<CheckoutEvent, 'type' | 'requestId'>>) => {
      logCheckoutEvent({ type, requestId, ...data });
    },

    /**
     * Mark flow start and return timestamp for duration calculation.
     */
    start: (provider: CheckoutProvider, flow: CheckoutFlow): number => {
      logCheckoutEvent({ type: 'flow_started', requestId, provider, flow });
      return Date.now();
    },

    /**
     * Mark flow success with duration.
     */
    success: (flow: CheckoutFlow, startTime: number) => {
      logCheckoutEvent({
        type: 'flow_completed',
        requestId,
        flow,
        status: 'success',
        durationMs: Date.now() - startTime,
      });
    },

    /**
     * Mark flow error with error code (NO PII).
     */
    error: (flow: CheckoutFlow, errorCode: string, startTime?: number) => {
      logCheckoutEvent({
        type: 'flow_error',
        requestId,
        flow,
        status: 'error',
        errorCode,
        durationMs: startTime ? Date.now() - startTime : undefined,
      });
    },
  };
}

/**
 * Type for the scoped logger.
 */
export type CheckoutLogger = ReturnType<typeof createCheckoutLogger>;
