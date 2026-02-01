import { useEffect, useState, useRef } from 'react';
import { useSyncStore } from '@/store/syncStore';
import { syncService } from '@/services/syncService';
import { useAuth, useUser } from '@clerk/clerk-expo';
import NetInfo from '@react-native-community/netinfo';
import { setSupabaseToken } from '@/lib/supabase';

export const useCloudSync = () => {
  const { syncEnabled, setSyncEnabled, isSyncing, setSyncing, lastSync, queue } = useSyncStore();
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  const [isOnline, setIsOnline] = useState(true);
  const tokenBoundRef = useRef(false);

  // Clear token when logged out or sync disabled
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !syncEnabled) {
      setSupabaseToken(null);
      tokenBoundRef.current = false;
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
    const initUser = async () => {
      // Step 1: STRICT CHECK - If sync disabled -> clear token and return IMMEDIATELY
      // This must be the FIRST check to prevent any sync operations when disabled
      if (!syncEnabled) {
        setSupabaseToken(null);
        tokenBoundRef.current = false;
        console.log('[Sync] ensureUserRecord skipped: sync disabled (strict gate)');
        return; // Do NOT proceed with any sync operations
      }

      // Step 2: Check if not signed in -> clear token and return
      if (!isSignedIn) {
        setSupabaseToken(null);
        tokenBoundRef.current = false;
        console.log('[Sync] ensureUserRecord skipped: user not signed in');
        return;
      }

      // Step 3: Check if not loaded -> return early
      if (!isLoaded) {
        console.log('[Sync] ensureUserRecord skipped: Clerk not loaded');
        return;
      }

      // Step 4: Check if no user object -> return early
      if (!user) {
        console.log('[Sync] ensureUserRecord skipped: no user object');
        return;
      }

      // Step 5: Await getToken() first (before setting token)
      let token: string | null = null;
      try {
        token = await getToken();
      } catch (e) {
        console.error('[Sync] Failed to get token:', e);
        return;
      }

      // Step 6: If no token -> log warning, do NOT throw, do NOT call ensureUserRecord
      if (!token) {
        console.warn('[Sync] No token available from Clerk - ensureUserRecord skipped');
        return;
      }

      // Step 7: Double-check syncEnabled is still true (it might have changed)
      // This prevents race conditions where sync is disabled while token is being fetched
      if (!syncEnabled) {
        setSupabaseToken(null);
        tokenBoundRef.current = false;
        console.log('[Sync] ensureUserRecord skipped: sync disabled during token fetch');
        return;
      }

      // Step 8: setSupabaseToken(token) - bind token
      setSupabaseToken(token);
      tokenBoundRef.current = true;

      // Step 9: Final check - ensure sync is still enabled before calling ensureUserRecord
      if (!syncEnabled) {
        setSupabaseToken(null);
        tokenBoundRef.current = false;
        console.log('[Sync] ensureUserRecord skipped: sync disabled before ensureUserRecord');
        return;
      }

      // Step 10: Then call ensureUserRecord(user) - now token is ready AND sync is enabled
      try {
        const result = await syncService.ensureUserRecord(user, getToken);
        if (result.skipped) {
          console.log(`[Sync] ensureUserRecord skipped: ${result.reason}`);
        } else if (result.ok) {
          console.log('[Sync] User record ensured successfully');
        }
      } catch (e) {
        console.error('[Sync] Failed to ensure user record:', e);
      }
    };

    initUser();
  }, [isLoaded, isSignedIn, user, syncEnabled, getToken]);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
      if (state.isConnected && syncEnabled && isSignedIn && isLoaded) {
        syncNow();
      }
    });
    // Initial check
    NetInfo.fetch().then((state) => setIsOnline(!!state.isConnected));
    return unsubscribe;
  }, [syncEnabled, isSignedIn, isLoaded]);

  // Auto-sync on syncEnabled change, login, or reconnect
  useEffect(() => {
    if (syncEnabled && isSignedIn && userId && isOnline && isLoaded) {
      syncNow();
    }
  }, [syncEnabled, isSignedIn, userId, isOnline, isLoaded]);

  const syncNow = async () => {
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
    if (!tokenBoundRef.current) {
      try {
        const token = await getToken();
        if (token) {
          // Final check before binding token
          if (!syncEnabled) {
            console.log('[Sync] syncNow skipped: sync disabled during token fetch');
            return;
          }
          setSupabaseToken(token);
          tokenBoundRef.current = true;
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

    setSyncing(true);
    try {
      await syncService.syncAll(userId, getToken);
    } catch (e) {
      console.error('[Sync] Sync failed:', e);
    } finally {
      setSyncing(false);
    }
  };

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
