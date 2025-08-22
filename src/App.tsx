
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import { IntlProvider } from './components/providers/IntlProvider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { OnboardingGuard } from './components/guards/OnboardingGuard';
import { GlobalErrorProvider } from '@/components/providers/GlobalErrorProvider';

function App() {
  return (
    <Provider store={store}>
      <GlobalErrorProvider>
        <QueryClientProvider client={queryClient}>
          <IntlProvider>
            <Router>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Toaster />
                <ReactQueryDevtools initialIsOpen={false} />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth/*" element={<Auth />} />
                  <Route path="/dashboard/*" element={
                    <OnboardingGuard>
                      <Dashboard />
                    </OnboardingGuard>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </IntlProvider>
        </QueryClientProvider>
      </GlobalErrorProvider>
    </Provider>
  );
}

export default App;
