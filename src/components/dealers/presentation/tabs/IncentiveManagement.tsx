import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Dealer } from '@/services/DealersService';

export const IncentiveManagement: React.FC<{ dealers: Dealer[] }> = ({ dealers }) => (
  <Card>
    <CardHeader><CardTitle>Incentive Management</CardTitle></CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Incentive programs coming soon</p>
    </CardContent>
  </Card>
);