
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TenantRegistrationForm } from '@/components/tenant/TenantRegistrationForm';
import { useAuth } from '@/hooks/useAuth';

const TenantSetupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleTenantCreated = () => {
    console.log('TenantSetupPage: Tenant created successfully, redirecting to dashboard');
    navigate('/dashboard');
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to the Platform
          </h1>
          <p className="text-muted-foreground">
            Let's set up your organization to get started
          </p>
        </div>
        
        <div className="bg-card rounded-lg shadow-lg p-6">
          <TenantRegistrationForm onSuccess={handleTenantCreated} />
        </div>
      </div>
    </div>
  );
};

export default TenantSetupPage;
