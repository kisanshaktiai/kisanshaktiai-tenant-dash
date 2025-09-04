import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Dealer } from '@/services/DealersService';

export const CommunicationHub: React.FC<{ dealers: Dealer[]; selectedDealers: string[] }> = ({ dealers }) => (
  <Card>
    <CardHeader><CardTitle>Communication Hub</CardTitle></CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Communication tools coming soon</p>
    </CardContent>
  </Card>
);