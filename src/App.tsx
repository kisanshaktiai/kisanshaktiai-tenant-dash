
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '@/components/ErrorFallback';
import Loading from '@/components/Loading';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingGuard } from '@/components/guards/OnboardingGuard';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import FarmersPage from '@/pages/farmers/FarmersPage';
import ProductsPage from '@/pages/products/ProductsPage';
import CampaignsPage from '@/pages/CampaignsPage';
import SettingsPage from '@/pages/SettingsPage';
import OnboardingPage from '@/pages/onboarding/OnboardingPage';
import { store } from './store';
import { queryClient } from '@/lib/queryClient';
import { IntlProvider } from '@/components/providers/IntlProvider';

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <IntlProvider>
            <Router>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
                  <Route path="/dashboard" element={<RequireAuth><OnboardingGuard><DashboardLayout /></OnboardingGuard></RequireAuth>}>
                    <Route index element={<Dashboard />} />
                    <Route path="farmers" element={<FarmersPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="campaigns" element={<CampaignsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
                <Toaster />
              </div>
            </Router>
          </IntlProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default App;
