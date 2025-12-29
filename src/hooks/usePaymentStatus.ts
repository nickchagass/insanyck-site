// INSANYCK STEP F-MP — Hook para polling de status do pagamento MP
import { useState, useEffect, useCallback, useRef } from 'react';

type PaymentStatus = 'idle' | 'pending' | 'in_process' | 'approved' | 'rejected' | 'cancelled' | 'error' | 'timeout';

interface UsePaymentStatusOptions {
  interval?: number;      // ms, default 3000
  maxAttempts?: number;   // default 200 (~10 min)
  onApproved?: () => void;
  onRejected?: () => void;
}

interface UsePaymentStatusReturn {
  status: PaymentStatus;
  isPolling: boolean;
  startPolling: (paymentId: string) => void;
  stopPolling: () => void;
  error: string | null;
}

export function usePaymentStatus(options: UsePaymentStatusOptions = {}): UsePaymentStatusReturn {
  const { interval = 3000, maxAttempts = 200, onApproved, onRejected } = options;

  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentIdRef = useRef<string | null>(null);
  const attemptRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const checkStatus = useCallback(async () => {
    if (!paymentIdRef.current) return;

    try {
      const res = await fetch(`/api/mp/payment-status?paymentId=${paymentIdRef.current}`);

      if (!res.ok) throw new Error('Failed to fetch status');

      const data = await res.json();

      switch (data.status) {
        case 'approved':
          setStatus('approved');
          stopPolling();
          onApproved?.();
          break;
        case 'rejected':
        case 'cancelled':
          setStatus(data.status);
          stopPolling();
          onRejected?.();
          break;
        case 'in_process':
          setStatus('in_process');
          break;
        default:
          setStatus('pending');
      }

      attemptRef.current += 1;

      if (attemptRef.current >= maxAttempts) {
        setStatus('timeout');
        stopPolling();
      }
    } catch (err) {
      // Não para polling em erros transientes
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, [stopPolling, maxAttempts, onApproved, onRejected]);

  const startPolling = useCallback((paymentId: string) => {
    paymentIdRef.current = paymentId;
    attemptRef.current = 0;
    setError(null);
    setStatus('pending');
    setIsPolling(true);

    // Check imediato
    checkStatus();

    // Polling
    intervalRef.current = setInterval(checkStatus, interval);
  }, [checkStatus, interval]);

  // Cleanup
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { status, isPolling, startPolling, stopPolling, error };
}
