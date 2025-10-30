
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TenantRegistrationPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tenant Registration</CardTitle>
          <CardDescription>
            Register your organization to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This feature is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantRegistrationPage;
export { TenantRegistrationPage };
