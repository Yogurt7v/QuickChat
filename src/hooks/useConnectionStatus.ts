import { useState, useEffect, useCallback, useRef } from 'react';

type ConnectionState = 'loading' | 'online' | 'offline' | 'error';

const TIMEOUT_MS = 5000;

export function useConnectionStatus() {
  const [state, setState] = useState<ConnectionState>('loading');
  const [lastOnline, setLastOnline] = useState<Date | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkConnection = useCallback(() => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    if (isOnline) {
      setState('online');
      setLastOnline(new Date());
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      setState('offline');
      timeoutRef.current = setTimeout(() => {
        setState('error');
      }, TIMEOUT_MS);
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (typeof window !== 'undefined') {
      const handleOnline = () => checkConnection();
      const handleOffline = () => checkConnection();

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    const interval = setInterval(checkConnection, 3000);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [checkConnection]);

  return {
    state,
    lastOnline,
    retry: () => {
      setState('loading');
      window.location.reload();
    },
  };
}