
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from '@/store';
import { queryClient } from '@/lib/queryClient';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useAuth } from '@/hooks/useAuth';
import { useTenantData } from '@/hooks/useTenantData';
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Protected Route Component with proper error handling
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, session, loading, initialized } = useAuth();
  
  // Show loading while auth is being initialized
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to auth if not authenticated
  if (!user || !session) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// App content with tenant data initialization
const AppContent = () => {
  const { user } = useAuth();
  
  // Initialize tenant data if user is authenticated
  if (user) {
    useTenantData();
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BrowserRouter>
              <AppContent />
              <Toaster />
              <Sonner />
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={false} />
          </TooltipProvider>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
