
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Palette,
  Type,
  Image,
  Layout,
  Puzzle,
  Eye,
  Save,
  RefreshCw,
  Sparkles,
  Crown
} from 'lucide-react';

export const AdvancedThemeCustomization: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('colors');
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveTheme = async () => {
    setIsLoading(true);
    try {
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Theme saved successfully",
        description: "Your custom theme has been applied.",
      });
    } catch (error) {
      toast({
        title: "Failed to save theme",
        description: "There was an error saving your theme.",
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
            Design and customize your organization's visual identity
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="preview-mode" className="text-sm font-medium">Live Preview</Label>
            <Switch
              id="preview-mode"
              checked={previewMode}
              onCheckedChange={setPreviewMode}
            />
          </div>
          
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
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Color Palette</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { name: 'Primary', color: 'hsl(var(--primary))', var: '--primary' },
                        { name: 'Secondary', color: 'hsl(var(--secondary))', var: '--secondary' },
                        { name: 'Accent', color: 'hsl(var(--accent))', var: '--accent' },
                        { name: 'Muted', color: 'hsl(var(--muted))', var: '--muted' }
                      ].map((colorItem) => (
                        <div key={colorItem.name} className="space-y-2">
                          <Label className="text-sm font-medium">{colorItem.name}</Label>
                          <div 
                            className="w-full h-12 rounded-lg border cursor-pointer hover:scale-105 transition-transform"
                            style={{ backgroundColor: colorItem.color }}
                          />
                          <p className="text-xs text-muted-foreground font-mono">{colorItem.var}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="typography" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Typography Settings</h3>
                    <div className="space-y-4">
                      <h1 className="text-4xl font-bold">Heading 1</h1>
                      <h2 className="text-3xl font-semibold">Heading 2</h2>
                      <h3 className="text-2xl font-medium">Heading 3</h3>
                      <p className="text-base">Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                      <p className="text-sm text-muted-foreground">Small text - Secondary information</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="branding" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Brand Identity</h3>
                    <p className="text-muted-foreground">Upload your logo and manage brand assets</p>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Image className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">Upload your logo</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="layout" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Layout Options</h3>
                    <p className="text-muted-foreground">Customize spacing, borders, and layout structure</p>
                    <div className="space-y-2">
                      <Label>Border Radius</Label>
                      <div className="flex gap-2">
                        {['None', 'Small', 'Medium', 'Large'].map((radius) => (
                          <Button key={radius} variant="outline" size="sm">
                            {radius}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="components" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Component Styles</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">Buttons</Label>
                        <div className="flex gap-2">
                          <Button>Primary</Button>
                          <Button variant="secondary">Secondary</Button>
                          <Button variant="outline">Outline</Button>
                          <Button variant="ghost">Ghost</Button>
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block">Cards</Label>
                        <Card className="w-full max-w-sm">
                          <CardHeader>
                            <CardTitle>Sample Card</CardTitle>
                            <CardDescription>This is a sample card description</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">Card content goes here</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="xl:col-span-4">
          <div className="sticky top-6 space-y-4">
            {previewMode && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Live Preview
                  </CardTitle>
                  <CardDescription>
                    See your changes in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-background">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded" />
                        <div>
                          <h4 className="font-semibold">Sample Dashboard</h4>
                          <p className="text-sm text-muted-foreground">Preview your theme</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm">Action</Button>
                        <Button variant="outline" size="sm">Cancel</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Theme Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">
                  Import Theme
                </Button>
                <Button variant="outline" className="w-full">
                  Export Theme
                </Button>
                <Button variant="outline" className="w-full">
                  Reset to Default
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
