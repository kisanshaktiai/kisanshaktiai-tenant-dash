import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import { useToast } from '@/hooks/use-toast';
import { Palette, Type, Image, Layout, Code, Smartphone, Save, RefreshCw, Upload, Eye, Download, Sparkles } from 'lucide-react';
import { ColorPicker } from '@/components/settings/ColorPicker';
import { BrandingUploader } from '@/components/settings/BrandingUploader';
import { LivePreview } from '@/components/settings/LivePreview';
import { cn } from '@/lib/utils';

const WhiteLabelPage = () => {
  const { settings, updateSettings, isLoading } = useAppearanceSettings();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('branding');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [localSettings, setLocalSettings] = useState<any>(settings || {
    primary_color: '#10b981',
    secondary_color: '#059669',
    accent_color: '#14b8a6',
    background_color: '#ffffff',
    text_color: '#1f2937',
    border_color: '#e5e7eb',
    muted_color: '#f3f4f6',
    font_family: 'Inter',
    theme_mode: 'system' as const,
    logo_override_url: '',
    custom_css: ''
  });

  const handleColorChange = (field: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      setUnsavedChanges(false);
      toast({
        title: "Settings saved",
        description: "White label configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Failed to update white label configuration.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setLocalSettings(settings || {});
    setUnsavedChanges(false);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(localSettings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'white-label-config.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          setLocalSettings(config);
          setUnsavedChanges(true);
          toast({
            title: "Configuration imported",
            description: "Settings have been loaded from file.",
          });
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Invalid configuration file.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="White Label Configuration"
        description="Customize the Farmer App appearance and branding"
      />

      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle>Configuration Settings</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={!unsavedChanges}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={!unsavedChanges}
                      className="bg-gradient-to-r from-primary to-accent"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-5 w-full mb-6">
                    <TabsTrigger value="branding" className="flex flex-col gap-1">
                      <Image className="h-4 w-4" />
                      <span className="text-xs">Brand</span>
                    </TabsTrigger>
                    <TabsTrigger value="colors" className="flex flex-col gap-1">
                      <Palette className="h-4 w-4" />
                      <span className="text-xs">Colors</span>
                    </TabsTrigger>
                    <TabsTrigger value="typography" className="flex flex-col gap-1">
                      <Type className="h-4 w-4" />
                      <span className="text-xs">Fonts</span>
                    </TabsTrigger>
                    <TabsTrigger value="layout" className="flex flex-col gap-1">
                      <Layout className="h-4 w-4" />
                      <span className="text-xs">Layout</span>
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex flex-col gap-1">
                      <Code className="h-4 w-4" />
                      <span className="text-xs">Advanced</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="branding" className="space-y-6">
                    <BrandingUploader
                      logoUrl={localSettings.logo_override_url}
                      onLogoChange={(url) => {
                        setLocalSettings(prev => ({ ...prev, logo_override_url: url }));
                        setUnsavedChanges(true);
                      }}
                    />
                    
                    <div className="space-y-4">
                      <div>
                        <Label>App Name</Label>
                        <Input
                          placeholder="Farmer Connect"
                          className="mt-2"
                          onChange={(e) => {
                            setLocalSettings(prev => ({ ...prev, app_name: e.target.value }));
                            setUnsavedChanges(true);
                          }}
                        />
                      </div>
                      
                      <div>
                        <Label>Tagline</Label>
                        <Input
                          placeholder="Empowering farmers with technology"
                          className="mt-2"
                          onChange={(e) => {
                            setLocalSettings(prev => ({ ...prev, tagline: e.target.value }));
                            setUnsavedChanges(true);
                          }}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="colors" className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <ColorPicker
                        label="Primary Color"
                        value={localSettings.primary_color}
                        onChange={(color) => handleColorChange('primary_color', color)}
                      />
                      <ColorPicker
                        label="Secondary Color"
                        value={localSettings.secondary_color}
                        onChange={(color) => handleColorChange('secondary_color', color)}
                      />
                      <ColorPicker
                        label="Accent Color"
                        value={localSettings.accent_color}
                        onChange={(color) => handleColorChange('accent_color', color)}
                      />
                      <ColorPicker
                        label="Background Color"
                        value={localSettings.background_color}
                        onChange={(color) => handleColorChange('background_color', color)}
                      />
                      <ColorPicker
                        label="Text Color"
                        value={localSettings.text_color}
                        onChange={(color) => handleColorChange('text_color', color)}
                      />
                      <ColorPicker
                        label="Border Color"
                        value={localSettings.border_color}
                        onChange={(color) => handleColorChange('border_color', color)}
                      />
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Pro tip: Choose colors that maintain good contrast for accessibility. 
                        The primary color should work well with white text.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="typography" className="space-y-6">
                    <div>
                      <Label>Font Family</Label>
                      <Select
                        value={localSettings.font_family}
                        onValueChange={(value) => {
                          setLocalSettings(prev => ({ ...prev, font_family: value }));
                          setUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                          <SelectItem value="Raleway">Raleway</SelectItem>
                          <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Enable Custom Fonts</Label>
                        <Switch />
                      </div>
                      
                      <div>
                        <Label>Custom Font URL</Label>
                        <Input
                          placeholder="https://fonts.googleapis.com/css2?family=..."
                          className="mt-2"
                          disabled
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="layout" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Theme Mode</Label>
                        <Select
                          value={localSettings.theme_mode}
                          onValueChange={(value) => {
                            setLocalSettings(prev => ({ ...prev, theme_mode: value }));
                            setUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Compact Mode</Label>
                          <Switch />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Show Animations</Label>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Enable Haptic Feedback</Label>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-6">
                    <div>
                      <Label>Custom CSS</Label>
                      <Textarea
                        placeholder="/* Add custom CSS here */"
                        className="mt-2 font-mono text-sm h-48"
                        value={localSettings.custom_css}
                        onChange={(e) => {
                          setLocalSettings(prev => ({ ...prev, custom_css: e.target.value }));
                          setUnsavedChanges(true);
                        }}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Config
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={handleImport}
                        />
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Config
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview */}
          <div className="space-y-6">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <CardTitle>Live Preview</CardTitle>
                  </div>
                  <div className="flex gap-1 p-1 bg-background rounded-lg">
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('tablet')}
                    >
                      <Layout className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <LivePreview 
                  colors={{
                    primary: localSettings?.primary_color || '#10b981',
                    secondary: localSettings?.secondary_color || '#059669',
                    accent: localSettings?.accent_color || '#14b8a6',
                    background: localSettings?.background_color || '#ffffff',
                    text: localSettings?.text_color || '#1f2937'
                  }}
                  appName={localSettings?.app_name}
                  logo={localSettings?.logo_override_url}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default WhiteLabelPage;
export { WhiteLabelPage };