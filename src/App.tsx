
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { optimizedQueryClient } from '@/lib/optimizedQueryClient';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Consolidated contexts
import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { OnboardingGuard } from '@/components/guards/OnboardingGuard';

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

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={optimizedQueryClient}>
        <AuthProvider>
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
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
