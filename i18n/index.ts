import ar from '@/i18n/locales/ar.json';
import en from '@/i18n/locales/en.json';
import type { SupportedLanguage } from '@/types/language';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
} as const;

const i18n = createInstance();

let initPromise: Promise<typeof i18n> | null = null;

export const initI18n = async () => {
  if (i18n.isInitialized) {
    return i18n;
  }

  if (!initPromise) {
    initPromise = i18n
      .use(initReactI18next)
      .init({
        compatibilityJSON: 'v4',
        resources,
        lng: DEFAULT_LANGUAGE,
        fallbackLng: DEFAULT_LANGUAGE,
        supportedLngs: ['en', 'ar'],
        returnNull: false,
        interpolation: {
          escapeValue: false,
        },
      })
      .then(() => i18n);
  }

  await initPromise;
  return i18n;
};

export default i18n;
