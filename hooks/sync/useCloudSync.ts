import { useEffect, useState, useRef, useCallback } from 'react';
import { useSyncStore } from '@/store/syncStore';
import { syncService } from '@/services/syncService';
import { useAuth, useUser } from '@clerk/clerk-expo';
import NetInfo from '@react-native-community/netinfo';
import { setSupabaseToken, clearSupabaseToken, hasSupabaseToken } from '@/lib/supabase';
import { getFreshSupabaseJwt } from '@/services/authSync';
import { ensureAppUser } from '@/services/userService';

export const useCloudSync = () => {
  const { syncEnabled, setSyncEnabled, isSyncing, setSyncing, lastSync, queue } = useSyncStore();
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  const [isOnline, setIsOnline] = useState(true);
  const tokenBoundRef = useRef(false);
  const initInProgressRef = useRef(false);
  const lastAutoSyncRef = useRef<{ userId: string | null; syncEnabled: boolean }>({ userId: null, syncEnabled: false });

  // Clear token and cloudUserId when logged out or sync disabled
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !syncEnabled) {
      clearSupabaseToken();
      tokenBoundRef.current = false;
      useSyncStore.getState().setCloudUserId(null);
      useSyncStore.getState().setSyncStatus(null); // Clear sync status
      // Reset auto-sync tracking
      lastAutoSyncRef.current = { userId: null, syncEnabled: false };
      if (!isSignedIn) {
        console.log('[Sync] Token cleared: user logged out');
      } else if (!syncEnabled) {
        console.log('[Sync] Token cleared: sync disabled');
      }
    }
  }, [isLoaded, isSignedIn, syncEnabled]);

  // Bind token and ensure user record - reordered to prevent race condition
  // STRICT GATING: Only runs when syncEnabled is true
  useEffect(() => {
    // Prevent multiple simultaneous initializations
    if (initInProgressRef.current) {
      return;
    }

    const initUser = async () => {
      // Step 1: STRICT CHECK - If sync disabled -> clear token and return IMMEDIATELY
      // This must be the FIRST check to prevent any sync operations when disabled
      if (!syncEnabled) {
        setSupabaseToken(null);
        tokenBoundRef.current = false;
        initInProgressRef.current = false;
        console.log('[Sync] ensureUserRecord skipped: sync disabled (strict gate)');
        return; // Do NOT proceed with any sync operations
      }

      // Step 2: Check if not signed in -> clear token and return
      if (!isSignedIn) {
        setSupabaseToken(null);
        tokenBoundRef.current = false;
        initInProgressRef.current = false;
        console.log('[Sync] ensureUserRecord skipped: user not signed in');
        return;
      }

      // Step 3: Check if not loaded -> return early
      if (!isLoaded) {
        initInProgressRef.current = false;
        console.log('[Sync] ensureUserRecord skipped: Clerk not loaded');
        return;
      }

      // Step 4: Check if no user object -> return early
      if (!user || !userId) {
        initInProgressRef.current = false;
        console.log('[Sync] ensureUserRecord skipped: no user object');
        return;
      }

      // Step 5: Check if token is already bound - skip if so
      if (tokenBoundRef.current && hasSupabaseToken()) {
        initInProgressRef.current = false;
        console.log('[Sync] Token already bound, skipping token fetch');
        // Still ensure user record exists
        try {
          const result = await ensureAppUser(user, getToken);
          if (result.skipped) {
            console.log(`[Sync] ensureAppUser skipped: ${result.reason}`);
          } else if (result.ok) {
            console.log('[Sync] App user ensured successfully');
          }
        } catch (e) {
          console.error('[Sync] Failed to ensure app user:', e);
        }
        return;
      }

      // Step 6: Get token with 'supabase' template
      let token: string | null = null;
      try {
        const result = await getFreshSupabaseJwt(getToken);
        token = result.token;
        
        // Handle template missing error
        if (result.error === 'template_missing') {
          console.error('[Sync] JWT template missing - setting sync status to needs_config');
          useSyncStore.getState().setSyncStatus('needs_config');
          initInProgressRef.current = false;
          return; // Don't proceed with ensureAppUser
        }
        
        // Handle other errors
        if (result.error === 'other' && !token) {
          console.warn('[Sync] Failed to get token from Clerk - ensureAppUser skipped');
          initInProgressRef.current = false;
          return;
        }
      } catch (e) {
        console.error('[Sync] Failed to get token:', e);
        initInProgressRef.current = false;
        return;
      }

      // Step 7: If no token -> log warning, do NOT throw, do NOT call ensureAppUser
      if (!token) {
        console.warn('[Sync] No token available from Clerk - ensureAppUser skipped');
        initInProgressRef.current = false;
        return;
      }
      
      // Clear any previous error status on successful token fetch
      useSyncStore.getState().setSyncStatus(null);

      // Step 8: Double-check syncEnabled is still true (it might have changed)
      // This prevents race conditions where sync is disabled while token is being fetched
      if (!syncEnabled) {
        clearSupabaseToken();
        tokenBoundRef.current = false;
        initInProgressRef.current = false;
        console.log('[Sync] ensureAppUser skipped: sync disabled during token fetch');
        return;
      }

      tokenBoundRef.current = true;

      // Step 9: Final check - ensure sync is still enabled before calling ensureAppUser
      if (!syncEnabled) {
        clearSupabaseToken();
        tokenBoundRef.current = false;
        initInProgressRef.current = false;
        console.log('[Sync] ensureAppUser skipped: sync disabled before ensureAppUser');
        return;
      }

      // Step 10: Then call ensureAppUser(user) - now token is ready AND sync is enabled
      try {
        const result = await ensureAppUser(user, getToken);
        if (result.skipped) {
          console.log(`[Sync] ensureAppUser skipped: ${result.reason}`);
        } else if (result.ok) {
          console.log('[Sync] App user ensured successfully, cloudUserId stored');
        }
      } catch (e) {
        console.error('[Sync] Failed to ensure app user:', e);
      } finally {
        initInProgressRef.current = false;
      }
    };

    initInProgressRef.current = true;
    initUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, userId, syncEnabled]); // Removed 'user' and 'getToken' - use userId instead

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOnline = isOnline;
      const nowOnline = !!state.isConnected;
      setIsOnline(nowOnline);
      // Only trigger sync when coming back online (not on every network change)
      if (nowOnline && !wasOnline && syncEnabled && isSignedIn && isLoaded) {
        syncNow();
      }
    });
    // Initial check
    NetInfo.fetch().then((state) => setIsOnline(!!state.isConnected));
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncEnabled, isSignedIn, isLoaded]); // syncNow is stable via useCallback

  // Auto-sync on syncEnabled change, login, or reconnect
  useEffect(() => {
    // Only sync if conditions are met AND something actually changed
    const shouldSync = 
      syncEnabled && 
      isSignedIn && 
      userId && 
      isOnline && 
      isLoaded &&
      (lastAutoSyncRef.current.userId !== userId || 
       lastAutoSyncRef.current.syncEnabled !== syncEnabled);
    
    if (shouldSync) {
      lastAutoSyncRef.current = { userId, syncEnabled };
      syncNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncEnabled, isSignedIn, userId, isOnline, isLoaded]);

  const syncNow = useCallback(async () => {
    // STRICT GATING: Check syncEnabled FIRST
    if (!syncEnabled) {
      console.log('[Sync] syncNow skipped: sync disabled (strict gate)');
      return;
    }

    if (isSyncing || !userId || !isOnline || !isLoaded || !isSignedIn) {
      return;
    }

    // Double-check syncEnabled is still true
    if (!syncEnabled) {
      console.log('[Sync] syncNow skipped: sync disabled during checks');
      return;
    }

    // Ensure token is bound before syncing
    if (!tokenBoundRef.current || !hasSupabaseToken()) {
      try {
        const result = await getFreshSupabaseJwt(getToken);
        
        // Handle template missing error
        if (result.error === 'template_missing') {
          console.error('[Sync] JWT template missing during sync - setting sync status to needs_config');
          useSyncStore.getState().setSyncStatus('needs_config');
          return;
        }
        
        if (result.token) {
          // Final check before binding token
          if (!syncEnabled) {
            console.log('[Sync] syncNow skipped: sync disabled during token fetch');
            return;
          }
          tokenBoundRef.current = true;
          // Clear error status on successful token fetch
          useSyncStore.getState().setSyncStatus(null);
        } else {
          console.warn('[Sync] No token available - sync skipped');
          return;
        }
      } catch (e) {
        console.error('[Sync] Failed to get token for sync:', e);
        return;
      }
    }

    // Final check before syncing
    if (!syncEnabled) {
      console.log('[Sync] syncNow skipped: sync disabled before syncAll');
      return;
    }

    // Get cloudUserId from store
    const { cloudUserId } = useSyncStore.getState();
    if (!cloudUserId) {
      console.log('[Sync] syncNow skipped: no cloudUserId');
      return;
    }

    setSyncing(true);
    try {
      await syncService.syncAll(cloudUserId, getToken);
    } catch (e) {
      console.error('[Sync] Sync failed:', e);
    } finally {
      setSyncing(false);
    }
  }, [syncEnabled, isSyncing, userId, isOnline, isLoaded, isSignedIn, getToken]);

  // Expose helpers
  const hasPendingChanges = queue.length > 0;

  return {
    syncEnabled,
    setSyncEnabled,
    syncNow,
    isSyncing,
    lastSync,
    hasPendingChanges,
    isOnline,
    isLoggedIn: !!isSignedIn,
  };
};
