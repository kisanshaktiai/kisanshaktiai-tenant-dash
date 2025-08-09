
import React, { createContext, useContext, ReactNode } from 'react';
import { IntlProvider as ReactIntlProvider } from 'react-intl';
import { useAppSelector } from '@/store/hooks';
import { messages, DEFAULT_LOCALE, type SupportedLocale } from '@/lib/i18n';

interface IntlContextType {
  locale: SupportedLocale;
  formatMessage: (id: string, values?: Record<string, any>) => string;
}

const IntlContext = createContext<IntlContextType | undefined>(undefined);

interface IntlProviderProps {
  children: ReactNode;
}

export const IntlProvider: React.FC<IntlProviderProps> = ({ children }) => {
  const language = useAppSelector((state) => state.ui.language) as SupportedLocale;
  const locale = language || DEFAULT_LOCALE;

  const contextValue: IntlContextType = {
    locale,
    formatMessage: (id: string, values?: Record<string, any>) => {
      const message = messages[locale]?.[id as keyof typeof messages[typeof locale]] || 
                     messages[DEFAULT_LOCALE]?.[id as keyof typeof messages[typeof DEFAULT_LOCALE]] || 
                     id;
      
      // Simple ICU message interpolation for basic cases
      if (values && typeof message === 'string') {
        return Object.keys(values).reduce((result, key) => {
          const value = values[key];
          return result.replace(new RegExp(`{${key}}`, 'g'), String(value));
        }, message);
      }
      
      return typeof message === 'string' ? message : id;
    }
  };

  return (
    <ReactIntlProvider
      locale={locale}
      messages={messages[locale] || messages[DEFAULT_LOCALE]}
      defaultLocale={DEFAULT_LOCALE}
    >
      <IntlContext.Provider value={contextValue}>
        {children}
      </IntlContext.Provider>
    </ReactIntlProvider>
  );
};

export const useIntl = () => {
  const context = useContext(IntlContext);
  if (context === undefined) {
    throw new Error('useIntl must be used within an IntlProvider');
  }
  return context;
};
