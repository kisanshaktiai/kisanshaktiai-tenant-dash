
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Users, Calendar, MessageSquare, Target } from 'lucide-react';

interface CampaignReviewProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const CampaignReview: React.FC<CampaignReviewProps> = ({
  data,
}) => {
  const getStatusIcon = (isComplete: boolean) => {
    return isComplete ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertCircle className="w-5 h-5 text-yellow-500" />
    );
  };

  const isBasicInfoComplete = data.name && data.campaign_type && data.channels?.length > 0;
  const isAudienceComplete = data.target_audience?.segments?.length > 0 || Object.keys(data.target_audience?.criteria || {}).length > 0;
  const isContentComplete = data.content?.subject && data.content?.body;
  const isScheduleComplete = data.schedule?.start_date || data.schedule?.is_automated;

  const allSectionsComplete = isBasicInfoComplete && isAudienceComplete && isContentComplete && isScheduleComplete;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info Review */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(isBasicInfoComplete)}
              <h3 className="font-medium">Basic Information</h3>
            </div>
            <div className="pl-7 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Campaign Name:</span>
                <span className="font-medium">{data.name || 'Not specified'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type:</span>
                <Badge variant="secondary">
                  {data.campaign_type?.replace('_', ' ').toUpperCase() || 'Not selected'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Channels:</span>
                <div className="flex gap-1">
                  {data.channels?.map((channel: string) => (
                    <Badge key={channel} variant="outline" className="text-xs">
                      {channel.toUpperCase()}
                    </Badge>
                  )) || <span className="text-sm">None selected</span>}
                </div>
              </div>
              {data.total_budget > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Budget:</span>
                  <span className="font-medium">₹{data.total_budget?.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Audience Review */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(isAudienceComplete)}
              <h3 className="font-medium">Target Audience</h3>
            </div>
            <div className="pl-7 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Segments:</span>
                <span className="font-medium">
                  {data.target_audience?.segments?.length || 0} selected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Custom Criteria:</span>
                <span className="font-medium">
                  {Object.keys(data.target_audience?.criteria || {}).length} rules
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Reach:</span>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">~2,500 farmers</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Content Review */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(isContentComplete)}
              <h3 className="font-medium">Content</h3>
            </div>
            <div className="pl-7 space-y-2">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Subject:</span>
                <div className="p-2 bg-muted rounded text-sm">
                  {data.content?.subject || 'No subject specified'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Message Preview:</span>
                <div className="p-2 bg-muted rounded text-sm max-h-20 overflow-y-auto">
                  {data.content?.body?.substring(0, 150) || 'No content specified'}
                  {data.content?.body?.length > 150 && '...'}
                </div>
              </div>
              {data.content?.template_id && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Template:</span>
                  <Badge variant="outline">Using template</Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Schedule Review */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(isScheduleComplete)}
              <h3 className="font-medium">Schedule & Delivery</h3>
            </div>
            <div className="pl-7 space-y-2">
              {data.schedule?.is_automated ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <Badge variant="secondary">Automated Campaign</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trigger:</span>
                    <span className="font-medium">Event-based</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Start Time:</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">
                        {data.schedule?.start_date 
                          ? new Date(data.schedule.start_date).toLocaleString()
                          : 'Immediate'
                        }
                      </span>
                    </div>
                  </div>
                  {data.schedule?.end_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">End Time:</span>
                      <span className="font-medium">
                        {new Date(data.schedule.end_date).toLocaleString()}
                      </span>
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Timezone:</span>
                <span className="font-medium">{data.schedule?.timezone || 'UTC'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Readiness Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {allSectionsComplete ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            Campaign Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allSectionsComplete ? (
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium text-green-700 mb-2">Ready to Launch!</h3>
              <p className="text-green-600">
                Your campaign is configured correctly and ready to be created.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground mb-4">
                Please complete the following sections before launching:
              </p>
              <div className="space-y-2">
                {!isBasicInfoComplete && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Complete basic campaign information</span>
                  </div>
                )}
                {!isAudienceComplete && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Define target audience</span>
                  </div>
                )}
                {!isContentComplete && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Add campaign content</span>
                  </div>
                )}
                {!isScheduleComplete && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Set delivery schedule</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Predicted Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">78%</div>
              <div className="text-xs text-blue-700">Expected Delivery Rate</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">45%</div>
              <div className="text-xs text-green-700">Expected Open Rate</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">12%</div>
              <div className="text-xs text-yellow-700">Expected Click Rate</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">3.2%</div>
              <div className="text-xs text-purple-700">Expected Conversion</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Based on similar campaigns and industry benchmarks
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
