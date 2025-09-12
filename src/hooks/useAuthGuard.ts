import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

const PUBLIC_ROUTES = [
  '/auth',
  '/login',
  '/register',
  '/reset-password',
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
    const isPublicRoute = PUBLIC_ROUTES.includes(currentPath) || 
                         currentPath === '/' ||
                         !currentPath.startsWith(PROTECTED_ROUTE_PREFIX);
    const isProtectedRoute = currentPath.startsWith(PROTECTED_ROUTE_PREFIX);

    // If user is not authenticated and trying to access protected route
    if (!user && !session && isProtectedRoute) {
      console.log('useAuthGuard: Redirecting to login - no session for protected route');
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
    if (user && session && (currentPath === '/auth' || currentPath === '/login' || currentPath === '/')) {
      console.log('useAuthGuard: Redirecting authenticated user to dashboard');
      const from = location.state?.from || '/app/dashboard';
      navigate(from, { replace: true });
      return;
    }

    // Check session expiry
    if (session?.expires_at) {
      const expiresAt = new Date(session.expires_at).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // If session is expired or about to expire (within 1 minute)
      if (timeUntilExpiry <= 60000) {
        console.log('useAuthGuard: Session expired or about to expire, redirecting to login');
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