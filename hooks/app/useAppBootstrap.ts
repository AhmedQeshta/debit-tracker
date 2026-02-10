import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight bootstrap hook for fast startup.
 * - Hides splash screen immediately after mount (plus small render delay)
 * - Returns ready state
 */
export const useAppBootstrap = () => {
  const [isReady, setIsReady] = useState(false);
  const hasHiddenSplashRef = useRef(false);

  useEffect(() => {
    const bootstrap = async () => {
      // 1. Minimum delay to allow first render to paint
      await new Promise((resolve) => setTimeout(resolve, 50));

      // 2. Hide splash screen
      if (!hasHiddenSplashRef.current) {
        hasHiddenSplashRef.current = true;
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn('[Startup] Failed to hide splash:', e);
        }
      }

      setIsReady(true);
    };

    bootstrap();
  }, []);

  return { isReady };
};
