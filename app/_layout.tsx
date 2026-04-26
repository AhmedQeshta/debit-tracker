import { ErrorScreen } from '@/components/ui/ErrorScreen';
import { ThemedRoot } from '@/components/ui/ThemedRoot';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { initI18n } from '@/i18n';
import { loadSavedLanguage } from '@/i18n/languageService';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrapI18n = async () => {
      await initI18n();
      await loadSavedLanguage();

      if (isMounted) {
        setIsI18nReady(true);
      }
    };

    bootstrapI18n().catch((error) => {
      console.warn('[i18n] Failed to initialize language bootstrapping:', error);
      if (isMounted) {
        setIsI18nReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!publishableKey) {
    return (
      <ErrorScreen
        title="Missing Configuration"
        message="Missing Publishable Key. Please set CLERK  PUBLISHABLE  KEY in your .env file to continue."
      />
    );
  }

  if (!isI18nReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <ThemedRoot publishableKey={publishableKey} />
    </ThemeProvider>
  );
}
