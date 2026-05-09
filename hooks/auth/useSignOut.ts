import { useCloudSync } from '@/hooks/sync/useCloudSync';import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { LANGUAGE_STORAGE } from '@/i18n/languageService';
import { getTotalUnsyncedCount, getUnsyncedCounts } from '@/lib/dashboardSelectors';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useSyncStore } from '@/store/syncStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

const SIGN_OUT_TIMEOUT_MS = 10000;
const USER_DATA_STORAGE_KEYS = [
  'friends-storage',
  'transactions-storage',
  'budget-storage',
  'sync-storage',
  LANGUAGE_STORAGE.KEY,
];

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, message: string) => {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
};

export const useSignOut = (closeDrawer?: () => void) => {
  const { isSignedIn, signOut } = useAuth();
  const { showConfirm } = useConfirmDialog();
  const { toastError, toastSuccess } = useToast();
  const { syncQueueNow } = useCloudSync();
  const isSigningOut = useSyncStore((state) => state.isSigningOut);
  const router = useRouter();

  const clearLocalSessionData = async () => {
    const syncState = useSyncStore.getState();

    // Stop sync work and clear in-memory user data to avoid stale state after logout.
    syncState.setSyncEnabled(false);
    syncState.setSyncing(false);
    syncState.setIsSyncRunning(false);
    syncState.setCloudUserId(null);
    syncState.setSyncStatus(null);
    syncState.clearQueue();
    syncState.setLastError(null);
    syncState.setLastPullAt(null);
    syncState.setHasHydratedFromCloud(false);

    useFriendsStore.getState().setFriends([]);
    useTransactionsStore.getState().setTransactions([]);
    useBudgetStore.getState().setBudgets([]);

    // Full wipe of persisted user-scoped stores to prevent cross-account data leakage.
    await AsyncStorage.multiRemove(USER_DATA_STORAGE_KEYS);
  };

  const runLogout = async (options?: { discardLocalData?: boolean }) => {
    const syncState = useSyncStore.getState();
    if (syncState.isSigningOut) {
      return;
    }

    syncState.setIsSigningOut(true);

    try {
      if (options?.discardLocalData) {
        try {
          await clearLocalSessionData();
        } catch (cleanupError) {
          console.error('Failed to clear local logout data:', cleanupError);
          throw new Error('CLEANUP_FAILED');
        }
      }

      await withTimeout(signOut(), SIGN_OUT_TIMEOUT_MS, 'Sign out timed out. Please try again.');

      toastSuccess('Signed out');

      // Use replace to avoid returning to authed screens with back navigation.
      router.replace('/(auth)/sign-in');
      closeDrawer && closeDrawer();
    } catch (error: any) {
      console.error('Sign out error:', error);
      const message =
        error?.message === 'CLEANUP_FAILED'
          ? "Couldn't clear local data. Try again."
          : 'Sign out failed. Try again.';
      toastError(message);
    } finally {
      useSyncStore.getState().setIsSigningOut(false);
    }
  };

  const syncThenSignOut = async (totalUnsynced: number) => {
    const syncState = useSyncStore.getState();
    if (syncState.isSigningOut) return;

    syncState.setIsSigningOut(true);
    syncState.setSyncStatus('pulling');

    try {
      const summary = await syncQueueNow({
        onProgress: (processed, total) => {
          useSyncStore.getState().setPullProgress(`syncing ${processed} of ${total}`);
        },
      });

      useSyncStore.getState().setPullProgress(undefined);

      if (summary.failedCount > 0 || summary.blockedReason) {
        const reasonText =
          summary.blockedReason === 'offline'
            ? "You're offline. Connect and try again."
            : summary.blockedReason === 'timeout'
              ? 'Sync timed out. Please retry.'
              : summary.blockedReason === 'rate_limited'
                ? 'Too many requests. Please retry in a few seconds.'
                : summary.blockedReason === 'auth'
                  ? 'Authentication expired. Please sign in again to sync.'
                  : summary.blockedReason === 'server'
                    ? 'Server error while syncing. Please retry.'
                    : summary.blockedReason === 'validation/conflict'
                      ? 'Some data failed validation and needs review before syncing.'
                      : 'Some changes failed to sync.';

        toastError(`Sync failed: ${reasonText}`);

        showConfirm(
          'Sync failed',
          `Sync failed: ${reasonText} Try again or sign out without syncing.`,
          () => {
            showConfirm(
              'Discard unsynced changes?',
              `This will delete ${totalUnsynced} unsynced changes from this device.`,
              () => runLogout({ discardLocalData: true }),
              { confirmText: 'Delete & Sign out', cancelText: 'Cancel' },
            );
          },
          { confirmText: 'Sign out without syncing', cancelText: 'Retry later' },
        );
        return;
      }

      await runLogout({ discardLocalData: true });
    } finally {
      useSyncStore.getState().setPullProgress(undefined);
      useSyncStore.getState().setIsSigningOut(false);
    }
  };

  const handleAuthAction = () => {
    if (isSigningOut) {
      return;
    }

    if (!isSignedIn) {
      router.push('/(auth)/sign-in');
      return;
    }

    const unsyncedCounts = getUnsyncedCounts();
    const totalUnsynced = getTotalUnsyncedCount(unsyncedCounts);

    if (totalUnsynced > 0) {
      Alert.alert(
        'Save changes before signing out?',
        `You have ${totalUnsynced} unsynced changes. We can sync them now.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign out without syncing',
            style: 'destructive',
            onPress: () => {
              showConfirm(
                'Discard unsynced changes?',
                `This will delete ${totalUnsynced} unsynced changes from this device.`,
                () => runLogout({ discardLocalData: true }),
                { confirmText: 'Delete & Sign out', cancelText: 'Cancel' },
              );
            },
          },
          {
            text: 'Sync & Sign out',
            onPress: () => {
              void syncThenSignOut(totalUnsynced);
            },
          },
        ],
        { cancelable: true },
      );
      return;
    }

    showConfirm('Sign Out', 'Are you sure you want to sign out?', () => runLogout(), {
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
    });
  };

  return {
    handleAuthAction,
    isSigningOut,
  };
};
