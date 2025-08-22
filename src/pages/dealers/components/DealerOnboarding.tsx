
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, AlertCircle, FileText, Users, Settings } from 'lucide-react';
import type { EnhancedDealer } from '@/types/dealer';

interface DealerOnboardingProps {
  // Props can be added here as needed
}

export const DealerOnboarding: React.FC<DealerOnboardingProps> = () => {
  const [selectedDealer, setSelectedDealer] = useState<string>('');

  // Mock data for demonstration
  const onboardingSteps = [
    {
      id: '1',
      step_name: 'Document Upload',
      status: 'completed',
      required_documents: ['GST Certificate', 'PAN Card', 'Bank Details'],
      submitted_documents: ['gst.pdf', 'pan.pdf', 'bank.pdf'],
    },
    {
      id: '2',
      step_name: 'KYC Verification',
      status: 'in_progress',
      required_documents: ['Address Proof', 'Identity Proof'],
      submitted_documents: ['address.pdf'],
    },
    {
      id: '3',
      step_name: 'Product Training',
      status: 'pending',
      required_documents: [],
      submitted_documents: [],
    },
    {
      id: '4',
      step_name: 'Agreement Signing',
      status: 'pending',
      required_documents: ['Dealer Agreement'],
      submitted_documents: [],
    },
  ];

  const mockDealers = [
    {
      id: '1',
      business_name: 'Green Valley Agro',
      onboarding_status: 'in_progress',
      progress: 50,
    },
    {
      id: '2',
      business_name: 'Sunrise Seeds Co.',
      onboarding_status: 'completed',
      progress: 100,
    },
    {
      id: '3',
      business_name: 'Rural Farm Supply',
      onboarding_status: 'not_started',
      progress: 0,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dealer Onboarding</h2>
          <p className="text-muted-foreground">
            Manage dealer registration and onboarding process
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configure Workflow
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Onboarding Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Dealers
                    </p>
                    <p className="text-2xl font-bold">{mockDealers.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      In Progress
                    </p>
                    <p className="text-2xl font-bold">
                      {mockDealers.filter(d => d.onboarding_status === 'in_progress').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Completed
                    </p>
                    <p className="text-2xl font-bold">
                      {mockDealers.filter(d => d.onboarding_status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dealers List */}
          <Card>
            <CardHeader>
              <CardTitle>Dealer Onboarding Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDealers.map((dealer) => (
                  <div key={dealer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-semibold">{dealer.business_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Status: {dealer.onboarding_status.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{dealer.progress}%</span>
                        </div>
                        <Progress value={dealer.progress} className="h-2" />
                      </div>
                      
                      <Badge variant={getStatusColor(dealer.onboarding_status) as any}>
                        {dealer.onboarding_status.replace('_', ' ')}
                      </Badge>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedDealer(dealer.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {onboardingSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(step.status)}
                        <h4 className="font-semibold">{step.step_name}</h4>
                        <Badge variant={getStatusColor(step.status) as any}>
                          {step.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {step.required_documents.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <p className="mb-1">Required Documents:</p>
                          <ul className="list-disc list-inside ml-4">
                            {step.required_documents.map((doc, i) => (
                              <li key={i}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Document Management</h3>
                <p className="text-muted-foreground">
                  Track and manage dealer documentation throughout the onboarding process.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
