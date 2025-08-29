import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { IntlProvider } from './IntlProvider';
import { Index } from './pages';
import { Login as LoginPage } from './pages/auth/Login';
import { Register as RegisterPage } from './pages/auth/Register';
import { TenantLogin as TenantLoginPage } from './pages/auth/TenantLogin';
import { ForgotPassword as ForgotPasswordPage } from './pages/auth/ForgotPassword';
import { ResetPassword as ResetPasswordPage } from './pages/auth/ResetPassword';
import { PasswordSetup as PasswordSetupPage } from './pages/auth/PasswordSetup';
import { Dashboard } from './pages/Dashboard';
import { Farmers as FarmersPage } from './pages/Farmers';
import { Products as ProductsPage } from './pages/Products';
import { Dealers as DealersPage } from './pages/Dealers';
import { Campaigns as CampaignsPage } from './pages/Campaigns';
import { Analytics as AnalyticsPage } from './pages/Analytics';
import { Integrations as IntegrationsPage } from './pages/Integrations';
import { Settings as SettingsPage } from './pages/Settings';
import { Subscription as SubscriptionPage } from './pages/Subscription';
import { Onboarding as OnboardingPage } from './pages/Onboarding';
import { NotFound } from './pages/NotFound';
import { OnboardingGuardOptimized } from './components/auth/OnboardingGuardOptimized';
import { ProfilePage } from './pages/ProfilePage';
import { EnhancedDashboardLayout } from './components/layout/EnhancedDashboardLayout';

function App() {
  return (
    <ErrorBoundary>
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
