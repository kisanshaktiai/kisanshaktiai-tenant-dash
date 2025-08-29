
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';

export default function IncentiveManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Incentive Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Incentive Management</h3>
          <p className="text-muted-foreground">
            Commission tracking, bonuses, and rewards system coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
