
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

export default function DealerOnboarding() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Dealer Onboarding
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <UserPlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Dealer Onboarding</h3>
          <p className="text-muted-foreground">
            Multi-step registration wizard and KYC verification coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
