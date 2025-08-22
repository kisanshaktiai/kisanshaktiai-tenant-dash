
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, ArrowRight, Target, MessageSquare, 
  Calendar, BarChart3, Users, Settings
} from 'lucide-react';
import { Campaign } from '@/types/campaign';

interface CampaignWizardProps {
  onComplete: (campaign: Partial<Campaign>) => void;
  onCancel: () => void;
  initialData?: Partial<Campaign>;
}

export const CampaignWizard = ({ onComplete, onCancel, initialData }: CampaignWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState<Partial<Campaign>>(
    initialData || {
      name: '',
      description: '',
      campaign_type: 'promotional',
      channels: [],
      target_audience_config: {},
      content_config: {},
      automation_config: {},
      budget_allocated: 0
    }
  );

  const steps = [
    { id: 1, title: 'Basic Info', icon: Settings },
    { id: 2, title: 'Audience', icon: Users },
    { id: 3, title: 'Content', icon: MessageSquare },
    { id: 4, title: 'Schedule', icon: Calendar },
    { id: 5, title: 'Review', icon: BarChart3 }
  ];

  const updateCampaignData = (field: string, value: any) => {
    setCampaignData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(campaignData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={campaignData.name}
                onChange={(e) => updateCampaignData('name', e.target.value)}
                placeholder="Enter campaign name"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={campaignData.description}
                onChange={(e) => updateCampaignData('description', e.target.value)}
                placeholder="Describe your campaign objectives"
              />
            </div>

            <div>
              <Label>Campaign Type</Label>
              <Select
                value={campaignData.campaign_type}
                onValueChange={(value) => updateCampaignData('campaign_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                  <SelectItem value="government_scheme">Government Scheme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="budget">Budget (₹)</Label>
              <Input
                id="budget"
                type="number"
                value={campaignData.budget_allocated}
                onChange={(e) => updateCampaignData('budget_allocated', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Target Audience Segments</Label>
              <div className="grid gap-3 mt-2">
                {['New Farmers', 'Premium Customers', 'Inactive Users', 'High Value Customers'].map((segment) => (
                  <div key={segment} className="flex items-center space-x-2">
                    <Checkbox id={segment} />
                    <Label htmlFor={segment}>{segment}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Geographic Targeting</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="north">North India</SelectItem>
                  <SelectItem value="south">South India</SelectItem>
                  <SelectItem value="west">West India</SelectItem>
                  <SelectItem value="east">East India</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Crop-based Targeting</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize'].map((crop) => (
                  <Badge key={crop} variant="outline" className="cursor-pointer">
                    {crop}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Communication Channels</Label>
              <div className="grid gap-3 mt-2">
                {[
                  { id: 'sms', label: 'SMS' },
                  { id: 'whatsapp', label: 'WhatsApp' },
                  { id: 'email', label: 'Email' },
                  { id: 'app_notification', label: 'App Notification' }
                ].map((channel) => (
                  <div key={channel.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={channel.id}
                      checked={campaignData.channels?.includes(channel.id)}
                      onCheckedChange={(checked) => {
                        const currentChannels = campaignData.channels || [];
                        if (checked) {
                          updateCampaignData('channels', [...currentChannels, channel.id]);
                        } else {
                          updateCampaignData('channels', currentChannels.filter(c => c !== channel.id));
                        }
                      }}
                    />
                    <Label htmlFor={channel.id}>{channel.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Message Template</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_product">New Product Launch</SelectItem>
                  <SelectItem value="seasonal_offer">Seasonal Offer</SelectItem>
                  <SelectItem value="educational">Educational Content</SelectItem>
                  <SelectItem value="reminder">Payment Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Message Content</Label>
              <Textarea
                placeholder="Write your message content here..."
                className="min-h-32"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Campaign Timing</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select timing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Send Immediately</SelectItem>
                  <SelectItem value="scheduled">Schedule for Later</SelectItem>
                  <SelectItem value="recurring">Recurring Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={campaignData.scheduled_start?.slice(0, 16)}
                  onChange={(e) => updateCampaignData('scheduled_start', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={campaignData.scheduled_end?.slice(0, 16)}
                  onChange={(e) => updateCampaignData('scheduled_end', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Automation Rules</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="auto_follow" />
                  <Label htmlFor="auto_follow">Send follow-up after 3 days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="auto_stop" />
                  <Label htmlFor="auto_stop">Stop if budget limit reached</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Campaign Summary</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {campaignData.name}</div>
                <div><strong>Type:</strong> {campaignData.campaign_type}</div>
                <div><strong>Budget:</strong> ₹{campaignData.budget_allocated}</div>
                <div><strong>Channels:</strong> {campaignData.channels?.join(', ')}</div>
                <div><strong>Start:</strong> {campaignData.scheduled_start}</div>
                <div><strong>End:</strong> {campaignData.scheduled_end}</div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Estimated Reach</h4>
              <p className="text-blue-700">~2,500 farmers will receive this campaign</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900">Expected Results</h4>
              <p className="text-green-700">Based on similar campaigns: 15-25% engagement rate</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Create New Campaign
        </CardTitle>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mt-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-muted-foreground text-muted-foreground'
              }`}>
                <step.icon className="h-4 w-4" />
              </div>
              <span className={`ml-2 text-sm ${
                currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="min-h-96">
          {renderStepContent()}
        </div>

        <div className="flex justify-between mt-8">
          <div>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            
            {currentStep < steps.length ? (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Create Campaign
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
