
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { Provider } from 'react-redux';
import { store } from '@/store';

// Import the refactored components
import { TenantProvider } from '@/contexts/TenantContextRefactored';
import { OnboardingGuard } from '@/components/guards/OnboardingGuardRefactored';

// Pages
import Auth from '@/pages/Auth';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import PasswordSetupPage from '@/pages/invitation/PasswordSetupPage';
import TenantSetupPage from '@/pages/TenantSetupPage';
import LazyDashboard from '@/pages/LazyDashboard';
import LazyFarmersPage from '@/pages/LazyFarmersPage';
import LazyDealersPage from '@/pages/LazyDealersPage';
import LazyAnalyticsPage from '@/pages/LazyAnalyticsPage';
import CampaignsPage from '@/pages/CampaignsPage';
import SettingsPage from '@/pages/SettingsPage';
import SubscriptionPage from '@/pages/subscription/SubscriptionPage';
import OnboardingPage from '@/pages/onboarding/OnboardingPage';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TenantProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public routes */}
                <Route path="/auth/*" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/invitation/:token" element={<PasswordSetupPage />} />
                
                {/* Tenant setup route */}
                <Route path="/tenant-setup" element={<TenantSetupPage />} />
                
                {/* Protected routes with onboarding guard */}
                <Route path="/dashboard" element={
                  <OnboardingGuard>
                    <LazyDashboard />
                  </OnboardingGuard>
                } />
                <Route path="/farmers" element={
                  <OnboardingGuard>
                    <LazyFarmersPage />
                  </OnboardingGuard>
                } />
                <Route path="/dealers" element={
                  <OnboardingGuard>
                    <LazyDealersPage />
                  </OnboardingGuard>
                } />
                <Route path="/analytics" element={
                  <OnboardingGuard>
                    <LazyAnalyticsPage />
                  </OnboardingGuard>
                } />
                <Route path="/campaigns" element={
                  <OnboardingGuard>
                    <CampaignsPage />
                  </OnboardingGuard>
                } />
                <Route path="/settings" element={
                  <OnboardingGuard>
                    <SettingsPage />
                  </OnboardingGuard>
                } />
                <Route path="/subscription" element={
                  <OnboardingGuard>
                    <SubscriptionPage />
                  </OnboardingGuard>
                } />
                
                {/* Onboarding route */}
                <Route path="/onboarding" element={<OnboardingPage />} />
                
                {/* Default redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </TenantProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
