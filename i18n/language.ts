import type { SupportedLanguage } from '@/types/language';
import * as Localization from 'expo-localization';

export const resolveSupportedLanguage = (deviceLang: string): SupportedLanguage => {
  const normalized = (deviceLang || '').toLowerCase();
  if (normalized.startsWith('ar')) {
    return 'ar';
  }

  if (normalized.startsWith('en')) {
    return 'en';
  }

  return 'en';
};

export const getDeviceLanguage = (): SupportedLanguage => {
  try {
    const locales = Localization.getLocales();
    const primaryLocale = locales?.[0]?.languageCode || locales?.[0]?.languageTag || 'en';
    return resolveSupportedLanguage(primaryLocale);
  } catch (error) {
    console.warn('[i18n] Failed to detect device language:', error);
    return 'en';
  }
};
