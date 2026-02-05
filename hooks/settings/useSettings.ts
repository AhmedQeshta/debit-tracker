import { Alert } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { useSyncStatus } from '@/hooks/sync/useSyncStatus';
import Constants from 'expo-constants';
import { useFriendsStore } from '@/store/friendsStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useBudgetStore } from '@/store/budgetStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSettings = () =>
{

  const { openDrawer } = useDrawerContext();
  const { isLoaded, isSignedIn, signOut } = useAuth();
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

  const handleSignOut = () =>
  {
    if (!isLoaded)
    {
      Alert.alert('Error', 'Please wait for authentication to load.');
      return;
    }

    if (!isSignedIn)
    {
      Alert.alert('Info', 'You are not signed in.');
      router.push('/(auth)/sign-in');
      return;
    }

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () =>
          {
            try
            {
              // Sign out from Clerk
              await signOut();

              // Navigate to login - use replace to prevent going back
              router.replace('/(auth)/sign-in');
            } catch (error: any)
            {
              console.error('Sign out error:', error);
              const errorMessage = error?.errors?.[0]?.message || error?.message || 'Failed to sign out. Please try again.';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleClearLocalData = () =>
  {
    Alert.alert(
      'Clear Local Data',
      'This will delete all your local data including friends, transactions, and budgets. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () =>
          {
            try
            {
              // Clear all stores using their set methods
              useFriendsStore.getState().setFriends([]);
              useTransactionsStore.getState().setTransactions([]);
              useBudgetStore.getState().setBudgets([]);

              // Clear AsyncStorage (this will also clear persisted Zustand state)
              await AsyncStorage.clear();

              Alert.alert('Success', 'All local data has been cleared.');
            } catch (error)
            {
              console.error('Clear data error:', error);
              Alert.alert('Error', 'Failed to clear local data. Please try again.');
            }
          },
        },
      ]
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
    handleSignOut,
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