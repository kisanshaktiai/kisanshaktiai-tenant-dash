
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Users, TrendingUp, Plus, Search, Edit, Eye } from 'lucide-react';

export const TerritoryManagement: React.FC = () => {
  // Mock territory data
  const territories = [
    {
      id: '1',
      territory_name: 'North Region',
      territory_code: 'NR-001',
      description: 'Northern agricultural belt covering 5 districts',
      assigned_dealer_id: 'dealer-1',
      dealer_name: 'Green Valley Suppliers',
      coverage_status: 'active',
      market_potential: { farmers: 1250, estimated_revenue: 2500000 },
      population_data: { total_farmers: 1500, active_farmers: 1250 },
      is_active: true,
    },
    {
      id: '2',
      territory_name: 'South Region',
      territory_code: 'SR-002',
      description: 'Southern coastal region with rice and coconut farms',
      assigned_dealer_id: 'dealer-2',
      dealer_name: 'Sunrise Agro Center',
      coverage_status: 'active',
      market_potential: { farmers: 800, estimated_revenue: 1600000 },
      population_data: { total_farmers: 900, active_farmers: 800 },
      is_active: true,
    },
    {
      id: '3',
      territory_name: 'East Region',
      territory_code: 'ER-003',
      description: 'Eastern hilly region with tea and spice cultivation',
      assigned_dealer_id: null,
      dealer_name: null,
      coverage_status: 'unassigned',
      market_potential: { farmers: 600, estimated_revenue: 1200000 },
      population_data: { total_farmers: 750, active_farmers: 600 },
      is_active: true,
    },
    {
      id: '4',
      territory_name: 'West Region',
      territory_code: 'WR-004',
      description: 'Western industrial farming region',
      assigned_dealer_id: 'dealer-3',
      dealer_name: 'Modern Farm Solutions',
      coverage_status: 'partial',
      market_potential: { farmers: 950, estimated_revenue: 1900000 },
      population_data: { total_farmers: 1200, active_farmers: 950 },
      is_active: true,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'partial':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Partial Coverage</Badge>;
      case 'unassigned':
        return <Badge variant="secondary">Unassigned</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCoveragePercentage = (status: string, marketPotential: any, populationData: any) => {
    if (status === 'unassigned') return 0;
    if (status === 'partial') return 65;
    return Math.round((marketPotential.farmers / populationData.total_farmers) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Territory Management</h2>
          <p className="text-muted-foreground">
            Manage dealer territories and coverage areas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <MapPin className="h-4 w-4 mr-2" />
            View Map
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Territory
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search territories..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          Filter by Status
        </Button>
      </div>

      {/* Territory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {territories.map((territory) => (
          <Card key={territory.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{territory.territory_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{territory.territory_code}</p>
                </div>
                {getStatusBadge(territory.coverage_status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {territory.description}
              </p>

              {/* Assigned Dealer */}
              <div>
                <p className="text-sm font-medium">Assigned Dealer:</p>
                <p className="text-sm text-muted-foreground">
                  {territory.dealer_name || 'Unassigned'}
                </p>
              </div>

              {/* Coverage Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-blue-600 mr-1" />
                  </div>
                  <p className="text-2xl font-bold">{territory.market_potential.farmers}</p>
                  <p className="text-xs text-muted-foreground">Active Farmers</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  </div>
                  <p className="text-2xl font-bold">
                    {getCoveragePercentage(territory.coverage_status, territory.market_potential, territory.population_data)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Coverage</p>
                </div>
              </div>

              {/* Market Potential */}
              <div className="pt-2 border-t">
                <p className="text-sm font-medium">Market Potential:</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{(territory.market_potential.estimated_revenue / 100000).toFixed(1)}L
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>

              {territory.coverage_status === 'unassigned' && (
                <Button size="sm" className="w-full">
                  Assign Dealer
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">4</p>
            <p className="text-sm text-muted-foreground">Total Territories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">3</p>
            <p className="text-sm text-muted-foreground">Assigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">1</p>
            <p className="text-sm text-muted-foreground">Unassigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">₹72L</p>
            <p className="text-sm text-muted-foreground">Total Potential</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
