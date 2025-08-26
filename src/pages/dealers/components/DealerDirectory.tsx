import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, Filter, Download, MoreHorizontal, MapPin, 
  Phone, Mail, Edit, Eye, MessageSquare, Users, Building
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

interface DealerDirectoryProps {
  dealers: any[];
  loading: boolean;
}

export const DealerDirectory = ({ dealers, loading }: DealerDirectoryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDealers, setSelectedDealers] = useState<string[]>([]);

  // Sample data when no real data
  const sampleDealers = [
    {
      id: '1',
      business_name: 'Green Valley Seeds',
      contact_person: 'Rajesh Kumar',
      phone: '+91 9876543210',
      email: 'rajesh@greenvalley.com',
      business_address: { city: 'Sonipat', state: 'Haryana' },
      dealer_code: 'GVS001',
      registration_status: 'approved',
      is_active: true,
      performance_rating: 4.5,
      territory_ids: ['t1', 't2']
    },
    {
      id: '2',
      business_name: 'Krishi Kendra',
      contact_person: 'Priya Sharma',
      phone: '+91 9876543211',
      email: 'priya@krishikendra.com',
      business_address: { city: 'Karnal', state: 'Haryana' },
      dealer_code: 'KK002',
      registration_status: 'pending',
      is_active: true,
      performance_rating: 4.2,
      territory_ids: ['t3']
    }
  ];

  const displayDealers = dealers.length > 0 ? dealers : sampleDealers;

  const filteredDealers = displayDealers.filter(dealer =>
    dealer.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dealer.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dealer.phone.includes(searchQuery)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading dealers...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Dealers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search dealers by name, contact person, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Dealer List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Dealers ({filteredDealers.length})
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDealers.map((dealer) => (
              <div
                key={dealer.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {dealer.business_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{dealer.business_name}</h3>
                    <Badge variant={getStatusColor(dealer.registration_status)}>
                      {dealer.registration_status}
                    </Badge>
                    {dealer.is_active && (
                      <Badge variant="outline" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {dealer.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {dealer.business_address?.city}, {dealer.business_address?.state}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {dealer.dealer_code}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-muted-foreground">
                    Contact: {dealer.contact_person}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">
                    Rating: {dealer.performance_rating || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {dealer.territory_ids?.length || 0} territories
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Dealer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};