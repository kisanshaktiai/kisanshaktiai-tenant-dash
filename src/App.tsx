
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '@/components/ErrorFallback';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { IntlProvider } from '@/components/providers/IntlProvider';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingGuard } from '@/components/guards/OnboardingGuard';
import { EnhancedDashboardLayout } from '@/components/layout/EnhancedDashboardLayout';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import FarmersPage from '@/pages/farmers/FarmersPage';
import DealersPage from '@/pages/dealers/DealersPage';
import ProductsPage from '@/pages/products/ProductsPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import CampaignsPage from '@/pages/CampaignsPage';
import SettingsPage from '@/pages/SettingsPage';
import IntegrationsPage from '@/pages/integrations/IntegrationsPage';
import SubscriptionPage from '@/pages/subscription/SubscriptionPage';
import OnboardingPage from '@/pages/onboarding/OnboardingPage';
import NotFound from '@/pages/NotFound';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import PasswordSetupPage from '@/pages/invitation/PasswordSetupPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('401')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, loading, initialized } = useAuth();

  // Show loading while auth is initializing
  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <IntlProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/setup-password" element={<PasswordSetupPage />} />

                {/* Protected routes - wrapped with RequireAuth first, then OnboardingGuard */}
                <Route path="/dashboard" element={
                  <RequireAuth>
                    <OnboardingGuard>
                      <EnhancedDashboardLayout />
                    </OnboardingGuard>
                  </RequireAuth>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="farmers" element={<FarmersPage />} />
                  <Route path="dealers" element={<DealersPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="campaigns" element={<CampaignsPage />} />
                  <Route path="integrations" element={<IntegrationsPage />} />
                  <Route path="subscription" element={<SubscriptionPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Onboarding route - only requires authentication, not onboarding completion */}
                <Route path="/onboarding" element={
                  <RequireAuth>
                    <OnboardingPage />
                  </RequireAuth>
                } />

                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </IntlProvider>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
