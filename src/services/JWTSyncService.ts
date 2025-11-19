
import { supabase } from '@/integrations/supabase/client';

/**
 * Singleton service that ensures JWT tokens are fully synchronized
 * before any database queries are executed. This prevents RLS policy failures
 * due to JWT token propagation delays.
 */
class JWTSyncService {
  private isReady: boolean = false;
  private readyPromise: Promise<void> | null = null;
  private listeners: Array<(ready: boolean) => void> = [];

  /**
   * Ensures JWT is ready before proceeding. Returns immediately if already ready,
   * or waits for synchronization to complete.
   */
  async ensureJWTReady(): Promise<void> {
    if (this.isReady) {
      console.log('[JWT-SYNC] Already ready, returning immediately');
      return;
    }

    if (this.readyPromise) {
      console.log('[JWT-SYNC] Sync in progress, waiting for existing promise');
      return this.readyPromise;
    }

    console.log('[JWT-SYNC] Starting JWT synchronization');
    this.readyPromise = this.verifyJWT();
    return this.readyPromise;
  }

  /**
   * Verifies JWT is properly synchronized with retry logic and exponential backoff
   */
  private async verifyJWT(): Promise<void> {
    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        console.log(`[JWT-SYNC] Attempt ${attempt + 1}/${maxRetries}`);

        // Force session refresh to ensure token is current
        const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !sessionData?.session) {
          throw new Error(`Session refresh failed: ${refreshError?.message || 'No session'}`);
        }

        console.log('[JWT-SYNC] Session refreshed successfully');

        // Wait for JWT to propagate (exponential backoff)
        const propagationDelay = Math.min(500 * Math.pow(2, attempt), 3000);
        console.log(`[JWT-SYNC] Waiting ${propagationDelay}ms for JWT propagation`);
        await new Promise(resolve => setTimeout(resolve, propagationDelay));

        // Verify JWT is working by checking auth.uid()
        const { data, error: jwtError } = await supabase.rpc('debug_jwt_status');
        
        if (!jwtError && data?.[0]?.jwt_present && data[0]?.current_user_id) {
          console.log('[JWT-SYNC] JWT verification successful', {
            userId: data[0].current_user_id,
            isExpired: data[0].is_expired
          });
          
          this.isReady = true;
          this.readyPromise = null;
          this.notifyListeners(true);
          return;
        }

        console.warn('[JWT-SYNC] JWT not ready yet', { 
          jwtPresent: data?.[0]?.jwt_present,
          userId: data?.[0]?.current_user_id,
          error: jwtError
        });

        attempt++;
      } catch (error) {
        console.error(`[JWT-SYNC] Attempt ${attempt + 1} failed:`, error);
        attempt++;
        
        if (attempt >= maxRetries) {
          this.readyPromise = null;
          throw new Error(`JWT synchronization failed after ${maxRetries} attempts`);
        }
      }
    }

    this.readyPromise = null;
    throw new Error('JWT synchronization failed - max retries exceeded');
  }

  /**
   * Subscribe to JWT readiness state changes
   */
  subscribe(listener: (ready: boolean) => void): () => void {
    this.listeners.push(listener);
    
    // Immediately notify with current state
    listener(this.isReady);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(ready: boolean) {
    console.log('[JWT-SYNC] Notifying listeners:', { ready, count: this.listeners.length });
    this.listeners.forEach(listener => listener(ready));
  }

  /**
   * Reset state when user logs out
   */
  reset() {
    console.log('[JWT-SYNC] Resetting state');
    this.isReady = false;
    this.readyPromise = null;
    this.notifyListeners(false);
  }

  /**
   * Check if JWT is ready without triggering sync
   */
  isJWTReady(): boolean {
    return this.isReady;
  }
}

export const jwtSyncService = new JWTSyncService();
