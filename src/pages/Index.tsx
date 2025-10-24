
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, session, loading, initialized } = useAuth();

  // Show loading spinner while checking auth status
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (user && session) {
    return <Navigate to="/app/dashboard" replace />;
  }

  // If not authenticated, redirect to auth page
  return <Navigate to="/auth" replace />;
};

export default Index;
