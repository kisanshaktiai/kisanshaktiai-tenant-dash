import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Leaf, Moon, Sun, Zap, Flower, Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'modern' | 'professional' | 'playful' | 'elegant';
  colors: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    border_color: string;
    muted_color: string;
    success_color: string;
    warning_color: string;
    error_color: string;
    info_color: string;
  };
  styles: {
    font_family: string;
    button_style: string;
    input_style: string;
    card_style: string;
    navigation_style: string;
    animations_enabled: boolean;
  };
}

export const themePresets: ThemePreset[] = [
  {
    id: 'agri-green',
    name: 'Agricultural Green',
    description: 'Nature-inspired theme perfect for farming applications',
    icon: <Leaf className="h-5 w-5" />,
    category: 'professional',
    colors: {
      primary_color: '#10b981',
      secondary_color: '#059669',
      accent_color: '#14b8a6',
      background_color: '#ffffff',
      text_color: '#1f2937',
      border_color: '#e5e7eb',
      muted_color: '#f3f4f6',
      success_color: '#10b981',
      warning_color: '#f59e0b',
      error_color: '#ef4444',
      info_color: '#3b82f6'
    },
    styles: {
      font_family: 'Inter',
      button_style: 'rounded',
      input_style: 'outlined',
      card_style: 'elevated',
      navigation_style: 'sidebar',
      animations_enabled: true
    }
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Professional and trustworthy business theme',
    icon: <Zap className="h-5 w-5" />,
    category: 'professional',
    colors: {
      primary_color: '#3b82f6',
      secondary_color: '#2563eb',
      accent_color: '#1e40af',
      background_color: '#ffffff',
      text_color: '#1e293b',
      border_color: '#e2e8f0',
      muted_color: '#f8fafc',
      success_color: '#22c55e',
      warning_color: '#eab308',
      error_color: '#ef4444',
      info_color: '#06b6d4'
    },
    styles: {
      font_family: 'Plus Jakarta Sans',
      button_style: 'sharp',
      input_style: 'bordered',
      card_style: 'flat',
      navigation_style: 'sidebar',
      animations_enabled: false
    }
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm and energetic theme with vibrant colors',
    icon: <Sun className="h-5 w-5" />,
    category: 'playful',
    colors: {
      primary_color: '#fb923c',
      secondary_color: '#f97316',
      accent_color: '#ea580c',
      background_color: '#fffbf5',
      text_color: '#451a03',
      border_color: '#fed7aa',
      muted_color: '#fff7ed',
      success_color: '#84cc16',
      warning_color: '#fbbf24',
      error_color: '#dc2626',
      info_color: '#0ea5e9'
    },
    styles: {
      font_family: 'Poppins',
      button_style: 'pill',
      input_style: 'filled',
      card_style: 'bordered',
      navigation_style: 'topbar',
      animations_enabled: true
    }
  },
  {
    id: 'dark-mode',
    name: 'Dark Elegance',
    description: 'Sophisticated modern theme with deep accent colors',
    icon: <Moon className="h-5 w-5" />,
    category: 'elegant',
    colors: {
      primary_color: '#6366f1',
      secondary_color: '#4f46e5',
      accent_color: '#818cf8',
      background_color: '#ffffff',
      text_color: '#0f172a',
      border_color: '#e2e8f0',
      muted_color: '#f8fafc',
      success_color: '#10b981',
      warning_color: '#f59e0b',
      error_color: '#ef4444',
      info_color: '#06b6d4'
    },
    styles: {
      font_family: 'Inter',
      button_style: 'rounded',
      input_style: 'outlined',
      card_style: 'glassmorphism',
      navigation_style: 'sidebar',
      animations_enabled: true
    }
  },
  {
    id: 'minimalist',
    name: 'Minimalist White',
    description: 'Clean and simple design with subtle accents',
    icon: <Sparkles className="h-5 w-5" />,
    category: 'elegant',
    colors: {
      primary_color: '#18181b',
      secondary_color: '#71717a',
      accent_color: '#3f3f46',
      background_color: '#ffffff',
      text_color: '#18181b',
      border_color: '#f4f4f5',
      muted_color: '#fafafa',
      success_color: '#16a34a',
      warning_color: '#ca8a04',
      error_color: '#dc2626',
      info_color: '#2563eb'
    },
    styles: {
      font_family: 'SF Pro Display',
      button_style: 'sharp',
      input_style: 'minimal',
      card_style: 'flat',
      navigation_style: 'sidebar',
      animations_enabled: false
    }
  },
  {
    id: 'earth-tones',
    name: 'Earth Tones',
    description: 'Natural and organic modern palette',
    icon: <Mountain className="h-5 w-5" />,
    category: 'professional',
    colors: {
      primary_color: '#7c2d12',
      secondary_color: '#9a3412',
      accent_color: '#c2410c',
      background_color: '#ffffff',
      text_color: '#18181b',
      border_color: '#f4f4f5',
      muted_color: '#fafaf9',
      success_color: '#65a30d',
      warning_color: '#d97706',
      error_color: '#dc2626',
      info_color: '#2563eb'
    },
    styles: {
      font_family: 'Merriweather',
      button_style: 'rounded',
      input_style: 'bordered',
      card_style: 'elevated',
      navigation_style: 'sidebar',
      animations_enabled: true
    }
  },
  {
    id: 'spring-blossom',
    name: 'Spring Blossom',
    description: 'Fresh and modern theme with vibrant accents',
    icon: <Flower className="h-5 w-5" />,
    category: 'playful',
    colors: {
      primary_color: '#e11d48',
      secondary_color: '#be123c',
      accent_color: '#f43f5e',
      background_color: '#ffffff',
      text_color: '#18181b',
      border_color: '#f4f4f5',
      muted_color: '#fafafa',
      success_color: '#22c55e',
      warning_color: '#facc15',
      error_color: '#ef4444',
      info_color: '#3b82f6'
    },
    styles: {
      font_family: 'Quicksand',
      button_style: 'pill',
      input_style: 'filled',
      card_style: 'bordered',
      navigation_style: 'topbar',
      animations_enabled: true
    }
  }
];

