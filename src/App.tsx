import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useAppSelector } from '@/store/hooks';
import { useAuth } from '@/hooks/useAuth';
import { useTenantAuthOptimized } from '@/hooks/useTenantAuthOptimized';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { FarmersPage } from '@/pages/FarmersPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { DealersPage } from '@/pages/DealersPage';
import CampaignsPage from '@/pages/CampaignsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { IntegrationsPage } from '@/pages/IntegrationsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import { OrganizationSettingsPage } from '@/pages/OrganizationSettingsPage';
import { UserManagementPage } from '@/pages/UserManagementPage';
import { SubscriptionPage } from '@/pages/SubscriptionPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { TenantRegistrationPage } from '@/pages/TenantRegistrationPage';
import { AcceptInvitationPage } from '@/pages/AcceptInvitationPage';
import { SetupPasswordPage } from '@/pages/SetupPasswordPage';
import { UserInvitationsPage } from './pages/UserInvitationsPage';

function App() {
  const { user, loading } = useAuth();
  const { isInitialized } = useTenantAuthOptimized();
  const { isOnboardingComplete } = useAppSelector((state) => state.onboarding);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      setShowAuth(true);
    } else {
      setShowAuth(false);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      {showAuth ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
              Welcome to KisanShakti AI
            </h2>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#4ade80',
                      brandAccent: '#22c55e',
                    },
                  },
                },
              }}
              providers={['google', 'github']}
              redirectTo={`${window.location.origin}/dashboard`}
            />
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/accept-invite" element={<AcceptInvitationPage />} />
          <Route path="/setup-password" element={<SetupPasswordPage />} />
          <Route path="/register" element={<TenantRegistrationPage />} />

          <Route
            path="/"
            element={
              user && isInitialized ? (
                isOnboardingComplete ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/onboarding" replace />
                )
              ) : (
                <Navigate to="/onboarding" replace />
              )
            }
          />

          <Route
            path="/onboarding"
            element={
              user ? (
                isOnboardingComplete ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Layout>
                    <OnboardingPage />
                  </Layout>
                )
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              user && isInitialized ? (
                <Layout>
                  <DashboardPage />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/farmers"
            element={
              user && isInitialized ? (
                <Layout>
                  <FarmersPage />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/products"
            element={
              user && isInitialized ? (
                <Layout>
                  <ProductsPage />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/dealers"
            element={
              user && isInitialized ? (
                <Layout>
                  <DealersPage />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/campaigns"
            element={
              user && isInitialized ? (
                <Layout>
                  <CampaignsPage />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/analytics"
            element={
              user && isInitialized ? (
                <Layout>
                  <AnalyticsPage />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/integrations"
            element={
              user && isInitialized ? (
                <Layout>
                  <IntegrationsPage />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              user && isInitialized ? (
                <Layout>
                  <ProfilePage />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/settings"
            element={
              user && isInitialized ? (
                <Layout>
                  <SettingsPage />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/settings/organization"
            element={
              user && isInitialized ? (
                <Layout>
                  <OrganizationSettingsPage />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/settings/users"
            element={
              user && isInitialized ? (
                <Layout>
                  <UserManagementPage />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/settings/invitations" element={<Layout><UserInvitationsPage /></Layout>} />
          <Route
            path="/subscription"
            element={
              user && isInitialized ? (
                <Layout>
                  <SubscriptionPage />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      )}
    </Router>
  );
}

export default App;
