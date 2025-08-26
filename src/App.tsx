
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import TenantSetupPage from '@/pages/TenantSetupPage';
import { IntlProvider } from './components/providers/IntlProvider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { optimizedQueryClient } from '@/lib/optimizedQueryClient';
import { OnboardingGuard } from './components/guards/OnboardingGuard';
import { GlobalErrorProvider } from '@/components/providers/GlobalErrorProvider';
import { TenantProvider } from '@/contexts/TenantContext';
import { lazy, Suspense } from 'react';
import { DashboardSkeleton } from '@/components/dashboard/presentation/DashboardSkeleton';
import { EnhancedDashboardLayout } from '@/components/layout/EnhancedDashboardLayout';

// Lazy load heavy page components
const LazyDashboard = lazy(() => import('@/pages/LazyDashboard'));
const LazyFarmersPage = lazy(() => import('@/pages/LazyFarmersPage'));
const LazyDealersPage = lazy(() => import('@/pages/LazyDealersPage'));
const LazyAnalyticsPage = lazy(() => import('@/pages/LazyAnalyticsPage'));

function App() {
  return (
    <Provider store={store}>
      <GlobalErrorProvider>
        <QueryClientProvider client={optimizedQueryClient}>
          <IntlProvider>
            <TenantProvider>
              <Router>
                <div className="min-h-screen bg-background font-sans antialiased">
                  <Toaster />
                  <ReactQueryDevtools initialIsOpen={false} />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth/*" element={<Auth />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/tenant-setup" element={<TenantSetupPage />} />
                    <Route path="/dashboard" element={
                      <OnboardingGuard>
                        <EnhancedDashboardLayout />
                      </OnboardingGuard>
                    }>
                      <Route index element={
                        <Suspense fallback={<DashboardSkeleton />}>
                          <LazyDashboard />
                        </Suspense>
                      } />
                      <Route path="farmers" element={
                        <Suspense fallback={<DashboardSkeleton />}>
                          <LazyFarmersPage />
                        </Suspense>
                      } />
                      <Route path="dealers" element={
                        <Suspense fallback={<DashboardSkeleton />}>
                          <LazyDealersPage />
                        </Suspense>
                      } />
                      <Route path="analytics" element={
                        <Suspense fallback={<DashboardSkeleton />}>
                          <LazyAnalyticsPage />
                        </Suspense>
                      } />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </Router>
            </TenantProvider>
          </IntlProvider>
        </QueryClientProvider>
      </GlobalErrorProvider>
    </Provider>
  );
}

export default App;
