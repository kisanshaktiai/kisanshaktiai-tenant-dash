import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Dealer } from '@/services/DealersService';

export const PerformanceTracking: React.FC<{ dealers: Dealer[] }> = ({ dealers }) => (
  <Card>
    <CardHeader><CardTitle>Performance Tracking</CardTitle></CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Performance metrics and analytics coming soon</p>
    </CardContent>
  </Card>
);