import { supabase } from '@/integrations/supabase/client';
import { store } from '@/store';
import { logout as logoutAction, clearError } from '@/store/slices/authSlice';
import { clearTenantData } from '@/store/slices/tenantSlice';
import { resetOnboarding } from '@/store/slices/onboardingSlice';

interface LogoutOptions {
  redirectTo?: string;
  clearLocalStorage?: boolean;
  showMessage?: boolean;
}

class AuthService {
  private static instance: AuthService;
  private isLogoutInProgress = false;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Enhanced logout with proper cleanup and session management
   */
  async logout(options: LogoutOptions = {}): Promise<{ success: boolean; error?: string }> {
    const {
      redirectTo = '/auth',
      clearLocalStorage = true,
      showMessage = true
    } = options;

    // Prevent multiple simultaneous logout attempts
    if (this.isLogoutInProgress) {
      console.log('AuthService: Logout already in progress');
      return { success: false, error: 'Logout already in progress' };
    }

    this.isLogoutInProgress = true;
    console.log('AuthService: Starting enhanced logout process');

    try {
      // Step 1: Clear Redux state immediately
      store.dispatch(logoutAction());
      store.dispatch(clearTenantData());
      store.dispatch(resetOnboarding());
      store.dispatch(clearError());

      // Step 2: Clear local storage if requested
      if (clearLocalStorage) {
        this.clearAuthDataFromStorage();
      }

      // Step 3: Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthService: Supabase signOut error:', error);
        // Continue with logout even if Supabase returns an error
        // This ensures the user is logged out locally
      }

      // Step 4: Clear any remaining session data
      this.clearSessionCookies();

      // Step 5: Navigate to login page
      if (typeof window !== 'undefined') {
        // Use window.location for a hard redirect to ensure complete state reset
        window.location.href = redirectTo;
      }

      console.log('AuthService: Logout completed successfully');
      return { success: true };
    } catch (error) {
      console.error('AuthService: Logout error:', error);
      
      // Even if there's an error, try to clear local state and redirect
      this.clearAuthDataFromStorage();
      this.clearSessionCookies();
      
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Logout failed' 
      };
    } finally {
      this.isLogoutInProgress = false;
    }
  }

  /**
   * Clear authentication data from local storage
   */
  private clearAuthDataFromStorage(): void {
    const keysToRemove = [
      'supabase.auth.token',
      'sb-qfklkkzxemsbeniyugiz-auth-token',
      'sb-auth-token',
      'tenant-ui-theme',
      'selected-tenant',
      'user-preferences',
      'onboarding-state'
    ];

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove ${key}:`, error);
      }
    });

    // Clear all Supabase related items
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.startsWith('supabase')) {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error(`Failed to remove ${key}:`, error);
        }
      }
    });
  }

  /**
   * Clear session cookies
   */
  private clearSessionCookies(): void {
    if (typeof document !== 'undefined') {
      // Clear cookies by setting them to expire in the past
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Clear cookie for current domain and path
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
      });
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('AuthService: Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('AuthService: Error getting session:', error);
      return null;
    }
  }

  /**
   * Refresh the current session
   */
  async refreshSession() {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('AuthService: Error refreshing session:', error);
      return null;
    }
  }

  /**
   * Set up session expiry monitoring
   */
  monitorSessionExpiry(onExpiry: () => void): () => void {
    let intervalId: NodeJS.Timeout;

    const checkSession = async () => {
      const session = await this.getSession();
      
      if (!session) {
        onExpiry();
        return;
      }

      const expiresAt = new Date(session.expires_at!).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // If session is expired or about to expire (within 5 minutes)
      if (timeUntilExpiry <= 5 * 60 * 1000) {
        // Try to refresh the session
        const refreshedSession = await this.refreshSession();
        
        if (!refreshedSession) {
          onExpiry();
        }
      }
    };

    // Check session every minute
    intervalId = setInterval(checkSession, 60 * 1000);

    // Return cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }
}

export const authService = AuthService.getInstance();