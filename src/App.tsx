
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import TenantSetupPage from '@/pages/TenantSetupPage';
import { IntlProvider } from './components/providers/IntlProvider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { OnboardingGuard } from './components/guards/OnboardingGuard';
import { GlobalErrorProvider } from '@/components/providers/GlobalErrorProvider';
import { TenantProvider } from '@/contexts/TenantContext';

function App() {
  return (
    <Provider store={store}>
      <GlobalErrorProvider>
        <QueryClientProvider client={queryClient}>
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
                    {/* Remove tenant-setup route - not needed for existing tenants */}
                    <Route path="/tenant-setup" element={<TenantSetupPage />} />
                    <Route path="/dashboard/*" element={
                      <OnboardingGuard>
                        <Dashboard />
                      </OnboardingGuard>
                    } />
                    {/* Redirect any other routes to main page */}
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
