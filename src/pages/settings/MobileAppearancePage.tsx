import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Smartphone, 
  Palette, 
  Layout, 
  Navigation,
  Monitor,
  Settings,
  Save,
  Loader2,
  Eye,
  Download,
  Upload,
  Sparkles,
  Bell,
  Link,
  AppWindow,
  Paintbrush,
  Type,
  Square,
  Circle,
  RectangleHorizontal,
  Layers,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import { useWhiteLabelSettings } from '@/hooks/useWhiteLabelSettings';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';

interface MobileThemeConfig {
  // Core Theme Colors
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
  text_secondary_color: string;
  border_color: string;
  
  // Semantic Colors
  success_color: string;
  warning_color: string;
  error_color: string;
  info_color: string;
  
  // Dark Mode Colors
  dark_primary_color?: string;
  dark_background_color?: string;
  dark_surface_color?: string;
  dark_text_color?: string;
  dark_border_color?: string;
  
  // Gradient Colors
  gradient_start?: string;
  gradient_end?: string;
  gradient_angle?: number;
}

interface MobileUIConfig {
  // Navigation
  navigation_style: 'tab_bar' | 'drawer' | 'rail' | 'hybrid';
  navigation_position: 'bottom' | 'top' | 'side';
  navigation_icons_style: 'outlined' | 'filled' | 'rounded';
  
  // Typography
  font_family: string;
  font_size_base: number;
  font_weight_normal: number;
  font_weight_bold: number;
  line_height_base: number;
  
  // Components
  button_style: 'rounded' | 'square' | 'pill';
  button_size: 'small' | 'medium' | 'large';
  input_style: 'outlined' | 'filled' | 'underlined';
  card_style: 'flat' | 'elevated' | 'outlined';
  
  // Spacing
  spacing_unit: number;
  padding_small: number;
  padding_medium: number;
  padding_large: number;
  
  // Borders & Corners
  border_radius_small: number;
  border_radius_medium: number;
  border_radius_large: number;
  border_width: number;
  
  // Shadows
  shadow_style: 'none' | 'subtle' | 'medium' | 'strong';
  shadow_color: string;
  
  // Animations
  animations_enabled: boolean;
  animation_duration: number;
  animation_curve: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  
  // Layout
  layout_density: 'compact' | 'comfortable' | 'spacious';
  grid_columns: number;
  list_item_height: number;
}

interface MobileAppSettings {
  // App Identity
  app_name: string;
  app_tagline: string;
  app_version: string;
  
  // Icons & Images
  app_icon_url: string;
  app_logo_url: string;
  splash_screen_url: string;
  splash_background_color: string;
  splash_duration: number;
  
  // Platform Settings
  bundle_identifier: string;
  android_package_name: string;
  ios_app_id: string;
  
  // Features
  offline_mode_enabled: boolean;
  push_notifications_enabled: boolean;
  biometric_auth_enabled: boolean;
  location_services_enabled: boolean;
  camera_access_enabled: boolean;
  
  // Deep Linking
  url_scheme: string;
  universal_links_domain: string;
  deep_link_routes: string[];
  
  // Performance
  cache_strategy: 'aggressive' | 'moderate' | 'minimal';
  image_quality: 'low' | 'medium' | 'high' | 'original';
  lazy_loading_enabled: boolean;
  prefetch_enabled: boolean;
}

