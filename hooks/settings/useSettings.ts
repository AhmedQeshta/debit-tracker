import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';
import { useToast } from '@/contexts/ToastContext';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { useSyncStatus } from '@/hooks/sync/useSyncStatus';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useAuth, useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';

export const useSettings = () =>
{

  const { openDrawer } = useDrawerContext();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const {
    syncEnabled,
    setSyncEnabled,
    syncStatus,
    lastSync,
    isLoggedIn,
  } = useSyncStatus();

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess, toastError } = useToast();


  const handleClearLocalData = () =>
  {
    showConfirm(
      'Clear Local Data',
      'This will delete all your local data including friends, transactions, and budgets. This action cannot be undone. Are you sure?',
      async () =>
      {
        try
        {
          // Clear all stores using their set methods
          useFriendsStore.getState().setFriends([]);
          useTransactionsStore.getState().setTransactions([]);
          useBudgetStore.getState().setBudgets([]);

          // Clear AsyncStorage (this will also clear persisted Zustand state)
          await AsyncStorage.clear();

          toastSuccess('All local data has been cleared.');
        } catch (error)
        {
          console.error('Clear data error:', error);
          toastError('Failed to clear local data. Please try again.');
        }
      },
      { confirmText: 'Clear' }
    );
  };

  const handleSignIn = () =>
  {
    router.push('/(auth)/sign-in');
  };

  const formatLastSync = (timestamp: number | null) =>
  {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getSyncStatusText = () =>
  {
    if (!syncEnabled) return 'Disabled';
    if (!isLoggedIn) return 'Not signed in';
    if (syncStatus === 'pulling') return 'Pulling...';
    if (syncStatus === 'pushing') return 'Pushing...';
    if (syncStatus === 'error') return 'Error';
    if (syncStatus === 'success') return 'Synced';
    return 'Idle';
  };


  return {
    handleClearLocalData,
    handleSignIn,
    formatLastSync,
    getSyncStatusText,
    appVersion,
    isLoaded,
    isSignedIn,
    user,
    router,
    syncEnabled,
    setSyncEnabled,
    syncStatus,
    lastSync,
    isLoggedIn,
    openDrawer
  };
};