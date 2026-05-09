import { useTheme } from '@/contexts/ThemeContext';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { useSyncStatus } from '@/hooks/sync/useSyncStatus';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { setLanguage } from '@/i18n/languageService';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { ThemeMode } from '@/theme/types';
import { useAuth, useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

const SETTINGS_LOAD_TIMEOUT_MS = 10000;

export const useSettings = () => {
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const { t, i18n } = useTranslation();
  const { themeMode, setThemeMode } = useTheme();

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
    isOnline,
    isSyncing,
    lastError,
    pullProgress,
    syncQueueNow,
  } = useSyncStatus();

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess, toastError } = useToast();

  const handleClearLocalData = () => {
    showConfirm(
      t('settings.clearDataConfirm.title'),
      t('settings.clearDataConfirm.message'),
      async () => {
        try {
          // Clear all stores using their set methods
          useFriendsStore.getState().setFriends([]);
          useTransactionsStore.getState().setTransactions([]);
          useBudgetStore.getState().setBudgets([]);

          // Clear AsyncStorage (this will also clear persisted Zustand state)
          await AsyncStorage.clear();

          toastSuccess(t('toast.settings.clearDataSuccess'));
        } catch (error) {
          console.error('Clear data error:', error);
          toastError(t('toast.settings.clearDataFailed'));
        }
      },
      {
        confirmText: t('settings.clearDataConfirm.confirm'),
        cancelText: t('common.actions.cancel'),
      },
    );
  };

  const handleSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  const handleSync = async () => {
    const result = await syncQueueNow();

    if (result?.blockedReason === 'offline') {
      toastError('No internet. Connect and try again.');
      return;
    }

    if ((result?.failedCount || 0) > 0) {
      toastError(`Some items failed to sync (${result.failedCount}).`);
      return;
    }

    toastSuccess('All changes synced');
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return t('settings.statusValues.never');
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('settings.statusValues.justNow');
    if (diffMins < 60) return t('settings.statusValues.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('settings.statusValues.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('settings.statusValues.daysAgo', { count: diffDays });
    return date.toLocaleDateString();
  };

  const getSyncStatusText = () => {
    if (!syncEnabled) return t('settings.statusValues.disabled');
    if (!isLoggedIn || !isOnline) return t('settings.statusValues.offline');
    if (isSyncing || syncStatus === 'pulling' || syncStatus === 'pushing') {
      return t('settings.statusValues.syncing');
    }
    if (syncStatus === 'error') return t('settings.statusValues.error');
    if (syncStatus === 'success') return t('settings.statusValues.idle');
    return t('settings.statusValues.idle');
  };

  const currentLanguage = i18n.language.startsWith('ar') ? 'ar' : 'en';

  const handleLanguageChange = () => {
    const targetLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    const targetLanguageLabel =
      targetLanguage === 'ar'
        ? t('settings.languageOptions.arabic')
        : t('settings.languageOptions.english');

    Alert.alert(
      t('settings.languageOptions.pickerTitle'),
      t('settings.languageOptions.pickerMessage'),
      [
        {
          text: t('common.actions.cancel'),
          style: 'cancel',
        },
        {
          text: targetLanguageLabel,
          onPress: () => {
            void setLanguage(targetLanguage);
          },
        },
      ],
    );
  };

  const handleThemeChange = (mode: ThemeMode) => {
    void setThemeMode(mode);
  };

  useEffect(() => {
    if (isLoaded) {
      setLoadTimedOut(false);
      return;
    }

    const timeout = setTimeout(() => {
      setLoadTimedOut(true);
    }, SETTINGS_LOAD_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [isLoaded]);

  const showAuthSkeleton = !isLoaded && !loadTimedOut;

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
    isOnline,
    isSyncing,
    lastError,
    pullProgress,
    handleSync,
    openDrawer,
    loadTimedOut,
    showAuthSkeleton,
    currentLanguage,
    handleLanguageChange,
    themeMode,
    handleThemeChange,
    t,
  };
};
