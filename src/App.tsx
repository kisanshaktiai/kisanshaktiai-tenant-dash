import React from 'react';
import './App.css';
import { useAuth } from './hooks/useAuth';
import { AuthenticatedRoutes, UnauthenticatedRoutes } from './components/auth/AuthRoutes';
import { useTenantData } from './hooks/useTenantData';
import { AppThemeProvider } from './components/providers/AppThemeProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useQueryErrorHandler } from './hooks/core/useQueryErrorHandler';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/ErrorFallback';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

// Main pages
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import FarmersPage from './pages/FarmersPage';
import ProductsPage from './pages/ProductsPage';
import CampaignsPage from './pages/CampaignsPage';
import DealersPage from './pages/DealersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import UserManagementPage from './pages/UserManagementPage';
import NotFound from './pages/NotFound';

// Settings pages
import OrganizationSettingsPage from './pages/settings/OrganizationPage';
import SecurityPage from './pages/settings/SecurityPage';
import NotificationsPage from './pages/settings/NotificationsPage';
import { AppearancePage } from './pages/settings/AppearancePage';
import DataPrivacyPage from './pages/settings/DataPrivacyPage';

// Auth pages
import Auth from './pages/Auth';
import OnboardingPage from './pages/OnboardingPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';
import TenantRegistrationPage from './pages/TenantRegistrationPage';
import SubscriptionPage from './pages/SubscriptionPage';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/register" element={<TenantRegistrationPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />

        {/* Protected routes */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="farmers" element={<FarmersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="dealers" element={<DealersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          
          {/* Settings routes */}
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/organization" element={<OrganizationSettingsPage />} />
          <Route path="settings/users" element={<UserManagementPage />} />
          <Route path="settings/security" element={<SecurityPage />} />
          <Route path="settings/notifications" element={<NotificationsPage />} />
          <Route path="settings/appearance" element={<AppearancePage />} />
          <Route path="settings/data-privacy" element={<DataPrivacyPage />} />
          <Route path="settings/api-keys" element={<SettingsPage />} />
          <Route path="settings/localization" element={<SettingsPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <Toaster />
      <SonnerToaster />
    </ErrorBoundary>
  );
}

export default App;
