import { getDeviceLanguage, resolveSupportedLanguage } from '@/i18n/language';
import { SupportedLanguage } from '@/types/language';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { I18nManager } from 'react-native';
import i18n from './index';

const LANGUAGE_STORAGE_KEY = 'app-language';

export const loadSavedLanguage = async (): Promise<SupportedLanguage> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (savedLanguage) {
      const resolvedSavedLanguage = resolveSupportedLanguage(savedLanguage);
      await i18n.changeLanguage(resolvedSavedLanguage);
      await applyRTLIfNeeded(resolvedSavedLanguage);
      return resolvedSavedLanguage;
    }

    const deviceLanguage = getDeviceLanguage();
    const resolvedLanguage = resolveSupportedLanguage(deviceLanguage);

    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, resolvedLanguage);
    await i18n.changeLanguage(resolvedLanguage);
    await applyRTLIfNeeded(resolvedLanguage);

    return resolvedLanguage;
  } catch (error) {
    console.warn('[i18n] Failed to load saved language, falling back to English:', error);
    await i18n.changeLanguage('en');
    return 'en';
  }
};

export const applyRTLIfNeeded = async (lang: SupportedLanguage) => {
  const shouldBeRTL = lang === 'ar';
  const isRTLChanged = I18nManager.isRTL !== shouldBeRTL;

  if (!isRTLChanged) {
    return;
  }

  I18nManager.allowRTL(shouldBeRTL);
  I18nManager.forceRTL(shouldBeRTL);

  try {
    await Updates.reloadAsync();
  } catch (error) {
    console.warn('[i18n] Failed to reload app after direction change:', error);
  }
};

export const setLanguage = async (lang: SupportedLanguage) => {
  const resolvedLanguage = resolveSupportedLanguage(lang);

  try {
    await i18n.changeLanguage(resolvedLanguage);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, resolvedLanguage);
    await applyRTLIfNeeded(resolvedLanguage);
  } catch (error) {
    console.warn('[i18n] Failed to set language:', error);
    await i18n.changeLanguage('en');
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
  }
};

export const getSavedLanguage = async (): Promise<SupportedLanguage | null> => {
  try {
    const value = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return value ? resolveSupportedLanguage(value) : null;
  } catch {
    return null;
  }
};

export const LANGUAGE_STORAGE = {
  KEY: LANGUAGE_STORAGE_KEY,
};
