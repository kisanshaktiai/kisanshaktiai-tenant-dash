
import { useIntl as useReactIntl } from 'react-intl';
import { useAppSelector } from '@/store/hooks';
import { type SupportedLocale } from '@/lib/i18n';

export const useTranslation = () => {
  const intl = useReactIntl();
  const locale = useAppSelector((state) => state.ui.language) as SupportedLocale;

  const t = (id: string, values?: Record<string, any>) => {
    return intl.formatMessage({ id }, values);
  };

  const formatNumber = (value: number) => {
    return intl.formatNumber(value);
  };

  const formatDate = (value: Date | number) => {
    return intl.formatDate(value, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatRelativeTime = (value: number, unit: 'second' | 'minute' | 'hour' | 'day') => {
    return intl.formatRelativeTime(value, unit);
  };

  return {
    t,
    locale,
    formatNumber,
    formatDate,
    formatRelativeTime,
  };
};
