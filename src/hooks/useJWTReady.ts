import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/store/hooks';
import { jwtSyncService } from '@/services/JWTSyncService';

/**
 * Optimized hook for JWT synchronization.
 * Immediately ready for unauthenticated users.
 * Does not block authentication flow on failure.
 */
export const useJWTReady = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(!user); // Ready immediately if no user
  const [error, setError] = useState<string | null>(null);
  const syncAttemptedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // No user = immediately ready
    if (!user) {
      setIsReady(true);
      setError(null);
      syncAttemptedRef.current = false;
      return;
    }

    // Only sync once per user session
    if (syncAttemptedRef.current) return;
    syncAttemptedRef.current = true;

    setIsReady(false);
    setError(null);

    // Set a timeout to auto-resolve after 3 seconds
    // JWT sync is optional - we shouldn't block login indefinitely
    timeoutRef.current = setTimeout(() => {
      console.log('[useJWTReady] Timeout reached, marking as ready');
      setIsReady(true);
    }, 3000);

    const ensureReady = async () => {
      try {
        await jwtSyncService.ensureJWTReady();
        setIsReady(true);
        setError(null);
      } catch (err) {
        console.error('[useJWTReady] JWT sync error:', err);
        // Don't set error for refresh token issues - user can still use the app
        const errorMsg = err instanceof Error ? err.message : 'Failed to synchronize';
        
        if (errorMsg.includes('expired') || errorMsg.includes('sign in')) {
          // Session expired - this is expected, mark as ready so user can see auth page
          setIsReady(true);
        } else {
          setError(errorMsg);
          // Still mark as ready after error - don't block the UI
          setIsReady(true);
        }
      }
    };

    ensureReady();

    const unsubscribe = jwtSyncService.subscribe((ready) => {
      setIsReady(ready);
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user?.id]);

  return { isReady, error };
};
