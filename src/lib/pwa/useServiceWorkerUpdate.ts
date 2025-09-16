// INSANYCK STEP 4 · Lote 4 — Service Worker update detection hook
import { useEffect, useState } from 'react';

interface ServiceWorkerUpdateState {
  hasUpdate: boolean;
  updating: boolean;
  error: string | null;
}

export function useServiceWorkerUpdate() {
  const [state, setState] = useState<ServiceWorkerUpdateState>({
    hasUpdate: false,
    updating: false,
    error: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    const initServiceWorker = async () => {
      try {
        // Get existing registration or wait for it
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return;

        registration = reg;

        // Check if there's already a waiting service worker
        if (reg.waiting) {
          setState(prev => ({ ...prev, hasUpdate: true }));
          return;
        }

        // Listen for updates
        const handleUpdateFound = () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          const handleStateChange = () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({ ...prev, hasUpdate: true }));
            }
          };

          newWorker.addEventListener('statechange', handleStateChange);
        };

        reg.addEventListener('updatefound', handleUpdateFound);

        // Clean up function
        return () => {
          reg.removeEventListener('updatefound', handleUpdateFound);
        };
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Failed to initialize service worker' 
        }));
      }
    };

    initServiceWorker();
  }, []);

  const update = async () => {
    if (!navigator.serviceWorker || state.updating) return;

    setState(prev => ({ ...prev, updating: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration?.waiting) {
        // Send SKIP_WAITING message to the waiting service worker
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });

        // Listen for controllerchange to reload
        const handleControllerChange = () => {
          window.location.reload();
        };

        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange, { once: true });
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        updating: false,
        error: error instanceof Error ? error.message : 'Failed to update service worker' 
      }));
    }
  };

  return {
    hasUpdate: state.hasUpdate,
    updating: state.updating,
    error: state.error,
    update,
  };
}