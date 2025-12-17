import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/store/hooks';
import { jwtSyncService } from '@/services/JWTSyncService';

/**
 * Optimized hook for JWT synchronization.
 * Immediately ready for unauthenticated users.
 */
export const useJWTReady = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(!user); // Ready immediately if no user
  const [error, setError] = useState<string | null>(null);
  const syncAttemptedRef = useRef(false);

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

    const ensureReady = async () => {
      try {
        await jwtSyncService.ensureJWTReady();
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to synchronize authentication');
        setIsReady(false);
      }
    };

    ensureReady();

    const unsubscribe = jwtSyncService.subscribe(setIsReady);
    return () => unsubscribe();
  }, [user?.id]);

  return { isReady, error };
};
