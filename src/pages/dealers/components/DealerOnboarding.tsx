
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertTriangle, FileText, User, Shield } from 'lucide-react';

export const DealerOnboarding: React.FC = () => {
  // Mock onboarding data
  const onboardingSteps = [
    {
      id: '1',
      dealerName: 'Green Valley Suppliers',
      contactPerson: 'Rajesh Kumar',
      currentStep: 'KYC Verification',
      progress: 75,
      status: 'in_progress' as const,
      steps: [
        { name: 'Basic Information', completed: true },
        { name: 'Document Upload', completed: true },
        { name: 'KYC Verification', completed: false },
        { name: 'Territory Assignment', completed: false },
        { name: 'Product Authorization', completed: false },
        { name: 'Agreement Signing', completed: false },
      ]
    },
    {
      id: '2',
      dealerName: 'Sunrise Agro Center',
      contactPerson: 'Priya Sharma',
      currentStep: 'Agreement Signing',
      progress: 90,
      status: 'pending_approval' as const,
      steps: [
        { name: 'Basic Information', completed: true },
        { name: 'Document Upload', completed: true },
        { name: 'KYC Verification', completed: true },
        { name: 'Territory Assignment', completed: true },
        { name: 'Product Authorization', completed: true },
        { name: 'Agreement Signing', completed: false },
      ]
    },
    {
      id: '3',
      dealerName: 'Modern Farm Solutions',
      contactPerson: 'Amit Patel',
      currentStep: 'Document Upload',
      progress: 25,
      status: 'stuck' as const,
      steps: [
        { name: 'Basic Information', completed: true },
        { name: 'Document Upload', completed: false },
        { name: 'KYC Verification', completed: false },
        { name: 'Territory Assignment', completed: false },
        { name: 'Product Authorization', completed: false },
        { name: 'Agreement Signing', completed: false },
      ]
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'stuck':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'pending_approval':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case 'stuck':
        return <Badge variant="destructive">Stuck</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dealer Onboarding</h2>
          <p className="text-muted-foreground">
            Track and manage dealer onboarding progress
          </p>
        </div>
        <Button>
          <User className="h-4 w-4 mr-2" />
          New Dealer Application
        </Button>
      </div>

      {/* Onboarding Pipeline */}
      <div className="grid gap-6">
        {onboardingSteps.map((dealer) => (
          <Card key={dealer.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(dealer.status)}
                  <div>
                    <CardTitle className="text-lg">{dealer.dealerName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Contact: {dealer.contactPerson}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(dealer.status)}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Current Step: {dealer.currentStep}</span>
                  <span className="text-sm text-muted-foreground">{dealer.progress}% complete</span>
                </div>
                <Progress value={dealer.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {dealer.steps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={`text-xs ${step.completed ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Documents
                </Button>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Update KYC
                </Button>
                {dealer.status === 'stuck' && (
                  <Button size="sm">
                    Follow Up
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
