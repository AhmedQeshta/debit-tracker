import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useSyncStore } from '@/store/syncStore';
import { StartupTimings } from '@/types/common';
import { useAuth } from '@clerk/clerk-expo';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';


/**
 * Central app bootstrap hook that orchestrates:
 * 1. Store hydration (Zustand persist)
 * 2. Splash screen hide (800ms max)
 * 3. NetInfo subscription (non-blocking)
 * 4. Auth subscription (non-blocking)
 * 5. Background sync (only when online + syncEnabled + signedIn)
 */
export const useAppBootstrap = () =>
{
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { syncEnabled, network } = useSyncStore();
  const hasHiddenSplashRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timingsRef = useRef<StartupTimings>({
    hydrateStart: Date.now(),
    hydrateEnd: null,
    splashHide: null,
    firstRender: null,
    syncStart: null,
    syncEnd: null,
  });

  // Get sync functions from useCloudSync
  const { syncNow } = useCloudSync();

  // Use network state from syncStore (updated by both AppBootstrap and useCloudSync)
  const isOnline = network.isConnected ?? true;

  // Step 1: Track store hydration
  // Zustand persist middleware hydrates automatically, but we track when it's ready
  useEffect(() =>
  {
    // Zustand persist completes synchronously on first access
    // We consider hydration complete after first render
    const hydrateEnd = Date.now();
    timingsRef.current.hydrateEnd = hydrateEnd;
    const hydrateDuration = hydrateEnd - timingsRef.current.hydrateStart;
    console.log(`[Startup] Store hydration complete in ${hydrateDuration}ms`);
  }, []);

  // Step 2: Hide splash screen (800ms max timeout)
  useEffect(() =>
  {
    const hideSplash = async () =>
    {
      if (hasHiddenSplashRef.current) return;
      hasHiddenSplashRef.current = true;

      // Clear timeout if it exists
      if (timeoutRef.current)
      {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      try
      {
        // Small delay to ensure router is ready (non-blocking)
        await new Promise((resolve) => setTimeout(resolve, 50));
        await SplashScreen.hideAsync();
        const splashHideTime = Date.now();
        timingsRef.current.splashHide = splashHideTime;
        const splashDuration = splashHideTime - timingsRef.current.hydrateStart;
        console.log(`[Startup] Splash hidden in ${splashDuration}ms`);
      } catch (e)
      {
        console.warn('[Startup] Error hiding splash:', e);
        // Force hide even on error
        try
        {
          await SplashScreen.hideAsync();
        } catch { }
      }
    };

    // Timeout fallback: hide splash after max 800ms regardless
    timeoutRef.current = setTimeout(() =>
    {
      console.log('[Startup] Timeout reached (800ms), forcing splash hide');
      hideSplash();
    }, 800) as unknown as NodeJS.Timeout;

    // Hide splash immediately (stores are already hydrated by Zustand)
    hideSplash();

    return () =>
    {
      if (timeoutRef.current)
      {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Step 3: Subscribe to NetInfo (non-blocking listener)
  useEffect(() =>
  {
    const updateNetworkState = (state: NetInfoState) =>
    {
      const nowOnline = !!state.isConnected;

      // Update syncStore network state
      useSyncStore.getState().setNetworkState({
        isConnected: nowOnline,
        isInternetReachable: typeof state.isInternetReachable === 'boolean' ? state.isInternetReachable : undefined,
        type: state.type,
      });

      if (nowOnline)
      {
        console.log('[Startup] Network: Online');
      } else
      {
        console.log('[Startup] Network: Offline');
      }
    };

    const unsubscribe = NetInfo.addEventListener((state) =>
    {
      updateNetworkState(state);
    });

    // Initial check (non-blocking)
    NetInfo.fetch().then((state) =>
    {
      updateNetworkState(state);
    }).catch((e) =>
    {
      console.warn('[Startup] NetInfo.fetch error:', e);
      // Default to offline if we can't check
      useSyncStore.getState().setNetworkState({
        isConnected: false,
        isInternetReachable: false,
        type: undefined,
      });
    });

    return unsubscribe;
  }, []);

  // Step 4 & 5: Trigger sync in background ONLY when conditions are met
  // This runs after first render, non-blocking
  useEffect(() =>
  {
    // Track first render
    if (timingsRef.current.firstRender === null)
    {
      timingsRef.current.firstRender = Date.now();
      const firstRenderDuration = timingsRef.current.firstRender - timingsRef.current.hydrateStart;
      console.log(`[Startup] First render in ${firstRenderDuration}ms`);
    }

    // Only sync when ALL conditions are met:
    // - Auth is loaded
    // - User is signed in
    // - Sync is enabled
    // - Network is online
    const shouldSync =
      isAuthLoaded &&
      isSignedIn &&
      syncEnabled &&
      isOnline;

    if (shouldSync)
    {
      // Trigger sync in background (non-blocking)
      const syncStartTime = Date.now();
      timingsRef.current.syncStart = syncStartTime;
      console.log('[Startup] Triggering background sync...');

      syncNow()
        .then(() =>
        {
          const syncEndTime = Date.now();
          timingsRef.current.syncEnd = syncEndTime;
          const syncDuration = syncEndTime - (timingsRef.current.syncStart || syncEndTime);
          console.log(`[Startup] Background sync completed in ${syncDuration}ms`);
        })
        .catch((e) =>
        {
          console.warn('[Startup] Background sync failed (non-blocking):', e);
          const syncEndTime = Date.now();
          timingsRef.current.syncEnd = syncEndTime;
        });
    } else
    {
      if (!isOnline)
      {
        console.log('[Startup] Sync skipped: offline');
      } else if (!isAuthLoaded)
      {
        console.log('[Startup] Sync skipped: auth not loaded');
      } else if (!isSignedIn)
      {
        console.log('[Startup] Sync skipped: not signed in');
      } else if (!syncEnabled)
      {
        console.log('[Startup] Sync skipped: sync disabled');
      }
    }
  }, [isAuthLoaded, isSignedIn, syncEnabled, isOnline, syncNow]);

  // Log final startup summary
  useEffect(() =>
  {
    const timings = timingsRef.current;
    if (timings.splashHide && timings.firstRender)
    {
      const totalStartup = timings.splashHide - timings.hydrateStart;
      console.log(`[Startup] Total startup time: ${totalStartup}ms`);
      console.log(`[Startup] Summary:`, {
        hydrate: timings.hydrateEnd ? `${timings.hydrateEnd - timings.hydrateStart}ms` : 'N/A',
        splashHide: timings.splashHide ? `${timings.splashHide - timings.hydrateStart}ms` : 'N/A',
        firstRender: timings.firstRender ? `${timings.firstRender - timings.hydrateStart}ms` : 'N/A',
        sync: timings.syncStart && timings.syncEnd
          ? `${timings.syncEnd - timings.syncStart}ms`
          : 'skipped',
      });
    }
  }, [timingsRef.current.splashHide, timingsRef.current.firstRender]);

  return {
    isOnline,
    isAuthLoaded,
    isSignedIn,
  };
};

