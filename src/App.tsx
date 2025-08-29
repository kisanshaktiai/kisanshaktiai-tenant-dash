

import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { IntlProvider } from './components/providers/IntlProvider';
import Index from './pages/Index';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import TenantLoginPage from './pages/auth/TenantLoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PasswordSetupPage from './pages/invitation/PasswordSetupPage';
import Dashboard from './pages/Dashboard';
import FarmersPage from './pages/farmers/FarmersPage';
import ProductsPage from './pages/products/ProductsPage';
import DealersPage from './pages/dealers/DealersPage';
import CampaignsPage from './pages/CampaignsPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import IntegrationsPage from './pages/integrations/IntegrationsPage';
import SettingsPage from './pages/SettingsPage';
import SubscriptionPage from './pages/subscription/SubscriptionPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import NotFound from './pages/NotFound';
import { OnboardingGuardOptimized } from './components/guards/OnboardingGuardOptimized';
import { ProfilePage } from './pages/ProfilePage';
import { EnhancedDashboardLayout } from './components/layout/EnhancedDashboardLayout';
import ErrorFallback from './components/ErrorFallback';

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <IntlProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/tenant-login" element={<TenantLoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/invitation/:token" element={<PasswordSetupPage />} />
            
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            
            {/* Protected Routes with Onboarding Guard */}
            <Route
              path="/*"
              element={
                <OnboardingGuardOptimized>
                  <EnhancedDashboardLayout />
                </OnboardingGuardOptimized>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="farmers" element={<FarmersPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="dealers" element={<DealersPage />} />
              <Route path="campaigns" element={<CampaignsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="subscription" element={<SubscriptionPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </IntlProvider>
    </ErrorBoundary>
  );
}

export default App;

