import { syncService } from '@/services/syncService';
import { subscribeToNetwork } from '@/services/net';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@clerk/clerk-expo';
import { useSyncStore } from '@/store/syncStore';

export const useSplash = () => {
  const { getToken, isSignedIn } = useAuth();
  const { syncEnabled } = useSyncStore();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function prepare() {
      try {
        // Initial sync attempt - only push locally stored changes if any
        // Only sync if enabled and user is signed in
        if (syncEnabled && isSignedIn) {
          await syncService.pushChanges(getToken);
        }

        // Subscribe to network changes to trigger sync
        unsubscribe = subscribeToNetwork((isConnected) => {
          if (isConnected && syncEnabled && isSignedIn) {
            syncService.pushChanges(getToken);
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
  }, [getToken, isSignedIn, syncEnabled]);

  return {};
};
