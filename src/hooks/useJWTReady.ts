
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { jwtSyncService } from '@/services/JWTSyncService';

/**
 * Hook that blocks component rendering until JWT is fully synchronized.
 * This prevents database queries from failing due to JWT propagation delays.
 * 
 * @returns {Object} - { isReady: boolean, error: string | null }
 */
export const useJWTReady = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // No user = no need to wait for JWT
    if (!user) {
      console.log('[useJWTReady] No user, marking as ready');
      setIsReady(true);
      setError(null);
      return;
    }

    console.log('[useJWTReady] User detected, ensuring JWT is ready');
    setIsReady(false);
    setError(null);

    const ensureReady = async () => {
      try {
        await jwtSyncService.ensureJWTReady();
        console.log('[useJWTReady] JWT is ready');
        setIsReady(true);
        setError(null);
      } catch (err) {
        console.error('[useJWTReady] JWT synchronization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to synchronize authentication');
        setIsReady(false);
      }
    };

    ensureReady();

    // Subscribe to JWT state changes
    const unsubscribe = jwtSyncService.subscribe((ready) => {
      console.log('[useJWTReady] JWT state changed:', ready);
      setIsReady(ready);
      if (!ready) {
        setError(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  return { isReady, error };
};
