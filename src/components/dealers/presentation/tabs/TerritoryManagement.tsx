import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, TrendingUp, AlertCircle } from 'lucide-react';
import type { Dealer } from '@/services/DealersService';

interface TerritoryManagementProps {
  dealers: Dealer[];
}

export const TerritoryManagement: React.FC<TerritoryManagementProps> = ({ dealers }) => {
  const territories = [
    { name: 'North Zone', dealers: 45, villages: 128, coverage: '85%', growth: '+12%' },
    { name: 'South Zone', dealers: 38, villages: 102, coverage: '78%', growth: '+8%' },
    { name: 'East Zone', dealers: 52, villages: 145, coverage: '92%', growth: '+15%' },
    { name: 'West Zone', dealers: 29, villages: 87, coverage: '65%', growth: '+5%' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Territory Coverage</CardTitle>
            <Button>Optimize Territories</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {territories.map((territory) => (
              <Card key={territory.name} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{territory.name}</h4>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dealers</span>
                      <span className="font-medium">{territory.dealers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Villages</span>
                      <span className="font-medium">{territory.villages}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Coverage</span>
                      <Badge variant="secondary">{territory.coverage}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Growth</span>
                      <span className="text-green-600 font-medium">{territory.growth}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};