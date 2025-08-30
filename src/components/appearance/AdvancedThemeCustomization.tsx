
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPaletteManager } from './ColorPaletteManager';
import { TypographyManager } from './TypographyManager';
import { BrandIdentityManager } from './BrandIdentityManager';
import { ComponentThemeManager } from './ComponentThemeManager';
import { LayoutCustomizer } from './LayoutCustomizer';
import { ThemePreviewPanel } from './ThemePreviewPanel';
import { ThemeImportExport } from './ThemeImportExport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { useToast } from '@/hooks/use-toast';
import {
  Palette,
  Type,
  Image,
  Layout,
  Puzzle,
  Eye,
  Download,
  Upload,
  Save,
  RefreshCw,
  Sparkles,
  Crown,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

export const AdvancedThemeCustomization: React.FC = () => {
  const { currentTenant } = useTenantContextOptimized();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('colors');
  const [previewMode, setPreviewMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveTheme = async () => {
    setIsLoading(true);
    try {
      // Save theme logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast({
        title: "Theme saved successfully",
        description: "Your custom theme has been applied across your organization.",
      });
    } catch (error) {
      toast({
        title: "Failed to save theme",
        description: "There was an error saving your theme. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tabConfig = [
    {
      value: 'colors',
      label: 'Colors',
      icon: Palette,
      description: 'Color palettes and brand colors'
    },
    {
      value: 'typography',
      label: 'Typography',
      icon: Type,
      description: 'Fonts, sizes, and text styles'
    },
    {
      value: 'branding',
      label: 'Branding',
      icon: Image,
      description: 'Logo, icons, and brand assets'
    },
    {
      value: 'layout',
      label: 'Layout',
      icon: Layout,
      description: 'Spacing, borders, and structure'
    },
    {
      value: 'components',
      label: 'Components',
      icon: Puzzle,
      description: 'Button styles and UI elements'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Appearance Studio
            </h1>
            <Badge variant="secondary" className="gap-1">
              <Crown className="w-3 h-3" />
              Pro
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Design and customize your organization's visual identity with professional tools
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Preview Controls */}
          <div className="flex items-center gap-2">
            <Label htmlFor="preview-mode" className="text-sm font-medium">Live Preview</Label>
            <Switch
              id="preview-mode"
              checked={previewMode}
              onCheckedChange={setPreviewMode}
            />
          </div>
          
          {previewMode && (
            <div className="flex items-center border rounded-lg p-1">
              {[
                { value: 'desktop', icon: Monitor, label: 'Desktop' },
                { value: 'tablet', icon: Tablet, label: 'Tablet' },
                { value: 'mobile', icon: Smartphone, label: 'Mobile' }
              ].map((device) => (
                <Button
                  key={device.value}
                  variant={previewDevice === device.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewDevice(device.value as any)}
                  className="h-8 px-3"
                >
                  <device.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          )}
          
          <Button
            onClick={handleSaveTheme}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Theme
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Theme Customization
              </CardTitle>
              <CardDescription>
                Customize every aspect of your application's appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-5 w-full mb-6">
                  {tabConfig.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="flex items-center gap-2 text-xs"
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="colors" className="space-y-6">
                  <ColorPaletteManager />
                </TabsContent>

                <TabsContent value="typography" className="space-y-6">
                  <TypographyManager />
                </TabsContent>

                <TabsContent value="branding" className="space-y-6">
                  <BrandIdentityManager />
                </TabsContent>

                <TabsContent value="layout" className="space-y-6">
                  <LayoutCustomizer />
                </TabsContent>

                <TabsContent value="components" className="space-y-6">
                  <ComponentThemeManager />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="xl:col-span-4">
          <div className="sticky top-6 space-y-4">
            {previewMode && (
              <ThemePreviewPanel device={previewDevice} />
            )}
            
            <ThemeImportExport />
          </div>
        </div>
      </div>
    </div>
  );
};
