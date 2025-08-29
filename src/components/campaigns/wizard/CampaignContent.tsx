
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Smartphone, Monitor, Languages, TestTube } from 'lucide-react';
import { campaignService } from '@/services/CampaignService';

interface CampaignContentProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const CampaignContent: React.FC<CampaignContentProps> = ({
  data,
  onUpdate,
}) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('mobile');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templateData = await campaignService.getTemplates();
      setTemplates(templateData);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    onUpdate({
      content: {
        ...data.content,
        template_id: template.id,
        subject: template.content.subject || '',
        body: template.content.body || '',
      },
    });
  };

  const updateContent = (field: string, value: any) => {
    onUpdate({
      content: {
        ...data.content,
        [field]: value,
      },
    });
  };

  const personalizationTokens = [
    { token: '{farmer_name}', description: 'Farmer\'s name' },
    { token: '{location}', description: 'Farmer\'s location' },
    { token: '{crop_type}', description: 'Primary crop' },
    { token: '{last_purchase}', description: 'Last purchase date' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Content Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
            {templates.map((template: any) => (
              <div
                key={template.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-muted-foreground/50'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {template.template_type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {template.description}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">
                    Used {template.usage_count} times
                  </Badge>
                  {template.performance_score && (
                    <Badge variant="outline" className="text-xs">
                      {template.performance_score}% effective
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={data.content?.subject || ''}
                onChange={(e) => updateContent('subject', e.target.value)}
                placeholder="Enter subject line"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message Content</Label>
              <Textarea
                id="body"
                value={data.content?.body || ''}
                onChange={(e) => updateContent('body', e.target.value)}
                placeholder="Enter your message content"
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label>Personalization Tokens</Label>
              <div className="grid grid-cols-2 gap-2">
                {personalizationTokens.map((token) => (
                  <Button
                    key={token.token}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentBody = data.content?.body || '';
                      updateContent('body', currentBody + token.token);
                    }}
                  >
                    {token.token}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Preview
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('mobile')}
              >
                <Smartphone className="w-4 h-4 mr-1" />
                Mobile
              </Button>
              <Button
                variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('desktop')}
              >
                <Monitor className="w-4 h-4 mr-1" />
                Desktop
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`border rounded-lg p-4 ${previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'}`}>
              <div className="font-medium mb-2">
                {data.content?.subject || 'Subject line will appear here'}
              </div>
              <div className="text-sm whitespace-pre-wrap">
                {data.content?.body?.replace(/\{farmer_name\}/g, 'John Doe')
                  .replace(/\{location\}/g, 'Maharashtra')
                  .replace(/\{crop_type\}/g, 'Rice')
                  .replace(/\{last_purchase\}/g, '15 days ago') || 
                  'Message content will appear here'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            A/B Testing Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single" className="w-full">
            <TabsList>
              <TabsTrigger value="single">Single Version</TabsTrigger>
              <TabsTrigger value="ab_test">A/B Test</TabsTrigger>
            </TabsList>
            <TabsContent value="single" className="mt-4">
              <p className="text-sm text-muted-foreground">
                Your campaign will use a single version of the content above.
              </p>
            </TabsContent>
            <TabsContent value="ab_test" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Version A (50%)</Label>
                  <Textarea
                    placeholder="Alternative subject line"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Version B (50%)</Label>
                  <Textarea
                    placeholder="Alternative message content"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label>Test Duration:</Label>
                <Select defaultValue="24">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
