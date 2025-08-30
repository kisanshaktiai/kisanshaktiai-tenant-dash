
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTenantContextOptimized } from '@/contexts/TenantContextOptimized';
import { tenantProfileService } from '@/services/TenantProfileService';

interface TenantTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
  fontFamily: string;
}

interface TenantThemeContextValue {
  theme: TenantTheme;
  updateTheme: (updates: Partial<TenantTheme>) => Promise<void>;
  resetTheme: () => void;
  isLoading: boolean;
}

const defaultTheme: TenantTheme = {
  primary: '142 76% 36%', // Green
  secondary: '142 76% 30%',
  accent: '160 76% 42%',
  background: '0 0% 100%',
  foreground: '222 84% 5%',
  muted: '210 40% 96%',
  mutedForeground: '215 16% 47%',
  border: '214 32% 91%',
  input: '214 32% 91%',
  ring: '142 76% 36%',
  fontFamily: 'Inter'
};

const TenantThemeContext = createContext<TenantThemeContextValue | undefined>(undefined);

export const useTenantTheme = () => {
  const context = useContext(TenantThemeContext);
  if (!context) {
    throw new Error('useTenantTheme must be used within a TenantThemeProvider');
  }
  return context;
};

export const TenantThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTenant } = useTenantContextOptimized();
  const [theme, setTheme] = useState<TenantTheme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(false);

  // Load theme from tenant branding
  useEffect(() => {
    if (currentTenant?.branding) {
      const branding = currentTenant.branding;
      const tenantTheme: TenantTheme = {
        primary: convertHexToHsl(branding.primary_color) || defaultTheme.primary,
        secondary: convertHexToHsl(branding.secondary_color) || defaultTheme.secondary,
        accent: convertHexToHsl(branding.accent_color) || defaultTheme.accent,
        background: convertHexToHsl(branding.background_color) || defaultTheme.background,
        foreground: convertHexToHsl(branding.text_color) || defaultTheme.foreground,
        muted: defaultTheme.muted,
        mutedForeground: defaultTheme.mutedForeground,
        border: defaultTheme.border,
        input: defaultTheme.input,
        ring: convertHexToHsl(branding.primary_color) || defaultTheme.ring,
        fontFamily: branding.font_family || defaultTheme.fontFamily
      };
      setTheme(tenantTheme);
      applyThemeToDocument(tenantTheme);
    }
  }, [currentTenant?.branding]);

  const applyThemeToDocument = (themeColors: TenantTheme) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--primary', themeColors.primary);
    root.style.setProperty('--secondary', themeColors.secondary);
    root.style.setProperty('--accent', themeColors.accent);
    root.style.setProperty('--background', themeColors.background);
    root.style.setProperty('--foreground', themeColors.foreground);
    root.style.setProperty('--muted', themeColors.muted);
    root.style.setProperty('--muted-foreground', themeColors.mutedForeground);
    root.style.setProperty('--border', themeColors.border);
    root.style.setProperty('--input', themeColors.input);
    root.style.setProperty('--ring', themeColors.ring);
    
    // Apply font family
    root.style.setProperty('--font-family', themeColors.fontFamily);
  };

  const updateTheme = async (updates: Partial<TenantTheme>) => {
    if (!currentTenant?.id) return;

    setIsLoading(true);
    try {
      const newTheme = { ...theme, ...updates };
      
      // Convert HSL back to hex for storage
      const brandingData = {
        app_name: currentTenant.name,
        logo_url: currentTenant.branding?.logo_url,
        primary_color: convertHslToHex(newTheme.primary),
        secondary_color: convertHslToHex(newTheme.secondary),
        accent_color: convertHslToHex(newTheme.accent),
        background_color: convertHslToHex(newTheme.background),
        text_color: convertHslToHex(newTheme.foreground),
        font_family: newTheme.fontFamily
      };

      await tenantProfileService.upsertBranding(currentTenant.id, brandingData);
      
      setTheme(newTheme);
      applyThemeToDocument(newTheme);
    } catch (error) {
      console.error('Failed to update theme:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    applyThemeToDocument(defaultTheme);
  };

  return (
    <TenantThemeContext.Provider value={{ theme, updateTheme, resetTheme, isLoading }}>
      {children}
    </TenantThemeContext.Provider>
  );
};

// Helper functions for color conversion
function convertHexToHsl(hex: string): string {
  if (!hex || !hex.startsWith('#')) return '';
  
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function convertHslToHex(hsl: string): string {
  const [h, s, l] = hsl.split(' ').map((val, i) => {
    if (i === 0) return parseInt(val) / 360;
    return parseInt(val.replace('%', '')) / 100;
  });

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 1/6) {
    r = c; g = x; b = 0;
  } else if (1/6 <= h && h < 2/6) {
    r = x; g = c; b = 0;
  } else if (2/6 <= h && h < 3/6) {
    r = 0; g = c; b = x;
  } else if (3/6 <= h && h < 4/6) {
    r = 0; g = x; b = c;
  } else if (4/6 <= h && h < 5/6) {
    r = x; g = 0; b = c;
  } else if (5/6 <= h && h < 1) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
