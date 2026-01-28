import { syncData } from "@/services/sync";
import { subscribeToNetwork } from "@/services/net";
import { useEffect } from "react";
import * as SplashScreen from 'expo-splash-screen';

export const useSplash = () => {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function prepare() {
      try {
        // Initial sync attempt
        await syncData();

        // Subscribe to network changes to trigger sync
        unsubscribe = subscribeToNetwork((isConnected) => {
          if (isConnected) {
            syncData();
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

  
  return {
  
  };
};