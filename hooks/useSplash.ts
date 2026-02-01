import { syncService } from '@/services/syncService';
import { subscribeToNetwork } from '@/services/net';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

export const useSplash = () => {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function prepare() {
      try {
        // Initial sync attempt - only push locally stored changes if any
        await syncService.pushChanges();

        // Subscribe to network changes to trigger sync
        unsubscribe = subscribeToNetwork((isConnected) => {
          if (isConnected) {
            syncService.pushChanges();
          }
        });

        // Hide splash screen after initialization
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error during app initialization:', e);
        // Hide splash screen even if there's an error
        await SplashScreen.hideAsync();
      }
    }

    prepare();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return {};
};
