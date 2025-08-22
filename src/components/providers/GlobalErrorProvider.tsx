
import React from 'react';
import { ErrorBoundaryProvider } from '@/contexts/ErrorBoundaryContext';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface GlobalErrorProviderProps {
  children: React.ReactNode;
}

export const GlobalErrorProvider: React.FC<GlobalErrorProviderProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ErrorBoundaryProvider>
        {children}
      </ErrorBoundaryProvider>
    </ErrorBoundary>
  );
};
