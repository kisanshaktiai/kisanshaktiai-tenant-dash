
import React from 'react';
import { TenantRegistrationForm } from '@/components/tenant/TenantRegistrationForm';

export const TenantRegistrationPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Register Your Organization
        </h2>
        <TenantRegistrationForm />
      </div>
    </div>
  );
};
