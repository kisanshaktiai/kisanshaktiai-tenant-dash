import { FONT_CONFIG, loadGoogleFonts, getFontStack } from '@/config/fonts';

class FontService {
  private currentFont: string = 'Inter';
  private initialized = false;
  
  applyFont(fontName: string) {
    try {
      const fontStack = getFontStack(fontName);
      const root = document.documentElement;
      
      root.style.setProperty('--font-family-primary', fontStack);
      root.style.setProperty('--font-family', fontStack);
      document.body.style.fontFamily = fontStack;
      
      if (['Inter', 'Poppins', 'JetBrains Mono', 'Roboto', 'Open Sans', 'Lato'].includes(fontName)) {
        loadGoogleFonts([fontName]);
      }
      
      this.applyToUIElements(fontStack);
      this.currentFont = fontName;
      localStorage.setItem('selected-font', fontName);
    } catch {
      this.applyFallbackFont();
    }
  }
  
  private applyToUIElements(fontStack: string) {
    let styleElement = document.getElementById('global-font-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'global-font-styles';
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      * { font-family: ${fontStack} !important; }
      .font-mono, code, pre { font-family: ${FONT_CONFIG.mono.stack} !important; }
      h1, h2, h3, h4, h5, h6 { font-family: ${fontStack} !important; }
      input, textarea, select, button { font-family: ${fontStack} !important; }
    `;
  }
  
  private applyFallbackFont() {
    const fallbackStack = FONT_CONFIG.primary.stack;
    document.body.style.fontFamily = fallbackStack;
    document.documentElement.style.setProperty('--font-family', fallbackStack);
  }
  
  initializeFont() {
    if (this.initialized) return;
    this.initialized = true;
    const savedFont = localStorage.getItem('selected-font') || 'Inter';
    this.applyFont(savedFont);
  }
  
  getCurrentFont(): string {
    return this.currentFont;
  }
  
  resetToDefault() {
    this.applyFont('Inter');
  }
}

export const fontService = new FontService();
