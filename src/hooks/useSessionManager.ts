
import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

export const useSessionManager = () => {
  const { session, refreshSession, isSessionExpired, signOut } = useAuth();
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!session) {
      // Clear any existing intervals/timeouts
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = undefined;
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = undefined;
      }
      return;
    }

    const scheduleRefresh = () => {
      if (!session?.expires_at) return;

      const expiresAt = session.expires_at * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // Refresh 5 minutes before expiry, but not less than 1 minute from now
      const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60 * 1000);

      if (refreshTime > 0) {
        refreshTimeoutRef.current = setTimeout(async () => {
          console.log('SessionManager: Auto-refreshing session...');
          
          try {
            const { error } = await refreshSession();
            if (error) {
              console.error('SessionManager: Failed to refresh session:', error);
              await signOut();
            } else {
              console.log('SessionManager: Session refreshed successfully');
            }
          } catch (error) {
            console.error('SessionManager: Session refresh error:', error);
            await signOut();
          }
        }, refreshTime);
      } else if (isSessionExpired()) {
        console.log('SessionManager: Session expired, signing out...');
        signOut();
      }
    };

    // Schedule initial refresh
    scheduleRefresh();

    // Set up periodic check every 5 minutes
    refreshIntervalRef.current = setInterval(() => {
      if (isSessionExpired()) {
        console.log('SessionManager: Session expired during periodic check, signing out...');
        signOut();
      }
    }, 5 * 60 * 1000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [session?.expires_at, refreshSession, isSessionExpired, signOut]);

  return {
    isSessionActive: !!session && !isSessionExpired(),
    sessionExpiresAt: session?.expires_at ? new Date(session.expires_at * 1000) : null,
    accessToken: session?.access_token || null,
  };
};
