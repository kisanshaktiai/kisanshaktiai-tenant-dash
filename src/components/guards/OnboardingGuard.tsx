
import { Navigate } from 'react-router-dom';
import { useOnboardingQuery } from '@/hooks/useOnboarding';
import { useAppSelector } from '@/store/hooks';
import { onboardingService } from '@/services/OnboardingService';
import { useQuery } from '@tanstack/react-query';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { currentTenant } = useAppSelector((state) => state.tenant);
  
  const { data: isComplete, isLoading } = useQuery({
    queryKey: ['onboarding-status', currentTenant?.id],
    queryFn: async () => {
      if (!currentTenant?.id) return false;
      return await onboardingService.isOnboardingComplete(currentTenant.id);
    },
    enabled: !!currentTenant?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
