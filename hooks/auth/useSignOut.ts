import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useSyncStore } from '@/store/syncStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const SIGN_OUT_TIMEOUT_MS = 10000;

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

    useFriendsStore.getState().setFriends([]);
    useTransactionsStore.getState().setTransactions([]);
    useBudgetStore.getState().setBudgets([]);

    // Ensure persisted friend cache is removed so next login hydrates fresh cloud values.
    await AsyncStorage.removeItem('friends-storage');
  };

  const handleAuthAction = () => {
    if (isSigningOut) {
      return;
    }

    if (!isSignedIn) {
      router.push('/(auth)/sign-in');
      return;
    }

    showConfirm(
      'Sign Out',
      'Are you sure you want to sign out?',
      async () => {
        const syncState = useSyncStore.getState();
        if (syncState.isSigningOut) {
          return;
        }

        syncState.setIsSigningOut(true);

        try {
          await withTimeout(
            signOut(),
            SIGN_OUT_TIMEOUT_MS,
            'Sign out timed out. Please try again.',
          );

          await clearLocalSessionData();
          toastSuccess('Signed out');

          // Use replace to avoid returning to authed screens with back navigation.
          router.replace('/(auth)/sign-in');
          closeDrawer && closeDrawer();
        } catch (error: any) {
          console.error('Sign out error:', error);
          toastError('Sign out failed. Try again.');
        } finally {
          useSyncStore.getState().setIsSigningOut(false);
        }
      },
      { confirmText: 'Sign Out' },
    );
  };

  return {
    handleAuthAction,
    isSigningOut,
  };
};
