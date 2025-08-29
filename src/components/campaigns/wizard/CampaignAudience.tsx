
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Wheat, Target, Plus, X } from 'lucide-react';
import { campaignService } from '@/services/CampaignService';

interface CampaignAudienceProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const CampaignAudience: React.FC<CampaignAudienceProps> = ({
  data,
  onUpdate,
}) => {
  const [segments, setSegments] = useState([]);
  const [customCriteria, setCustomCriteria] = useState([]);
  const [estimatedSize, setEstimatedSize] = useState(0);

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    try {
      const segmentData = await campaignService.getSegments();
      setSegments(segmentData);
    } catch (error) {
      console.error('Error loading segments:', error);
    }
  };

  const handleSegmentToggle = (segmentId: string, checked: boolean) => {
    const currentSegments = data.target_audience?.segments || [];
    const newSegments = checked
      ? [...currentSegments, segmentId]
      : currentSegments.filter(s => s !== segmentId);
    
    onUpdate({
      target_audience: {
        ...data.target_audience,
        segments: newSegments,
      },
    });
    
    calculateEstimatedSize();
  };

  const addCustomCriterion = () => {
    setCustomCriteria([
      ...customCriteria,
      { field: '', operator: 'equals', value: '', logic: 'AND' },
    ]);
  };

  const updateCustomCriterion = (index: number, criterion: any) => {
    const newCriteria = [...customCriteria];
    newCriteria[index] = criterion;
    setCustomCriteria(newCriteria);
    
    onUpdate({
      target_audience: {
        ...data.target_audience,
        criteria: { custom: newCriteria },
      },
    });
    
    calculateEstimatedSize();
  };

  const removeCustomCriterion = (index: number) => {
    const newCriteria = customCriteria.filter((_, i) => i !== index);
    setCustomCriteria(newCriteria);
    
    onUpdate({
      target_audience: {
        ...data.target_audience,
        criteria: { custom: newCriteria },
      },
    });
  };

  const calculateEstimatedSize = async () => {
    try {
      const size = await campaignService.calculateSegmentSize(data.target_audience || {});
      setEstimatedSize(size);
    } catch (error) {
      console.error('Error calculating segment size:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Target Audience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-medium">Estimated Reach</h4>
              <p className="text-sm text-muted-foreground">
                Based on selected criteria
              </p>
            </div>
            <div className="text-2xl font-bold text-primary">
              {estimatedSize.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Predefined Segments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {segments.map((segment: any) => (
              <div key={segment.id} className="flex items-start space-x-3">
                <Checkbox
                  id={segment.id}
                  checked={(data.target_audience?.segments || []).includes(segment.id)}
                  onCheckedChange={(checked) => 
                    handleSegmentToggle(segment.id, checked as boolean)
                  }
                />
                <div className="flex-1">
                  <label
                    htmlFor={segment.id}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {segment.name}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {segment.description}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    ~{segment.estimated_size} farmers
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Custom Criteria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customCriteria.map((criterion, index) => (
            <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
              {index > 0 && (
                <Select
                  value={criterion.logic}
                  onValueChange={(value) =>
                    updateCustomCriterion(index, { ...criterion, logic: value })
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <Select
                value={criterion.field}
                onValueChange={(value) =>
                  updateCustomCriterion(index, { ...criterion, field: value })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="crop_type">Crop Type</SelectItem>
                  <SelectItem value="land_size">Land Size</SelectItem>
                  <SelectItem value="engagement">Engagement Level</SelectItem>
                  <SelectItem value="last_purchase">Last Purchase</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={criterion.operator}
                onValueChange={(value) =>
                  updateCustomCriterion(index, { ...criterion, operator: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="not_equals">Not Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Value"
                value={criterion.value}
                onChange={(e) =>
                  updateCustomCriterion(index, { ...criterion, value: e.target.value })
                }
                className="flex-1"
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCustomCriterion(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addCustomCriterion}>
            <Plus className="w-4 h-4 mr-2" />
            Add Criterion
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
