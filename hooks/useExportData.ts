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
import { Alert } from 'react-native';

const chooseDeliveryMode = (): Promise<ExportDeliveryMode | 'cancel'> => {
  return new Promise((resolve) => {
    Alert.alert('Export', 'How do you want to continue?', [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => resolve('cancel'),
      },
      {
        text: 'Save to device',
        onPress: () => resolve('save'),
      },
      {
        text: 'Share',
        onPress: () => resolve('share'),
      },
    ]);
  });
};

export const useExportData = () => {
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
    if (friendsSelected && budgetsSelected) return 'Friends + Budgets';
    if (friendsSelected) return 'Friends only';
    if (budgetsSelected) return 'Budgets only';
    return 'No dataset selected';
  }, [friendsSelected, budgetsSelected]);

  const handleExport = async () => {
    if (!friendsSelected && !budgetsSelected) {
      toastError('Please select at least one dataset.');
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
      toastInfo('Preparing export...');

      const deliveryMode = await chooseDeliveryMode();
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

      const fileCountText = result.files.length === 1 ? '1 file' : `${result.files.length} files`;
      if (deliveryMode === 'save') {
        const savedPath = result.files[0]?.uri || 'unknown path';
        toastSuccess('Export saved');
        Alert.alert('Export saved', `Saved ${fileCountText}\n${savedPath}`, [
          {
            text: 'Share file(s)',
            onPress: () => {
              shareSavedExportFiles(result.files).catch((error) => {
                console.error('[ExportScreen] Share after save failed:', error);
                toastError(`Couldn't export. ${error?.message || 'Unable to share files.'}`);
              });
            },
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]);
      } else {
        toastSuccess(`Export complete: ${fileCountText} shared.`);
      }
    } catch (error: any) {
      const message = error?.message || 'Unknown error';
      console.error('[ExportScreen] Export failed:', error);
      toastError(`Couldn't export. ${message}`);
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