interface ThemePresetsProps {
  selectedTheme?: string;
  onSelectTheme: (preset: ThemePreset) => void;
}

export function ThemePresets({ selectedTheme, onSelectTheme }: ThemePresetsProps) {
  const categories = ['all', 'modern', 'professional', 'playful', 'elegant'] as const;
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[number]>('all');

  const filteredThemes = selectedCategory === 'all' 
    ? themePresets 
    : themePresets.filter(theme => theme.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredThemes.map((theme) => (
          <Card
            key={theme.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              selectedTheme === theme.id && "ring-2 ring-primary"
            )}
            onClick={() => onSelectTheme(theme)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {theme.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{theme.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {theme.category}
                    </Badge>
                  </div>
                </div>
                {selectedTheme === theme.id && (
                  <div className="p-1 rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs mb-3">
                {theme.description}
              </CardDescription>
              
              {/* Color Preview */}
              <div className="flex gap-1 mb-3">
                <div
                  className="h-8 w-8 rounded-lg border"
                  style={{ backgroundColor: theme.colors.primary_color }}
                  title="Primary"
                />
                <div
                  className="h-8 w-8 rounded-lg border"
                  style={{ backgroundColor: theme.colors.secondary_color }}
                  title="Secondary"
                />
                <div
                  className="h-8 w-8 rounded-lg border"
                  style={{ backgroundColor: theme.colors.accent_color }}
                  title="Accent"
                />
                <div
                  className="h-8 w-8 rounded-lg border"
                  style={{ backgroundColor: theme.colors.background_color }}
                  title="Background"
                />
              </div>

              {/* Style Info */}
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {theme.styles.font_family}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {theme.styles.button_style}
                </Badge>
                {theme.styles.animations_enabled && (
                  <Badge variant="outline" className="text-xs">
                    Animated
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}