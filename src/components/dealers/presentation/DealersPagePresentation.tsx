
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, MapPin, Users, TrendingUp, Phone, Mail } from 'lucide-react';

interface Dealer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  territory?: string;
  status?: string;
  registration_date?: string;
  business_type?: string;
  gst_number?: string;
  license_number?: string;
  commission_rate?: number;
  assigned_farmers?: number;
  monthly_sales?: number;
  performance_score?: number;
  metadata?: Record<string, any>;
}

interface DealersPagePresentationProps {
  dealers: Dealer[];
  totalCount: number;
  isLoading?: boolean;
  error?: any;
  searchTerm: string;
  selectedDealers: string[];
  onSearch: (value: string) => void;
  onSelectedDealersChange: React.Dispatch<React.SetStateAction<string[]>>;
  isLive?: boolean;
  activeChannels?: number;
}

export const DealersPagePresentation: React.FC<DealersPagePresentationProps> = ({
  dealers,
  totalCount,
  isLoading,
  error,
  searchTerm,
  selectedDealers,
  onSearch,
  onSelectedDealersChange,
  isLive,
  activeChannels
}) => {
  return (
    <div className="w-full min-h-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" />
            Dealer Network
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg mt-2">
            Manage your dealer network and distribution channels
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="gap-1.5">
              <Users className="h-3 w-3" />
              {totalCount} Dealers
            </Badge>
            {isLive && (
              <Badge variant="outline" className="gap-1.5">
                Live • {activeChannels} channels
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Import Dealers</Button>
          <Button>Add Dealer</Button>
        </div>
      </div>

      {/* Dealer Management Tabs */}
      <Tabs defaultValue="directory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="territory">Territory</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="incentives">Incentives</TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <Card>
            <CardHeader>
              <CardTitle>Dealer Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Dealer directory component will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding">
          <Card>
            <CardHeader>
              <CardTitle>Dealer Onboarding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Dealer onboarding component will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="territory">
          <Card>
            <CardHeader>
              <CardTitle>Territory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Territory management component will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Performance tracking component will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Communication Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Communication tools component will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incentives">
          <Card>
            <CardHeader>
              <CardTitle>Incentive Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Incentive management component will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
