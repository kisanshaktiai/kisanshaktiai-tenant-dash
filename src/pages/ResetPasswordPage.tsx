import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ResetPasswordPage - Redirects to Central Authentication Service
 * 
 * Password reset is now handled by the Central Auth Service at:
 * https://auth.kisanshaktiai.in/reset-password
 * 
 * This page only exists to handle legacy bookmarks and redirect appropriately.
 */
const ResetPasswordPage = () => {
  useEffect(() => {
    // If there are hash params (recovery tokens), redirect to Central Auth
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      // Redirect to Central Auth Service with the recovery tokens
      window.location.href = `https://auth.kisanshaktiai.in/reset-password${hash}`;
      return;
    }
  }, []);

  // For direct navigation without tokens, redirect to auth page
  return <Navigate to="/auth" replace />;
};

export default ResetPasswordPage;
