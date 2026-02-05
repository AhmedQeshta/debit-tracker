import { useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';

/**
 * Manages splash screen visibility.
 * Phase 1 (fast): Hydrate stores and render router → hide splash
 * Phase 2 (async): Sync operations happen after first render (handled by useCloudSync)
 * 
 * NOTE: This hook is kept for backward compatibility, but AppBootstrap handles splash now.
 */
export const useSplash = () => {
  const hasHiddenRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const hideSplash = async () => {
      if (hasHiddenRef.current) return;
      hasHiddenRef.current = true;

      // Clear timeout if it exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      try {
        // Small delay to ensure router is ready (non-blocking)
        // Stores are already hydrated by Zustand persist middleware
        await new Promise((resolve) => setTimeout(resolve, 50));
        await SplashScreen.hideAsync();
        console.log('[Splash] Hidden after hydration');
      } catch (e) {
        console.warn('[Splash] Error hiding splash:', e);
        // Force hide even on error
        try {
          await SplashScreen.hideAsync();
        } catch {}
      }
    };

    // Timeout fallback: hide splash after max 800ms regardless
    timeoutRef.current = setTimeout(() => {
      console.log('[Splash] Timeout reached (800ms), forcing hide');
      hideSplash();
    }, 800) as unknown as NodeJS.Timeout;

    // Hide splash immediately (stores are already hydrated by Zustand)
    hideSplash();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {};
};