const MobileAppearancePage: React.FC = () => {
  const { settings, isLoading, updateSettings, isUpdating } = useWhiteLabelSettings();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState<'phone' | 'tablet'>('phone');
  const [activeTab, setActiveTab] = useState('theme');
  
  // Local state for configuration
  const [themeConfig, setThemeConfig] = useState<MobileThemeConfig>({
    primary_color: '#10b981',
    secondary_color: '#059669',
    accent_color: '#14b8a6',
    background_color: '#ffffff',
    surface_color: '#f9fafb',
    text_color: '#1f2937',
    text_secondary_color: '#6b7280',
    border_color: '#e5e7eb',
    success_color: '#10b981',
    warning_color: '#f59e0b',
    error_color: '#ef4444',
    info_color: '#3b82f6',
    gradient_start: '#10b981',
    gradient_end: '#14b8a6',
    gradient_angle: 135
  });
  
  const [uiConfig, setUIConfig] = useState<MobileUIConfig>({
    navigation_style: 'tab_bar',
    navigation_position: 'bottom',
    navigation_icons_style: 'outlined',
    font_family: 'Inter',
    font_size_base: 16,
    font_weight_normal: 400,
    font_weight_bold: 700,
    line_height_base: 1.5,
    button_style: 'rounded',
    button_size: 'medium',
    input_style: 'outlined',
    card_style: 'elevated',
    spacing_unit: 4,
    padding_small: 8,
    padding_medium: 16,
    padding_large: 24,
    border_radius_small: 4,
    border_radius_medium: 8,
    border_radius_large: 16,
    border_width: 1,
    shadow_style: 'subtle',
    shadow_color: '#000000',
    animations_enabled: true,
    animation_duration: 300,
    animation_curve: 'ease-in-out',
    layout_density: 'comfortable',
    grid_columns: 2,
    list_item_height: 64
  });
  
  const [appSettings, setAppSettings] = useState<MobileAppSettings>({
    app_name: 'Farmer App',
    app_tagline: 'Empowering Farmers',
    app_version: '1.0.0',
    app_icon_url: '',
    app_logo_url: '',
    splash_screen_url: '',
    splash_background_color: '#10b981',
    splash_duration: 3000,
    bundle_identifier: 'com.example.farmerapp',
    android_package_name: 'com.example.farmerapp',
    ios_app_id: '',
    offline_mode_enabled: true,
    push_notifications_enabled: true,
    biometric_auth_enabled: false,
    location_services_enabled: true,
    camera_access_enabled: true,
    url_scheme: 'farmerapp',
    universal_links_domain: '',
    deep_link_routes: [],
    cache_strategy: 'moderate',
    image_quality: 'high',
    lazy_loading_enabled: true,
    prefetch_enabled: false
  });

  // Load settings from database
  useEffect(() => {
    if (settings) {
      // Map settings to local state
      setThemeConfig(prev => ({
        ...prev,
        primary_color: settings.primary_color || prev.primary_color,
        secondary_color: settings.secondary_color || prev.secondary_color,
        accent_color: settings.accent_color || prev.accent_color,
        background_color: settings.background_color || prev.background_color,
        text_color: settings.text_color || prev.text_color,
        success_color: settings.success_color || prev.success_color,
        warning_color: settings.warning_color || prev.warning_color,
        error_color: settings.error_color || prev.error_color,
        info_color: settings.info_color || prev.info_color
      }));
      
      if (settings.mobile_ui_config) {
        const config = settings.mobile_ui_config as any;
        setUIConfig(prev => ({
          ...prev,
          navigation_style: config.navigation_style || prev.navigation_style,
          navigation_position: config.navigation_position || prev.navigation_position,
          navigation_icons_style: config.navigation_icons_style || prev.navigation_icons_style,
          font_family: config.font_family || prev.font_family,
          font_size_base: config.font_size_base || prev.font_size_base,
          font_weight_normal: config.font_weight_normal || prev.font_weight_normal,
          font_weight_bold: config.font_weight_bold || prev.font_weight_bold,
          line_height_base: config.line_height_base || prev.line_height_base,
          button_style: config.button_style || prev.button_style,
          button_size: config.button_size || prev.button_size,
          input_style: config.input_style || prev.input_style,
          card_style: config.card_style || prev.card_style,
          spacing_unit: config.spacing_unit || prev.spacing_unit,
          padding_small: config.padding_small || prev.padding_small,
          padding_medium: config.padding_medium || prev.padding_medium,
          padding_large: config.padding_large || prev.padding_large,
          border_radius_small: config.border_radius_small || prev.border_radius_small,
          border_radius_medium: config.border_radius_medium || prev.border_radius_medium,
          border_radius_large: config.border_radius_large || prev.border_radius_large,
          border_width: config.border_width || prev.border_width,
          shadow_style: config.shadow_style || prev.shadow_style,
          shadow_color: config.shadow_color || prev.shadow_color,
          animations_enabled: config.animations_enabled ?? prev.animations_enabled,
          animation_duration: config.animation_duration || prev.animation_duration,
          animation_curve: config.animation_curve || prev.animation_curve,
          layout_density: config.layout_density || prev.layout_density,
          grid_columns: config.grid_columns || prev.grid_columns,
          list_item_height: config.list_item_height || prev.list_item_height
        }));
      }
      
      setAppSettings(prev => ({
        ...prev,
        app_name: settings.app_name || prev.app_name,
        app_icon_url: settings.app_icon_url || prev.app_icon_url,
        app_logo_url: settings.app_logo_url || prev.app_logo_url,
        splash_screen_url: settings.app_splash_screen_url || prev.splash_screen_url,
        bundle_identifier: settings.bundle_identifier || prev.bundle_identifier,
        android_package_name: settings.android_package_name || prev.android_package_name,
        ios_app_id: settings.ios_app_id || prev.ios_app_id,
        ...(settings.mobile_features || {}),
        ...(settings.deep_link_config || {})
      }));
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings({
        // Core colors for mobile
        primary_color: themeConfig.primary_color,
        secondary_color: themeConfig.secondary_color,
        accent_color: themeConfig.accent_color,
        background_color: themeConfig.background_color,
        text_color: themeConfig.text_color,
        success_color: themeConfig.success_color,
        warning_color: themeConfig.warning_color,
        error_color: themeConfig.error_color,
        info_color: themeConfig.info_color,
        
        // App identity
        app_name: appSettings.app_name,
        app_icon_url: appSettings.app_icon_url,
        app_logo_url: appSettings.app_logo_url,
        app_splash_screen_url: appSettings.splash_screen_url,
        
        // Platform identifiers
        bundle_identifier: appSettings.bundle_identifier,
        android_package_name: appSettings.android_package_name,
        ios_app_id: appSettings.ios_app_id,
        
        // Mobile UI configuration
        mobile_ui_config: {
          ...uiConfig,
          theme: {
            ...themeConfig
          }
        },
        
        // Mobile features
        mobile_features: {
          offline_mode_enabled: appSettings.offline_mode_enabled,
          push_notifications_enabled: appSettings.push_notifications_enabled,
          biometric_auth_enabled: appSettings.biometric_auth_enabled,
          location_services_enabled: appSettings.location_services_enabled,
          camera_access_enabled: appSettings.camera_access_enabled,
          cache_strategy: appSettings.cache_strategy,
          image_quality: appSettings.image_quality,
          lazy_loading_enabled: appSettings.lazy_loading_enabled,
          prefetch_enabled: appSettings.prefetch_enabled
        },
        
        // Deep link configuration
        deep_link_config: {
          url_scheme: appSettings.url_scheme,
          universal_links_domain: appSettings.universal_links_domain,
          deep_link_routes: appSettings.deep_link_routes
        }
      });
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save mobile appearance settings:', error);
    }
  };

  const handleExport = () => {
    const exportData = {
      theme: themeConfig,
      ui: uiConfig,
      app: appSettings,
      exported_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mobile-appearance-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Configuration exported successfully');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.theme) setThemeConfig(data.theme);
          if (data.ui) setUIConfig(data.ui);
          if (data.app) setAppSettings(data.app);
          setHasUnsavedChanges(true);
          toast.success('Configuration imported successfully');
        } catch (error) {
          toast.error('Failed to import configuration');
        }
      };
      reader.readAsText(file);
    }
  };

  const MobilePreview = () => (
    <div className={`bg-background border rounded-lg ${previewMode === 'phone' ? 'w-[375px] h-[667px]' : 'w-[768px] h-[1024px]'} overflow-hidden shadow-2xl`}>
      {/* Status Bar */}
      <div className="h-6 bg-black text-white text-xs flex items-center justify-between px-4">
        <span>9:41 AM</span>
        <div className="flex gap-1">
          <span>📶</span>
          <span>📵</span>
          <span>🔋</span>
        </div>
      </div>
      
      {/* App Header */}
      <div 
        style={{ backgroundColor: themeConfig.primary_color }}
        className="h-14 flex items-center px-4 text-white"
      >
        <span className="font-semibold text-lg">{appSettings.app_name}</span>
      </div>
      
      {/* Content Area */}
      <div 
        style={{ 
          backgroundColor: themeConfig.background_color,
          color: themeConfig.text_color 
        }}
        className="flex-1 p-4 space-y-4"
      >
        {/* Sample Cards */}
        <div 
          style={{ 
            backgroundColor: themeConfig.surface_color,
            borderColor: themeConfig.border_color,
            borderRadius: `${uiConfig.border_radius_medium}px`,
            borderWidth: uiConfig.card_style === 'outlined' ? `${uiConfig.border_width}px` : 0,
            boxShadow: uiConfig.card_style === 'elevated' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
          }}
          className="p-4"
        >
          <h3 className="font-semibold mb-2">Sample Card</h3>
          <p style={{ color: themeConfig.text_secondary_color }} className="text-sm">
            This shows how your content cards will appear in the mobile app.
          </p>
        </div>
        
        {/* Sample Buttons */}
        <div className="flex gap-2">
          <button 
            style={{ 
              backgroundColor: themeConfig.primary_color,
              color: '#ffffff',
              borderRadius: uiConfig.button_style === 'rounded' ? `${uiConfig.border_radius_medium}px` : 
                           uiConfig.button_style === 'pill' ? '9999px' : '0px',
              padding: `${uiConfig.padding_small}px ${uiConfig.padding_medium}px`
            }}
          >
            Primary Button
          </button>
          <button 
            style={{ 
              backgroundColor: 'transparent',
              color: themeConfig.primary_color,
              borderColor: themeConfig.primary_color,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderRadius: uiConfig.button_style === 'rounded' ? `${uiConfig.border_radius_medium}px` : 
                           uiConfig.button_style === 'pill' ? '9999px' : '0px',
              padding: `${uiConfig.padding_small}px ${uiConfig.padding_medium}px`
            }}
          >
            Outline Button
          </button>
        </div>
        
        {/* Sample Input */}
        <input 
          style={{
            backgroundColor: uiConfig.input_style === 'filled' ? themeConfig.surface_color : 'transparent',
            borderColor: themeConfig.border_color,
            borderWidth: uiConfig.input_style === 'underlined' ? '0 0 1px 0' : '1px',
            borderStyle: 'solid',
            borderRadius: uiConfig.input_style === 'outlined' ? `${uiConfig.border_radius_small}px` : '0',
            padding: `${uiConfig.padding_small}px`,
            color: themeConfig.text_color,
            width: '100%'
          }}
          placeholder="Sample input field"
        />
      </div>
      
      {/* Bottom Navigation */}
      {uiConfig.navigation_style === 'tab_bar' && uiConfig.navigation_position === 'bottom' && (
        <div 
          style={{ 
            backgroundColor: themeConfig.surface_color,
            borderTopColor: themeConfig.border_color,
            borderTopWidth: '1px',
            borderTopStyle: 'solid'
          }}
          className="h-16 flex items-center justify-around"
        >
          {['Home', 'Products', 'Orders', 'Profile'].map((item) => (
            <div key={item} className="flex flex-col items-center">
              <div 
                style={{ color: item === 'Home' ? themeConfig.primary_color : themeConfig.text_secondary_color }}
                className="text-xs mt-1"
              >
                {item}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Mobile App Appearance"
        description="Configure the visual appearance and behavior of your mobile application"
      />
      
      <PageContent>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="xl:col-span-2 space-y-6">
            {/* Action Bar */}
            <Card>
              <CardContent className="flex justify-between items-center py-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(previewMode === 'phone' ? 'tablet' : 'phone')}
                  >
                    {previewMode === 'phone' ? <Monitor className="h-4 w-4 mr-1" /> : <Smartphone className="h-4 w-4 mr-1" />}
                    {previewMode === 'phone' ? 'Tablet View' : 'Phone View'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-1" />
                        Import
                      </span>
                    </Button>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {hasUnsavedChanges && (
                    <Badge variant="outline" className="text-amber-600">
                      Unsaved Changes
                    </Badge>
                  )}
                  <Button onClick={handleSave} disabled={!hasUnsavedChanges || isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="theme">
                  <Palette className="h-4 w-4 mr-1" />
                  Theme
                </TabsTrigger>
                <TabsTrigger value="ui">
                  <Layout className="h-4 w-4 mr-1" />
                  UI/UX
                </TabsTrigger>
                <TabsTrigger value="app">
                  <AppWindow className="h-4 w-4 mr-1" />
                  App
                </TabsTrigger>
                <TabsTrigger value="features">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <Settings className="h-4 w-4 mr-1" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* Theme Tab */}
              <TabsContent value="theme" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Color Scheme</CardTitle>
                    <CardDescription>Define the color palette for your mobile app</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Primary Colors */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Brand Colors</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries({
                          primary_color: 'Primary',
                          secondary_color: 'Secondary',
                          accent_color: 'Accent',
                          background_color: 'Background'
                        }).map(([key, label]) => (
                          <div key={key} className="space-y-2">
                            <Label>{label}</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={themeConfig[key as keyof MobileThemeConfig] as string}
                                onChange={(e) => {
                                  setThemeConfig(prev => ({ ...prev, [key]: e.target.value }));
                                  setHasUnsavedChanges(true);
                                }}
                                className="w-12 h-10 p-1"
                              />
                              <Input
                                value={themeConfig[key as keyof MobileThemeConfig] as string}
                                onChange={(e) => {
                                  setThemeConfig(prev => ({ ...prev, [key]: e.target.value }));
                                  setHasUnsavedChanges(true);
                                }}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Text Colors */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Text Colors</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries({
                          text_color: 'Primary Text',
                          text_secondary_color: 'Secondary Text',
                          surface_color: 'Surface',
                          border_color: 'Border'
                        }).map(([key, label]) => (
                          <div key={key} className="space-y-2">
                            <Label>{label}</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={themeConfig[key as keyof MobileThemeConfig] as string}
                                onChange={(e) => {
                                  setThemeConfig(prev => ({ ...prev, [key]: e.target.value }));
                                  setHasUnsavedChanges(true);
                                }}
                                className="w-12 h-10 p-1"
                              />
                              <Input
                                value={themeConfig[key as keyof MobileThemeConfig] as string}
                                onChange={(e) => {
                                  setThemeConfig(prev => ({ ...prev, [key]: e.target.value }));
                                  setHasUnsavedChanges(true);
                                }}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Semantic Colors */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Semantic Colors</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries({
                          success_color: 'Success',
                          warning_color: 'Warning',
                          error_color: 'Error',
                          info_color: 'Info'
                        }).map(([key, label]) => (
                          <div key={key} className="space-y-2">
                            <Label>{label}</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={themeConfig[key as keyof MobileThemeConfig] as string}
                                onChange={(e) => {
                                  setThemeConfig(prev => ({ ...prev, [key]: e.target.value }));
                                  setHasUnsavedChanges(true);
                                }}
                                className="w-12 h-10 p-1"
                              />
                              <Input
                                value={themeConfig[key as keyof MobileThemeConfig] as string}
                                onChange={(e) => {
                                  setThemeConfig(prev => ({ ...prev, [key]: e.target.value }));
                                  setHasUnsavedChanges(true);
                                }}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* UI/UX Tab */}
              <TabsContent value="ui" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Navigation & Layout</CardTitle>
                    <CardDescription>Configure navigation style and layout options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Navigation Style</Label>
                        <Select
                          value={uiConfig.navigation_style}
                          onValueChange={(value: any) => {
                            setUIConfig(prev => ({ ...prev, navigation_style: value }));
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tab_bar">Tab Bar</SelectItem>
                            <SelectItem value="drawer">Drawer</SelectItem>
                            <SelectItem value="rail">Navigation Rail</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Navigation Position</Label>
                        <Select
                          value={uiConfig.navigation_position}
                          onValueChange={(value: any) => {
                            setUIConfig(prev => ({ ...prev, navigation_position: value }));
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bottom">Bottom</SelectItem>
                            <SelectItem value="top">Top</SelectItem>
                            <SelectItem value="side">Side</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Layout Density</Label>
                      <Select
                        value={uiConfig.layout_density}
                        onValueChange={(value: any) => {
                          setUIConfig(prev => ({ ...prev, layout_density: value }));
                          setHasUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="comfortable">Comfortable</SelectItem>
                          <SelectItem value="spacious">Spacious</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Component Styles</CardTitle>
                    <CardDescription>Customize the appearance of UI components</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Button Style</Label>
                        <Select
                          value={uiConfig.button_style}
                          onValueChange={(value: any) => {
                            setUIConfig(prev => ({ ...prev, button_style: value }));
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rounded">Rounded</SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="pill">Pill</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Input Style</Label>
                        <Select
                          value={uiConfig.input_style}
                          onValueChange={(value: any) => {
                            setUIConfig(prev => ({ ...prev, input_style: value }));
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="outlined">Outlined</SelectItem>
                            <SelectItem value="filled">Filled</SelectItem>
                            <SelectItem value="underlined">Underlined</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Card Style</Label>
                        <Select
                          value={uiConfig.card_style}
                          onValueChange={(value: any) => {
                            setUIConfig(prev => ({ ...prev, card_style: value }));
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flat">Flat</SelectItem>
                            <SelectItem value="elevated">Elevated</SelectItem>
                            <SelectItem value="outlined">Outlined</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Shadow Style</Label>
                        <Select
                          value={uiConfig.shadow_style}
                          onValueChange={(value: any) => {
                            setUIConfig(prev => ({ ...prev, shadow_style: value }));
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="subtle">Subtle</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="strong">Strong</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Border Radius (px)</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <span className="text-xs text-muted-foreground">Small</span>
                          <Slider
                            value={[uiConfig.border_radius_small]}
                            onValueChange={([value]) => {
                              setUIConfig(prev => ({ ...prev, border_radius_small: value }));
                              setHasUnsavedChanges(true);
                            }}
                            max={20}
                            step={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs text-muted-foreground">Medium</span>
                          <Slider
                            value={[uiConfig.border_radius_medium]}
                            onValueChange={([value]) => {
                              setUIConfig(prev => ({ ...prev, border_radius_medium: value }));
                              setHasUnsavedChanges(true);
                            }}
                            max={30}
                            step={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs text-muted-foreground">Large</span>
                          <Slider
                            value={[uiConfig.border_radius_large]}
                            onValueChange={([value]) => {
                              setUIConfig(prev => ({ ...prev, border_radius_large: value }));
                              setHasUnsavedChanges(true);
                            }}
                            max={40}
                            step={1}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* App Tab */}
              <TabsContent value="app" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>App Identity</CardTitle>
                    <CardDescription>Configure your app's identity and metadata</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>App Name</Label>
                        <Input
                          value={appSettings.app_name}
                          onChange={(e) => {
                            setAppSettings(prev => ({ ...prev, app_name: e.target.value }));
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="Your App Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>App Tagline</Label>
                        <Input
                          value={appSettings.app_tagline}
                          onChange={(e) => {
                            setAppSettings(prev => ({ ...prev, app_tagline: e.target.value }));
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="Your tagline here"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>App Version</Label>
                      <Input
                        value={appSettings.app_version}
                        onChange={(e) => {
                          setAppSettings(prev => ({ ...prev, app_version: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="1.0.0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Bundle Identifier (iOS)</Label>
                      <Input
                        value={appSettings.bundle_identifier}
                        onChange={(e) => {
                          setAppSettings(prev => ({ ...prev, bundle_identifier: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="com.yourcompany.appname"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Package Name (Android)</Label>
                      <Input
                        value={appSettings.android_package_name}
                        onChange={(e) => {
                          setAppSettings(prev => ({ ...prev, android_package_name: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="com.yourcompany.appname"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>App Assets</CardTitle>
                    <CardDescription>Upload icons and splash screens</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>App Icon URL</Label>
                      <Input
                        value={appSettings.app_icon_url}
                        onChange={(e) => {
                          setAppSettings(prev => ({ ...prev, app_icon_url: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>App Logo URL</Label>
                      <Input
                        value={appSettings.app_logo_url}
                        onChange={(e) => {
                          setAppSettings(prev => ({ ...prev, app_logo_url: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Splash Screen URL</Label>
                      <Input
                        value={appSettings.splash_screen_url}
                        onChange={(e) => {
                          setAppSettings(prev => ({ ...prev, splash_screen_url: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Splash Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={appSettings.splash_background_color}
                            onChange={(e) => {
                              setAppSettings(prev => ({ ...prev, splash_background_color: e.target.value }));
                              setHasUnsavedChanges(true);
                            }}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={appSettings.splash_background_color}
                            onChange={(e) => {
                              setAppSettings(prev => ({ ...prev, splash_background_color: e.target.value }));
                              setHasUnsavedChanges(true);
                            }}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Splash Duration (ms)</Label>
                        <Input
                          type="number"
                          value={appSettings.splash_duration}
                          onChange={(e) => {
                            setAppSettings(prev => ({ ...prev, splash_duration: parseInt(e.target.value) }));
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>App Features</CardTitle>
                    <CardDescription>Enable or disable app features and permissions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {Object.entries({
                        offline_mode_enabled: 'Offline Mode',
                        push_notifications_enabled: 'Push Notifications',
                        biometric_auth_enabled: 'Biometric Authentication',
                        location_services_enabled: 'Location Services',
                        camera_access_enabled: 'Camera Access',
                        lazy_loading_enabled: 'Lazy Loading',
                        prefetch_enabled: 'Content Prefetching'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label htmlFor={key}>{label}</Label>
                          <Switch
                            id={key}
                            checked={appSettings[key as keyof MobileAppSettings] as boolean}
                            onCheckedChange={(checked) => {
                              setAppSettings(prev => ({ ...prev, [key]: checked }));
                              setHasUnsavedChanges(true);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Settings</CardTitle>
                    <CardDescription>Optimize app performance and data usage</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Cache Strategy</Label>
                      <Select
                        value={appSettings.cache_strategy}
                        onValueChange={(value: any) => {
                          setAppSettings(prev => ({ ...prev, cache_strategy: value }));
                          setHasUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aggressive">Aggressive</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Image Quality</Label>
                      <Select
                        value={appSettings.image_quality}
                        onValueChange={(value: any) => {
                          setAppSettings(prev => ({ ...prev, image_quality: value }));
                          setHasUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="original">Original</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Deep Linking</CardTitle>
                    <CardDescription>Configure deep linking and universal links</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>URL Scheme</Label>
                      <Input
                        value={appSettings.url_scheme}
                        onChange={(e) => {
                          setAppSettings(prev => ({ ...prev, url_scheme: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="yourapp://"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Universal Links Domain</Label>
                      <Input
                        value={appSettings.universal_links_domain}
                        onChange={(e) => {
                          setAppSettings(prev => ({ ...prev, universal_links_domain: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="app.yourdomain.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Deep Link Routes (one per line)</Label>
                      <Textarea
                        value={appSettings.deep_link_routes.join('\n')}
                        onChange={(e) => {
                          setAppSettings(prev => ({ 
                            ...prev, 
                            deep_link_routes: e.target.value.split('\n').filter(r => r.trim()) 
                          }));
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="/products/:id&#10;/profile&#10;/settings"
                        rows={5}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Typography</CardTitle>
                    <CardDescription>Fine-tune text appearance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Font Family</Label>
                      <Select
                        value={uiConfig.font_family}
                        onValueChange={(value) => {
                          setUIConfig(prev => ({ ...prev, font_family: value }));
                          setHasUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="SF Pro">SF Pro</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Base Font Size (px)</Label>
                        <Input
                          type="number"
                          value={uiConfig.font_size_base}
                          onChange={(e) => {
                            setUIConfig(prev => ({ ...prev, font_size_base: parseInt(e.target.value) }));
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Line Height</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={uiConfig.line_height_base}
                          onChange={(e) => {
                            setUIConfig(prev => ({ ...prev, line_height_base: parseFloat(e.target.value) }));
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Animations</CardTitle>
                    <CardDescription>Control animation behavior</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animations-enabled">Enable Animations</Label>
                      <Switch
                        id="animations-enabled"
                        checked={uiConfig.animations_enabled}
                        onCheckedChange={(checked) => {
                          setUIConfig(prev => ({ ...prev, animations_enabled: checked }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    {uiConfig.animations_enabled && (
                      <>
                        <div className="space-y-2">
                          <Label>Animation Duration (ms)</Label>
                          <Slider
                            value={[uiConfig.animation_duration]}
                            onValueChange={([value]) => {
                              setUIConfig(prev => ({ ...prev, animation_duration: value }));
                              setHasUnsavedChanges(true);
                            }}
                            max={1000}
                            step={50}
                          />
                          <span className="text-xs text-muted-foreground">{uiConfig.animation_duration}ms</span>
                        </div>

                        <div className="space-y-2">
                          <Label>Animation Curve</Label>
                          <Select
                            value={uiConfig.animation_curve}
                            onValueChange={(value: any) => {
                              setUIConfig(prev => ({ ...prev, animation_curve: value }));
                              setHasUnsavedChanges(true);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ease">Ease</SelectItem>
                              <SelectItem value="ease-in">Ease In</SelectItem>
                              <SelectItem value="ease-out">Ease Out</SelectItem>
                              <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                              <SelectItem value="linear">Linear</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="xl:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See how your app will look on mobile devices</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <MobilePreview />
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default MobileAppearancePage;