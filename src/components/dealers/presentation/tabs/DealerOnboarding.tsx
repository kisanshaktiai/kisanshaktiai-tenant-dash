import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, FileText, Upload, User, Shield } from 'lucide-react';
import type { Dealer } from '@/services/DealersService';

interface DealerOnboardingProps {
  dealers: Dealer[];
}

export const DealerOnboarding: React.FC<DealerOnboardingProps> = ({ dealers }) => {
  const onboardingSteps = [
    { id: 1, name: 'Basic Information', icon: User, completed: true },
    { id: 2, name: 'KYC Documents', icon: FileText, completed: true },
    { id: 3, name: 'Business Verification', icon: Shield, completed: false },
    { id: 4, name: 'Agreement Signing', icon: FileText, completed: false },
    { id: 5, name: 'Territory Assignment', icon: User, completed: false },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dealer Onboarding Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dealers.slice(0, 6).map((dealer) => (
              <Card key={dealer.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{dealer.business_name}</h4>
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />
                      In Progress
                    </Badge>
                  </div>
                  <Progress value={40} className="mb-3" />
                  <div className="space-y-2">
                    {onboardingSteps.map((step) => (
                      <div key={step.id} className="flex items-center gap-2 text-sm">
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={step.completed ? 'text-foreground' : 'text-muted-foreground'}>
                          {step.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm">Continue</Button>
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