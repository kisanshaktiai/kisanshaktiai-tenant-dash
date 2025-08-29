
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CampaignBasicInfoProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const CampaignBasicInfo: React.FC<CampaignBasicInfoProps> = ({
  data,
  onUpdate,
}) => {
  const channels = [
    { id: 'sms', label: 'SMS', description: 'Text messages to farmers' },
    { id: 'whatsapp', label: 'WhatsApp', description: 'WhatsApp messages' },
    { id: 'app', label: 'In-App', description: 'Push notifications in mobile app' },
    { id: 'email', label: 'Email', description: 'Email campaigns' },
  ];

  const handleChannelChange = (channelId: string, checked: boolean) => {
    const newChannels = checked 
      ? [...(data.channels || []), channelId]
      : (data.channels || []).filter(c => c !== channelId);
    
    onUpdate({ channels: newChannels });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={data.name || ''}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="Enter campaign name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Campaign Type *</Label>
              <Select
                value={data.campaign_type || ''}
                onValueChange={(value) => onUpdate({ campaign_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                  <SelectItem value="government_scheme">Government Scheme</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={data.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Describe your campaign objectives and strategy"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Total Budget (₹)</Label>
            <Input
              id="budget"
              type="number"
              value={data.total_budget || ''}
              onChange={(e) => onUpdate({ total_budget: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Communication Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {channels.map((channel) => (
              <div key={channel.id} className="flex items-start space-x-3">
                <Checkbox
                  id={channel.id}
                  checked={(data.channels || []).includes(channel.id)}
                  onCheckedChange={(checked) => 
                    handleChannelChange(channel.id, checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={channel.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {channel.label}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {channel.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
