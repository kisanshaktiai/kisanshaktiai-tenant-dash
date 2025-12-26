import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

const PUBLIC_ROUTES = [
  '/auth',
  '/login',
  '/register',
  '/setup-password',
  '/accept-invitation',
  '/'
];

const PROTECTED_ROUTE_PREFIX = '/app';

export const useAuthGuard = () => {
  const { user, session, initialized, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for auth to initialize
    if (!initialized || loading) {
      return;
    }

    const currentPath = location.pathname;
    const isProtectedRoute = currentPath.startsWith(PROTECTED_ROUTE_PREFIX);

    // If user is not authenticated and trying to access protected route
    if (!user && !session && isProtectedRoute) {
      if (import.meta.env.DEV) {
        console.log('[AuthGuard] No session for protected route, redirecting to /auth');
      }
      navigate('/auth', { 
        replace: true,
        state: { 
          from: currentPath,
          message: 'Please sign in to continue' 
        }
      });
      return;
    }

    // If user is authenticated and on auth/login page, redirect to dashboard
    if (user && session && (currentPath === '/auth' || currentPath === '/login')) {
      if (import.meta.env.DEV) {
        console.log('[AuthGuard] Authenticated user on auth page, redirecting to dashboard');
      }
      const from = location.state?.from;
      // Only use 'from' if it's a valid protected route
      const target = from && from.startsWith('/app') ? from : '/app/dashboard';
      navigate(target, { replace: true });
      return;
    }

    // Check session expiry for protected routes only
    if (session?.expires_at && isProtectedRoute) {
      const expiresAt = typeof session.expires_at === 'number' 
        ? session.expires_at * 1000 
        : new Date(session.expires_at).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // If session is expired or about to expire (within 1 minute)
      if (timeUntilExpiry <= 60000) {
        if (import.meta.env.DEV) {
          console.log('[AuthGuard] Session expired, redirecting to /auth');
        }
        navigate('/auth', { 
          replace: true,
          state: { message: 'Your session has expired. Please sign in again.' }
        });
      }
    }
  }, [user, session, initialized, loading, navigate, location]);

  return {
    isAuthenticated: !!user && !!session,
    isLoading: loading || !initialized,
    user,
    session
  };
};