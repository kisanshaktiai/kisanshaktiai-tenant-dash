
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, MapPin, Phone, Mail, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DealerDirectoryProps {
  searchTerm: string;
}

export default function DealerDirectory({ searchTerm }: DealerDirectoryProps) {
  // Mock dealer data - this should come from your API
  const dealers = [
    {
      id: '1',
      name: 'Agri Solutions Ltd',
      location: 'Mumbai, Maharashtra',
      phone: '+91 98765 43210',
      email: 'contact@agrisolutions.com',
      status: 'active',
      territory: 'West Zone',
      performance: 'excellent'
    },
    {
      id: '2',
      name: 'Farm Tech Distributors',
      location: 'Delhi, NCR',
      phone: '+91 87654 32109',
      email: 'info@farmtech.com',
      status: 'active',
      territory: 'North Zone',
      performance: 'good'
    }
  ].filter(dealer => 
    dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      pending: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getPerformanceBadge = (performance: string) => {
    const variants = {
      excellent: 'default',
      good: 'secondary',
      average: 'outline',
      poor: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[performance as keyof typeof variants] || 'outline'}>
        {performance.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Dealer Directory ({dealers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {dealers.map((dealer) => (
              <Card key={dealer.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{dealer.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {dealer.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {dealer.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                      {getStatusBadge(dealer.status)}
                      {getPerformanceBadge(dealer.performance)}
                      <span className="text-sm text-muted-foreground">
                        Territory: {dealer.territory}
                      </span>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem>Assign Territory</DropdownMenuItem>
                      <DropdownMenuItem>Contact Dealer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
          
          {dealers.length === 0 && (
            <div className="text-center py-12">
              <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No dealers found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? `No dealers match "${searchTerm}"` : 'No dealers have been added yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
