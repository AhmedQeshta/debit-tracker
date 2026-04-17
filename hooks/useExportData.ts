import { useToast } from '@/hooks/useToast';
import { exportAndSaveToDevice, shareSavedExportFiles } from '@/services/export/exportService';
import { useSyncStore } from '@/store/syncStore';
import {
  ExportDeliveryMode,
  ExportDetailLevel,
  ExportFormat,
  ExportScope,
  ExportSource,
} from '@/types/export';
import { useAuth } from '@clerk/clerk-expo';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

const chooseDeliveryMode = (
  t: (key: string, options?: Record<string, any>) => string,
): Promise<ExportDeliveryMode | 'cancel'> => {
  return new Promise((resolve) => {
    Alert.alert(t('exportHooks.alert.title'), t('exportHooks.alert.message'), [
      {
        text: t('common.actions.cancel'),
        style: 'cancel',
        onPress: () => resolve('cancel'),
      },
      {
        text: t('budgetExportModal.actions.saveToDevice'),
        onPress: () => resolve('save'),
      },
      {
        text: t('budgetExportModal.actions.share'),
        onPress: () => resolve('share'),
      },
    ]);
  });
};

export const useExportData = () => {
  const { t } = useTranslation();
  const { getToken } = useAuth();
  const { toastSuccess, toastError, toastInfo } = useToast();
  const { cloudUserId } = useSyncStore();
  const params = useLocalSearchParams<{ friendId?: string }>();

  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [detailLevel, setDetailLevel] = useState<ExportDetailLevel>('summary');
  const [source, setSource] = useState<ExportSource>('local');
  const [friendsSelected, setFriendsSelected] = useState(true);
  const [budgetsSelected, setBudgetsSelected] = useState(true);

  const scopedFriendId = typeof params.friendId === 'string' ? params.friendId : undefined;

  const summaryText = useMemo(() => {
    if (friendsSelected && budgetsSelected) return t('exportHooks.summary.friendsAndBudgets');
    if (friendsSelected) return t('exportHooks.summary.friendsOnly');
    if (budgetsSelected) return t('exportHooks.summary.budgetsOnly');
    return t('exportHooks.summary.none');
  }, [friendsSelected, budgetsSelected, t]);

  const handleExport = async () => {
    if (!friendsSelected && !budgetsSelected) {
      toastError(t('exportHooks.errors.selectAtLeastOneDataset'));
      return;
    }

    const scope: ExportScope = {
      friends: friendsSelected,
      budgets: budgetsSelected,
      includeBudgetItems: detailLevel === 'detailed' && budgetsSelected,
      includeFriendTransactions: detailLevel === 'detailed' && friendsSelected,
      friendId: friendsSelected ? scopedFriendId : undefined,
    };

    try {
      setIsExporting(true);
      toastInfo(t('budgetHooks.export.preparing'));

      const deliveryMode = await chooseDeliveryMode(t);
      if (deliveryMode === 'cancel') {
        return;
      }

      const result = await exportAndSaveToDevice({
        format,
        detailLevel,
        scope,
        source,
        cloudUserId,
        getToken,
        deliveryMode,
        fileNamePrefix: 'export',
      });

      result.warnings.forEach((warning) => toastInfo(warning));

      const fileCountText = t('budgetHooks.export.fileCount', { count: result.files.length });
      if (deliveryMode === 'save') {
        const savedPath = result.files[0]?.uri || t('exportHooks.unknownPath');
        toastSuccess(t('budgetHooks.export.saved'));
        Alert.alert(
          t('budgetHooks.export.saved'),
          t('budgetHooks.export.savedDetails', { fileCountText, savedPath }),
          [
            {
              text: t('budgetHooks.export.shareFiles'),
              onPress: () => {
                shareSavedExportFiles(result.files).catch((error) => {
                  console.error('[ExportScreen] Share after save failed:', error);
                  toastError(
                    t('budgetHooks.export.shareFailed', {
                      message: error?.message || t('budgetHooks.export.unableToShareFiles'),
                    }),
                  );
                });
              },
            },
            {
              text: t('common.actions.ok'),
              style: 'cancel',
            },
          ],
        );
      } else {
        toastSuccess(t('budgetHooks.export.completeShared', { fileCountText }));
      }
    } catch (error: any) {
      const message = error?.message || t('budgetHooks.export.unknownError');
      console.error('[ExportScreen] Export failed:', error);
      toastError(t('budgetHooks.export.failed', { message }));
    } finally {
      setIsExporting(false);
    }
  };

  return {
    format,
    setFormat,
    detailLevel,
    setDetailLevel,
    source,
    setSource,
    friendsSelected,
    setFriendsSelected,
    budgetsSelected,
    setBudgetsSelected,
    summaryText,
    scopedFriendId,
    handleExport,
    isExporting,
  };
};
