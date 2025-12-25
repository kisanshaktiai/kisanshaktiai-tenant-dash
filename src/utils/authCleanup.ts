/**
 * Authentication cleanup utilities
 * Handles clearing of corrupted/stale authentication data
 */

const SUPABASE_PROJECT_REF = 'qfklkkzxemsbeniyugiz';

/**
 * List of all auth-related localStorage keys to clear
 */
const AUTH_STORAGE_KEYS = [
  'supabase.auth.token',
  `sb-${SUPABASE_PROJECT_REF}-auth-token`,
  'sb-auth-token',
  'currentTenantId',
  'selected-tenant',
  'user-preferences',
  'onboarding-state'
];

/**
 * Clear all authentication data from localStorage and sessionStorage
 */
export const clearAuthStorage = (): void => {
  console.log('[AuthCleanup] Clearing all auth storage...');
  
  // Clear specific keys
  AUTH_STORAGE_KEYS.forEach(key => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`[AuthCleanup] Failed to remove ${key}:`, error);
    }
  });

  // Clear all Supabase-related items from localStorage
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.startsWith('supabase'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`[AuthCleanup] Cleared ${keysToRemove.length} Supabase storage items`);
  } catch (error) {
    console.error('[AuthCleanup] Error clearing Supabase storage:', error);
  }
};

/**
 * Check if an error is a stale/invalid refresh token error
 */
export const isRefreshTokenError = (error: any): boolean => {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || '';
  const code = error.code?.toLowerCase() || '';
  
  return (
    code === 'refresh_token_not_found' ||
    message.includes('refresh token not found') ||
    message.includes('invalid refresh token') ||
    message.includes('refresh_token_not_found') ||
    code === 'invalid_grant' ||
    code === 'session_not_found'
  );
};

/**
 * Clear auth storage and redirect to login page
 */
export const clearAuthAndRedirect = (redirectPath = '/auth'): void => {
  console.log('[AuthCleanup] Clearing auth and redirecting to:', redirectPath);
  clearAuthStorage();
  window.location.href = redirectPath;
};

/**
 * Handle authentication errors gracefully
 */
export const handleAuthError = (error: any): void => {
  console.error('[AuthCleanup] Auth error:', error);
  
  if (isRefreshTokenError(error)) {
    console.log('[AuthCleanup] Detected stale refresh token, clearing storage...');
    clearAuthStorage();
  }
};
