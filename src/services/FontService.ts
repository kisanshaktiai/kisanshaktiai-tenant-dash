
import { FONT_CONFIG, loadGoogleFonts, getFontStack } from '@/config/fonts';

class FontService {
  private currentFont: string = 'Inter';
  
  // Apply font system-wide
  applyFont(fontName: string) {
    console.log('Applying font globally:', fontName);
    
    try {
      const fontStack = getFontStack(fontName);
      const root = document.documentElement;
      
      // Apply to CSS custom properties
      root.style.setProperty('--font-family-primary', fontStack);
      root.style.setProperty('--font-family', fontStack);
      
      // Apply to body
      document.body.style.fontFamily = fontStack;
      
      // Load Google Fonts if needed
      if (['Inter', 'Poppins', 'JetBrains Mono', 'Roboto', 'Open Sans', 'Lato'].includes(fontName)) {
        loadGoogleFonts([fontName]);
      }
      
      // Apply to all major UI elements
      this.applyToUIElements(fontStack);
      
      this.currentFont = fontName;
      
      // Store in localStorage for persistence
      localStorage.setItem('selected-font', fontName);
      
      console.log('Font applied successfully:', fontName);
    } catch (error) {
      console.error('Error applying font:', error);
      this.applyFallbackFont();
    }
  }
  
  private applyToUIElements(fontStack: string) {
    const root = document.documentElement;
    
    // Apply to all text elements
    const textSelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'span', 'div', 'a', 'button',
      'input', 'textarea', 'select', 'label',
      '.text-sm', '.text-base', '.text-lg', '.text-xl',
      '[class*="text-"]'
    ];
    
    // Create a style element for global font application
    let styleElement = document.getElementById('global-font-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'global-font-styles';
      document.head.appendChild(styleElement);
    }
    
    const globalStyles = `
      * {
        font-family: ${fontStack} !important;
      }
      
      .font-mono, code, pre {
        font-family: ${FONT_CONFIG.mono.stack} !important;
      }
      
      /* Ensure headings use the selected font */
      h1, h2, h3, h4, h5, h6 {
        font-family: ${fontStack} !important;
      }
      
      /* Apply to all form elements */
      input, textarea, select, button {
        font-family: ${fontStack} !important;
      }
      
      /* Apply to navigation and UI components */
      nav, .nav, .sidebar, .menu {
        font-family: ${fontStack} !important;
      }
      
      /* Apply to cards and content areas */
      .card, .content, .panel {
        font-family: ${fontStack} !important;
      }
    `;
    
    styleElement.textContent = globalStyles;
  }
  
  private applyFallbackFont() {
    console.log('Applying fallback font');
    const fallbackStack = FONT_CONFIG.primary.stack;
    document.body.style.fontFamily = fallbackStack;
    document.documentElement.style.setProperty('--font-family', fallbackStack);
  }
  
  // Initialize font on app startup
  initializeFont() {
    const savedFont = localStorage.getItem('selected-font') || 'Inter';
    this.applyFont(savedFont);
  }
  
  // Get current font
  getCurrentFont(): string {
    return this.currentFont;
  }
  
  // Reset to default font
  resetToDefault() {
    this.applyFont('Inter');
  }
}

export const fontService = new FontService();
