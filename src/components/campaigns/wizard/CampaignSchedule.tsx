
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Zap, Repeat } from 'lucide-react';

interface CampaignScheduleProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const CampaignSchedule: React.FC<CampaignScheduleProps> = ({
  data,
  onUpdate,
}) => {
  const updateSchedule = (field: string, value: any) => {
    onUpdate({
      schedule: {
        ...data.schedule,
        [field]: value,
      },
    });
  };

  const timezones = [
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Campaign Timing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="immediate" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="immediate">Send Immediately</TabsTrigger>
              <TabsTrigger value="scheduled">Schedule</TabsTrigger>
              <TabsTrigger value="automated">Automated</TabsTrigger>
            </TabsList>

            <TabsContent value="immediate" className="mt-6">
              <div className="text-center p-8 bg-muted rounded-lg">
                <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-medium mb-2">Send Immediately</h3>
                <p className="text-muted-foreground">
                  Your campaign will be sent as soon as you create it.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="scheduled" className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date & Time</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={data.schedule?.start_date || ''}
                    onChange={(e) => updateSchedule('start_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date & Time (Optional)</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={data.schedule?.end_date || ''}
                    onChange={(e) => updateSchedule('end_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={data.schedule?.timezone || 'Asia/Kolkata'}
                  onValueChange={(value) => updateSchedule('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Optimal Send Time</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-700">Best Time</div>
                    <div className="text-green-600">9:00 - 11:00 AM</div>
                    <div className="text-xs text-muted-foreground">78% open rate</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="font-medium text-yellow-700">Good Time</div>
                    <div className="text-yellow-600">2:00 - 4:00 PM</div>
                    <div className="text-xs text-muted-foreground">62% open rate</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="font-medium text-red-700">Avoid</div>
                    <div className="text-red-600">8:00 - 10:00 PM</div>
                    <div className="text-xs text-muted-foreground">23% open rate</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="automated" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Automation</Label>
                  <p className="text-sm text-muted-foreground">
                    Campaign will be triggered by specific events
                  </p>
                </div>
                <Switch
                  checked={data.schedule?.is_automated || false}
                  onCheckedChange={(checked) => updateSchedule('is_automated', checked)}
                />
              </div>

              {data.schedule?.is_automated && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Automation Triggers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Trigger Event</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trigger event" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="farmer_signup">New Farmer Registration</SelectItem>
                          <SelectItem value="purchase_made">Purchase Completed</SelectItem>
                          <SelectItem value="seasonal_reminder">Seasonal Crop Reminder</SelectItem>
                          <SelectItem value="inactive_farmer">Farmer Inactive for 30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Delay (Optional)</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Send immediately" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Immediately</SelectItem>
                            <SelectItem value="1">1 hour later</SelectItem>
                            <SelectItem value="24">1 day later</SelectItem>
                            <SelectItem value="168">1 week later</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Once per event" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">Once per event</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5" />
            Follow-up Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Follow-up</Label>
              <p className="text-sm text-muted-foreground">
                Send follow-up messages based on recipient behavior
              </p>
            </div>
            <Switch />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label>If Not Opened</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="No follow-up" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No follow-up</SelectItem>
                  <SelectItem value="24h">Resend after 24 hours</SelectItem>
                  <SelectItem value="48h">Resend after 48 hours</SelectItem>
                  <SelectItem value="weekly">Resend weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>If Clicked but Not Converted</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="No follow-up" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No follow-up</SelectItem>
                  <SelectItem value="reminder">Send reminder after 3 days</SelectItem>
                  <SelectItem value="discount">Send discount offer</SelectItem>
                  <SelectItem value="personal">Personal call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
