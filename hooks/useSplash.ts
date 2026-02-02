import { useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter } from 'expo-router';

/**
 * Manages splash screen visibility.
 * Phase 1 (fast): Hydrate stores and render router → hide splash
 * Phase 2 (async): Sync operations happen after first render (handled by useCloudSync)
 */
export const useSplash = () => {
  const router = useRouter();
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
        // Wait a tiny bit for router to be ready (non-blocking)
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

    // Timeout fallback: hide splash after max 2 seconds regardless
    timeoutRef.current = setTimeout(() => {
      console.log('[Splash] Timeout reached, forcing hide');
      hideSplash();
    }, 2000) as unknown as NodeJS.Timeout;


    // Hide splash when router is ready (or immediately if already ready)
    if (router) {
      hideSplash();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [router]);

  return {};
};
