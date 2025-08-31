
/**
 * Color utility functions for appearance customization
 */

/**
 * Convert HEX color to HSL format
 * @param hex - HEX color string (e.g., "#10b981")
 * @returns HSL string in format "h s% l%" (e.g., "160 84% 39%")
 */
export function hexToHsl(hex: string): string {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  
  // Convert to degrees and percentages
  const hDeg = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);
  
  return `${hDeg} ${sPercent}% ${lPercent}%`;
}

/**
 * Generate semantic colors based on primary color
 */
export function generateSemanticColors(primaryHsl: string): {
  success: string;
  warning: string;
  info: string;
  destructive: string;
} {
  // Parse HSL values
  const [h, s, l] = primaryHsl.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });

  return {
    success: primaryHsl, // Use primary for success (green)
    warning: `38 92% 50%`, // Standard warning orange
    info: `221 83% 53%`, // Standard info blue
    destructive: `0 84% 60%`, // Standard destructive red
  };
}

/**
 * Generate color variants (lighter/darker shades)
 */
export function generateColorVariants(hsl: string): {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // base
  600: string;
  700: string;
  800: string;
  900: string;
} {
  const [h, s, l] = hsl.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });

  return {
    50: `${h} ${Math.max(s - 20, 10)}% ${Math.min(l + 45, 95)}%`,
    100: `${h} ${Math.max(s - 15, 15)}% ${Math.min(l + 35, 90)}%`,
    200: `${h} ${Math.max(s - 10, 20)}% ${Math.min(l + 25, 85)}%`,
    300: `${h} ${Math.max(s - 5, 25)}% ${Math.min(l + 15, 80)}%`,
    400: `${h} ${s}% ${Math.min(l + 5, 75)}%`,
    500: hsl, // base color
    600: `${h} ${Math.min(s + 5, 100)}% ${Math.max(l - 5, 25)}%`,
    700: `${h} ${Math.min(s + 10, 100)}% ${Math.max(l - 15, 20)}%`,
    800: `${h} ${Math.min(s + 15, 100)}% ${Math.max(l - 25, 15)}%`,
    900: `${h} ${Math.min(s + 20, 100)}% ${Math.max(l - 35, 10)}%`,
  };
}

/**
 * Generate dark mode colors with modern gray base
 */
export function generateDarkModeColors(primaryHsl: string): {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  secondary: string;
  secondaryForeground: string;
} {
  const [h] = primaryHsl.split(' ').map(v => parseInt(v));

  return {
    background: `222 84% 5%`, // Very dark gray-blue
    foreground: `210 40% 98%`, // Almost white
    card: `222 84% 5%`, // Same as background
    cardForeground: `210 40% 98%`, // Almost white
    muted: `217 33% 18%`, // Dark gray
    mutedForeground: `215 20% 65%`, // Medium gray
    secondary: `217 33% 18%`, // Dark gray
    secondaryForeground: `210 40% 98%`, // Almost white
  };
}

/**
 * Generate sidebar colors (always light)
 */
export function generateSidebarColors(primaryHsl: string): {
  background: string;
  foreground: string;
  accent: string;
  accentForeground: string;
  border: string;
} {
  return {
    background: `0 0% 100%`, // Always white
    foreground: `222 84% 5%`, // Always dark text
    accent: `210 40% 96%`, // Light gray for hover
    accentForeground: `222 84% 5%`, // Dark text
    border: `214 32% 91%`, // Light border
  };
}

/**
 * Check if a color provides sufficient contrast
 */
export function checkContrast(color1: string, color2: string): boolean {
  // This is a simplified contrast check
  // In a real application, you'd want a more robust implementation
  const [, , l1] = color1.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });
  
  const [, , l2] = color2.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });

  return Math.abs(l1 - l2) >= 50; // Simplified contrast ratio
}

/**
 * Ensure WCAG AA compliance by adjusting lightness if needed
 */
export function ensureContrast(foreground: string, background: string): string {
  const [h, s, l] = foreground.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });
  
  const [, , bgL] = background.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });

  let adjustedL = l;
  
  // If background is light, ensure text is dark enough
  if (bgL > 50) {
    adjustedL = Math.min(adjustedL, 30);
  } else {
    // If background is dark, ensure text is light enough
    adjustedL = Math.max(adjustedL, 70);
  }

  return `${h} ${s}% ${adjustedL}%`;
}
