
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { CampaignBasicInfo } from './wizard/CampaignBasicInfo';
import { CampaignAudience } from './wizard/CampaignAudience';
import { CampaignContent } from './wizard/CampaignContent';
import { CampaignSchedule } from './wizard/CampaignSchedule';
import { CampaignReview } from './wizard/CampaignReview';

interface CampaignWizardProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string;
}

export const CampaignWizard: React.FC<CampaignWizardProps> = ({
  isOpen,
  onClose,
  campaignId,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    campaign_type: 'promotional' as const,
    channels: [] as string[],
    total_budget: 0,
    target_audience: {
      segments: [] as string[],
      criteria: {} as Record<string, any>,
    },
    content: {
      template_id: '',
      subject: '',
      body: '',
      personalization: {} as Record<string, any>,
    },
    schedule: {
      start_date: '',
      end_date: '',
      timezone: 'UTC',
      is_automated: false,
    },
  });

  const steps = [
    { title: 'Basic Info', component: CampaignBasicInfo },
    { title: 'Audience', component: CampaignAudience },
    { title: 'Content', component: CampaignContent },
    { title: 'Schedule', component: CampaignSchedule },
    { title: 'Review', component: CampaignReview },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = (stepData: any) => {
    setCampaignData(prev => ({
      ...prev,
      ...stepData,
    }));
  };

  const handleSave = async (status: 'draft' | 'scheduled') => {
    try {
      // Save campaign logic here
      console.log('Saving campaign:', { ...campaignData, status });
      onClose();
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create New Campaign</span>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              {steps.map((step, index) => (
                <span
                  key={step.title}
                  className={index <= currentStep ? 'text-primary' : ''}
                >
                  {step.title}
                </span>
              ))}
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            <CurrentStepComponent
              data={campaignData}
              onUpdate={handleStepData}
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="space-x-2">
              <Button variant="outline" onClick={() => handleSave('draft')}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button onClick={() => handleSave('scheduled')}>
                  Create Campaign
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
