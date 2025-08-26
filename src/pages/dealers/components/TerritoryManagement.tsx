import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Edit, Users } from 'lucide-react';

export const TerritoryManagement = () => {
  const [territories] = useState([
    {
      id: 't1',
      territory_name: 'North Haryana',
      territory_code: 'NH001',
      assigned_dealer_id: 'd1',
      dealer_name: 'Green Valley Seeds',
      coverage_status: 'covered',
      population_data: { farmers: 1250, villages: 15 },
      performance_metrics: { satisfaction: 4.2, coverage: 85 }
    },
    {
      id: 't2',
      territory_name: 'Central Haryana',
      territory_code: 'CH001',
      assigned_dealer_id: null,
      dealer_name: null,
      coverage_status: 'unassigned',
      population_data: { farmers: 890, villages: 12 },
      performance_metrics: { satisfaction: 0, coverage: 0 }
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'covered': return 'default';
      case 'unassigned': return 'destructive';
      case 'partial': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Territory Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage dealer territories and coverage areas
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Territory
        </Button>
      </div>

      {/* Territory Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {territories.map((territory) => (
          <Card key={territory.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{territory.territory_name}</CardTitle>
                <Badge variant={getStatusColor(territory.coverage_status)}>
                  {territory.coverage_status}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {territory.territory_code}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {territory.dealer_name ? (
                <div>
                  <p className="text-sm font-medium">Assigned Dealer</p>
                  <p className="text-sm text-muted-foreground">{territory.dealer_name}</p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No dealer assigned
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium">{territory.population_data.farmers}</p>
                  <p className="text-muted-foreground">Farmers</p>
                </div>
                <div>
                  <p className="font-medium">{territory.population_data.villages}</p>
                  <p className="text-muted-foreground">Villages</p>
                </div>
              </div>

              {territory.coverage_status === 'covered' && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium">{territory.performance_metrics.satisfaction}/5</p>
                    <p className="text-muted-foreground">Satisfaction</p>
                  </div>
                  <div>
                    <p className="font-medium">{territory.performance_metrics.coverage}%</p>
                    <p className="text-muted-foreground">Coverage</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Users className="h-3 w-3 mr-1" />
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Territory Coverage Map</CardTitle>
          <CardDescription>
            Visual representation of dealer territories and coverage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Territory map will be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};