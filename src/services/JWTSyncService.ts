import { supabase } from '@/integrations/supabase/client';
import { isRefreshTokenError, clearAuthStorage } from '@/utils/authCleanup';

/**
 * Optimized JWT synchronization service.
 * Ensures JWT tokens are ready before database queries.
 * Handles stale token errors gracefully.
 */
class JWTSyncService {
  private isReady = false;
  private readyPromise: Promise<void> | null = null;
  private listeners: Array<(ready: boolean) => void> = [];

  async ensureJWTReady(): Promise<void> {
    if (this.isReady) return;
    if (this.readyPromise) return this.readyPromise;

    this.readyPromise = this.verifyJWT();
    return this.readyPromise;
  }

  private async verifyJWT(): Promise<void> {
    const maxRetries = 2;
    const isDev = import.meta.env.DEV;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // First check if we have a valid session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          if (isRefreshTokenError(sessionError)) {
            clearAuthStorage();
            throw new Error('Session expired - please sign in again');
          }
          throw sessionError;
        }

        // No session means user needs to sign in
        if (!sessionData?.session) {
          this.isReady = false;
          this.readyPromise = null;
          return;
        }

        // Try to refresh only if we have an existing session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          if (isRefreshTokenError(refreshError)) {
            clearAuthStorage();
            throw new Error('Session expired - please sign in again');
          }
          // If refresh fails but we have a session, continue with existing session
        }

        // Minimal propagation delay - only on retry
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, 200 * attempt));
        }

        // Quick verification using session check instead of RPC
        const currentSession = refreshData?.session || sessionData?.session;
        if (currentSession?.user?.id) {
          if (isDev) console.log('[JWTSync] JWT verified');
          this.isReady = true;
          this.readyPromise = null;
          this.notifyListeners(true);
          return;
        }
        
      } catch (error: any) {
        if (isRefreshTokenError(error)) {
          clearAuthStorage();
          this.readyPromise = null;
          throw new Error('Session expired - please sign in again');
        }
        
        if (attempt >= maxRetries - 1) {
          this.readyPromise = null;
          throw new Error('JWT synchronization failed');
        }
      }
    }

    this.readyPromise = null;
    throw new Error('JWT synchronization failed');
  }

  subscribe(listener: (ready: boolean) => void): () => void {
    this.listeners.push(listener);
    listener(this.isReady);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(ready: boolean) {
    this.listeners.forEach(listener => listener(ready));
  }

  reset() {
    this.isReady = false;
    this.readyPromise = null;
    this.notifyListeners(false);
  }

  isJWTReady(): boolean {
    return this.isReady;
  }
}

export const jwtSyncService = new JWTSyncService();
