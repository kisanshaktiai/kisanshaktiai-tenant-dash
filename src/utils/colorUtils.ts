
/**
 * Comprehensive color utility functions for theme system - Mobile Optimized
 */

/**
 * Convert HEX color to HSL format without hsl() wrapper
 * @param hex - HEX color string (e.g., "#10b981")
 * @returns HSL string in format "h s% l%" (e.g., "160 84% 39%")
 */
export function hexToHsl(hex: string): string {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Validate hex input
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    console.warn('Invalid hex color:', hex);
    return '142 76% 36%'; // Fallback to agricultural green
  }
  
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
 * Validate and sanitize HSL values
 */
export function sanitizeHsl(hsl: string): string {
  try {
    const parts = hsl.trim().split(' ');
    if (parts.length !== 3) throw new Error('Invalid HSL format');
    
    const h = parseInt(parts[0]);
    const s = parseInt(parts[1].replace('%', ''));
    const l = parseInt(parts[2].replace('%', ''));
    
    // Validate ranges
    if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
      throw new Error('HSL values out of range');
    }
    
    return `${h} ${s}% ${l}%`;
  } catch (error) {
    console.warn('Invalid HSL value, using fallback:', hsl);
    return '142 76% 36%'; // Fallback to agricultural green
  }
}

/**
 * Generate semantic colors based on primary color
 */
export function generateSemanticColors(primaryHsl: string): {
  success: string;
  warning: string;
  info: string;
  destructive: string;
  border: string;
  muted: string;
} {
  const sanitizedPrimary = sanitizeHsl(primaryHsl);

  return {
    success: sanitizedPrimary, // Use primary for success (green agricultural theme)
    warning: `38 92% 50%`, // Standard warning orange
    info: `221 83% 53%`, // Standard info blue
    destructive: `0 84% 60%`, // Standard destructive red
    border: `214 32% 91%`, // Light gray border
    muted: `210 40% 96%`, // Very light gray for muted backgrounds
  };
}

/**
 * Generate mobile-optimized dark mode colors
 */
export function generateDarkModeColors(): {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  secondary: string;
  secondaryForeground: string;
  border: string;
  input: string;
} {
  return {
    background: `224 71% 4%`, // Modern dark gray (not pure black)
    foreground: `213 31% 91%`, // Light gray text
    card: `224 71% 4%`, // Same as background
    cardForeground: `213 31% 91%`, // Light gray text
    muted: `215 28% 17%`, // Dark gray for muted elements
    mutedForeground: `217 11% 65%`, // Medium gray text
    secondary: `215 28% 17%`, // Dark gray
    secondaryForeground: `213 31% 91%`, // Light gray text
    border: `215 28% 17%`, // Dark border
    input: `215 28% 17%`, // Dark input background
  };
}

/**
 * Generate mobile-optimized button states
 */
export function generateButtonStates(baseHsl: string): {
  base: string;
  hover: string;
  active: string;
  disabled: string;
} {
  const sanitizedBase = sanitizeHsl(baseHsl);
  const [h, s, l] = sanitizedBase.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });

  return {
    base: sanitizedBase,
    hover: `${h} ${s}% ${Math.max(l - 4, 5)}%`, // Slightly darker
    active: `${h} ${s}% ${Math.max(l - 8, 5)}%`, // Even darker
    disabled: `${h} ${Math.max(s - 20, 5)}% ${Math.min(l + 20, 85)}%`, // Desaturated and lighter
  };
}

/**
 * Generate status colors for different states
 */
export function generateStatusColors(isDark: boolean = false): {
  active: string;
  inactive: string;
  pending: string;
  error: string;
} {
  if (isDark) {
    return {
      active: `142 70% 45%`, // Green for active
      inactive: `217 11% 65%`, // Gray for inactive
      pending: `38 92% 50%`, // Orange for pending
      error: `0 63% 31%`, // Red for error (darker in dark mode)
    };
  }

  return {
    active: `142 76% 36%`, // Green for active
    inactive: `215 16% 47%`, // Gray for inactive
    pending: `38 92% 50%`, // Orange for pending
    error: `0 84% 60%`, // Red for error
  };
}

/**
 * Ensure WCAG AA compliance by adjusting lightness if needed
 */
export function ensureContrast(foreground: string, background: string): string {
  const sanitizedFg = sanitizeHsl(foreground);
  const sanitizedBg = sanitizeHsl(background);
  
  const [h, s, l] = sanitizedFg.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });
  
  const [, , bgL] = sanitizedBg.split(' ').map((v, i) => {
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

/**
 * Generate chart colors based on theme
 */
export function generateChartColors(primaryHsl: string, isDark: boolean = false): string[] {
  const sanitizedPrimary = sanitizeHsl(primaryHsl);
  const [h, s] = sanitizedPrimary.split(' ').map((v, i) => {
    if (i === 0) return parseInt(v);
    return parseInt(v.replace('%', ''));
  });

  if (isDark) {
    return [
      `${h} ${s}% 50%`, // Primary
      `${(h + 60) % 360} 60% 55%`, // Complementary
      `${(h + 120) % 360} 65% 60%`, // Triadic 1
      `${(h + 180) % 360} 70% 65%`, // Complementary opposite
      `${(h + 240) % 360} 75% 70%`, // Triadic 2
    ];
  }

  return [
    sanitizedPrimary, // Primary
    `${(h + 60) % 360} ${s}% 45%`, // Complementary
    `${(h + 120) % 360} ${s}% 40%`, // Triadic 1
    `${(h + 180) % 360} ${s}% 35%`, // Complementary opposite
    `${(h + 240) % 360} ${s}% 30%`, // Triadic 2
  ];
}
